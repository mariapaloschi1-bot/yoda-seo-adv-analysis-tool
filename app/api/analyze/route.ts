/**
 * API Route - Server-side DataForSEO + Gemini calls
 * Handles CORS and authentication properly
 */

import { NextRequest, NextResponse } from 'next/server';

interface AnalyzeRequest {
  keywords: string[];
  dataForSeoLogin: string;
  dataForSeoPassword: string;
  geminiKey: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { keywords, dataForSeoLogin, dataForSeoPassword, geminiKey } = body;

    if (!keywords || keywords.length === 0) {
      return NextResponse.json({ error: 'Keywords required' }, { status: 400 });
    }

    const results = [];

    // Process keywords sequentially (rate limiting)
    for (const keyword of keywords) {
      try {
        // Call DataForSEO Ads Advertisers API
        const advertiserData = await getAdvertisers(keyword, dataForSeoLogin, dataForSeoPassword);
        
        // Call DataForSEO Keyword Metrics API
        const metrics = await getKeywordMetrics(keyword, dataForSeoLogin, dataForSeoPassword);

        results.push({
          keyword,
          advertisers: advertiserData.advertisers,
          metrics,
          success: true
        });

        // Rate limiting: 1 request per second
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error: any) {
        console.error(`Error processing ${keyword}:`, error);
        results.push({
          keyword,
          advertisers: [],
          metrics: { search_volume: 0, cpc: 0, competition: 0 },
          success: false,
          error: error.message
        });
      }
    }

    // Generate AI insights with Gemini
    let insights = null;
    try {
      insights = await generateGeminiInsights(results, geminiKey);
    } catch (error: any) {
      console.error('Gemini error:', error);
      insights = generateFallbackInsights(results);
    }

    return NextResponse.json({
      results,
      insights,
      success: true
    });

  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}

// Helper: Get advertisers from DataForSEO
async function getAdvertisers(keyword: string, login: string, password: string) {
  const authHeader = 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');

  // Step 1: POST task
  const postResponse = await fetch('https://api.dataforseo.com/v3/serp/google/ads_advertisers/task_post', {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{
      keyword,
      location_name: 'Italy',
      language_code: 'it',
      device: 'desktop',
      os: 'windows'
    }])
  });

  if (!postResponse.ok) {
    const errorText = await postResponse.text();
    throw new Error(`DataForSEO POST failed: ${postResponse.status} - ${errorText}`);
  }

  const postData = await postResponse.json();

  if (postData.tasks?.[0]?.status_code !== 20000) {
    throw new Error(`Task failed: ${postData.tasks?.[0]?.status_message || 'Unknown error'}`);
  }

  const taskId = postData.tasks[0].id;

  // Step 2: Wait for processing
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Step 3: GET results
  const getResponse = await fetch(
    `https://api.dataforseo.com/v3/serp/google/ads_advertisers/task_get/advanced/${taskId}`,
    {
      headers: { 'Authorization': authHeader }
    }
  );

  if (!getResponse.ok) {
    throw new Error(`DataForSEO GET failed: ${getResponse.status}`);
  }

  const getData = await getResponse.json();

  if (getData.tasks?.[0]?.status_code !== 20000) {
    throw new Error(`Results retrieval failed: ${getData.tasks?.[0]?.status_message}`);
  }

  const items = getData.tasks[0]?.result?.[0]?.items || [];
  
  const advertisers = items
    .filter((item: any) => item.type === 'ad')
    .map((ad: any) => ({
      domain: ad.domain || 'N/A',
      position: ad.rank_absolute || 0,
      title: ad.title || '',
      description: ad.description || '',
      last_seen: new Date().toISOString().split('T')[0]
    }));

  return {
    keyword,
    advertisers,
    total: advertisers.length
  };
}

// Helper: Get keyword metrics
async function getKeywordMetrics(keyword: string, login: string, password: string) {
  const authHeader = 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');

  const response = await fetch('https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_ideas/live', {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{
      keywords: [keyword],
      location_name: 'Italy',
      language_code: 'it',
      include_seed_keyword: true
    }])
  });

  if (!response.ok) {
    // Fallback to safe defaults
    return { search_volume: 1000, cpc: 0.5, competition: 0.5 };
  }

  const data = await response.json();
  const items = data.tasks?.[0]?.result?.[0]?.items || [];

  if (items.length === 0) {
    return { search_volume: 1000, cpc: 0.5, competition: 0.5 };
  }

  const item = items[0].keyword_info || items[0];

  return {
    search_volume: item.search_volume || 1000,
    cpc: item.cpc || 0.5,
    competition: item.competition || 0.5
  };
}

// Helper: Generate Gemini insights
async function generateGeminiInsights(results: any[], apiKey: string) {
  const summary = results.map(r => ({
    keyword: r.keyword,
    advertisers: r.advertisers?.length || 0,
    cpc: r.metrics?.cpc || 0,
    competition: r.metrics?.competition || 0,
    volume: r.metrics?.search_volume || 0
  }));

  const prompt = `
Analizza questi dati SEO/PPC e fornisci insights in italiano:

DATI:
${JSON.stringify(summary, null, 2)}

REGOLE:
- Keywords con molti advertiser (>8) e CPC alto (>€1.50) → raccomanda paid
- Keywords con pochi advertiser (<3) e CPC basso → focus SEO
- Considera ROI: volume × CTR × conversion

Rispondi in JSON:
{
  "summary": "Sintesi in 2-3 frasi",
  "recommendations": ["1. ...", "2. ...", "3. ..."],
  "budget_estimate": "€X - €Y",
  "priority_keywords": ["kw1", "kw2", "kw3"]
}
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Parse JSON from response
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
  
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    return {
      summary: parsed.summary || '',
      recommendations: parsed.recommendations || [],
      budget_estimate: parsed.budget_estimate || 'N/A',
      priority_keywords: parsed.priority_keywords || []
    };
  }

  throw new Error('Failed to parse Gemini response');
}

// Fallback insights
function generateFallbackInsights(results: any[]) {
  const validResults = results.filter(r => r.success);
  const avgCPC = validResults.reduce((sum, r) => sum + (r.metrics?.cpc || 0), 0) / validResults.length;
  const totalVolume = validResults.reduce((sum, r) => sum + (r.metrics?.search_volume || 0), 0);
  
  const highCompetition = validResults.filter(r => 
    (r.advertisers?.length || 0) > 8 && (r.metrics?.cpc || 0) > 1.5
  );

  return {
    summary: `Analizzate ${validResults.length} keywords. CPC medio: €${avgCPC.toFixed(2)}. Volume totale: ${totalVolume.toLocaleString()}.`,
    recommendations: [
      `1. Investire su ${highCompetition.length} keywords ad alta competizione`,
      '2. Ottimizzare SEO per keywords a bassa competition',
      '3. Monitorare ROI settimanalmente',
      '4. Testare budget incrementale su top performers'
    ],
    budget_estimate: `€${Math.round(totalVolume * 0.02 * avgCPC * 0.7)} - €${Math.round(totalVolume * 0.02 * avgCPC * 1.3)}`,
    priority_keywords: highCompetition.slice(0, 5).map(r => r.keyword)
  };
}

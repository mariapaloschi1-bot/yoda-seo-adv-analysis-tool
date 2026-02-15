/**
 * API Route - FIXED DataForSEO with LIVE endpoints
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

    console.log('[API] Starting analysis for', keywords.length, 'keywords');

    if (!keywords || keywords.length === 0) {
      return NextResponse.json({ error: 'Keywords required' }, { status: 400 });
    }

    const results = [];

    // Process keywords sequentially
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      console.log(`[API] Processing ${i + 1}/${keywords.length}: ${keyword}`);
      
      try {
        // Use LIVE endpoint instead of task queue (faster, more reliable)
        const advertiserData = await getAdvertisersLive(keyword, dataForSeoLogin, dataForSeoPassword);
        const metrics = await getKeywordMetricsLive(keyword, dataForSeoLogin, dataForSeoPassword);

        console.log(`[API] ${keyword} - ${advertiserData.advertisers.length} bidders, CPC ${metrics.cpc}`);

        results.push({
          keyword,
          advertisers: advertiserData.advertisers,
          metrics,
          success: true
        });

        // Rate limiting: 1 request per second
        if (i < keywords.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error: any) {
        console.error(`[API] Error processing ${keyword}:`, error.message);
        results.push({
          keyword,
          advertisers: [],
          metrics: { search_volume: 0, cpc: 0, competition: 0 },
          success: false,
          error: error.message
        });
      }
    }

    console.log('[API] Analysis complete, generating insights...');

    // Generate AI insights
    let insights = null;
    try {
      insights = await generateGeminiInsights(results, geminiKey);
    } catch (error: any) {
      console.error('[API] Gemini error:', error.message);
      insights = generateFallbackInsights(results);
    }

    console.log('[API] Done! Returning results');

    return NextResponse.json({
      results,
      insights,
      success: true
    });

  } catch (error: any) {
    console.error('[API] Fatal error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}

// LIVE Endpoint - Ads Advertisers (no task queue)
async function getAdvertisersLive(keyword: string, login: string, password: string) {
  const authHeader = 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');

  console.log(`[DataForSEO] Fetching advertisers for: ${keyword}`);

  // Use LIVE endpoint for immediate results
  const response = await fetch('https://api.dataforseo.com/v3/serp/google/ads_advertisers/live/advanced', {
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

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[DataForSEO] HTTP Error:', response.status, errorText);
    throw new Error(`DataForSEO error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('[DataForSEO] Response status_code:', data.tasks?.[0]?.status_code);

  if (data.tasks?.[0]?.status_code !== 20000) {
    const errorMsg = data.tasks?.[0]?.status_message || 'Unknown error';
    console.error('[DataForSEO] Task failed:', errorMsg);
    throw new Error(`DataForSEO: ${errorMsg}`);
  }

  const items = data.tasks[0]?.result?.[0]?.items || [];
  console.log(`[DataForSEO] Found ${items.length} items`);

  const advertisers = items
    .filter((item: any) => item.type === 'ad' || item.type === 'paid')
    .map((ad: any) => ({
      domain: ad.domain || ad.url?.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'N/A',
      position: ad.rank_absolute || ad.rank_group || 0,
      title: ad.title || '',
      description: ad.description || '',
      last_seen: new Date().toISOString().split('T')[0]
    }));

  console.log(`[DataForSEO] Extracted ${advertisers.length} advertisers`);

  return {
    keyword,
    advertisers,
    total: advertisers.length
  };
}

// LIVE Endpoint - Keyword Metrics (CORRETTO)
async function getKeywordMetricsLive(keyword: string, login: string, password: string) {
  const authHeader = 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');

  console.log(`[DataForSEO] Fetching metrics for: ${keyword}`);

  // Use Keywords Data API for CPC/Volume/Competition
  const response = await fetch('https://api.dataforseo.com/v3/keywords_data/google/search_volume/live', {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{
      keywords: [keyword],
      location_name: 'Italy',
      language_name: 'Italian'
    }])
  });

  if (!response.ok) {
    console.warn(`[DataForSEO] Metrics HTTP error ${response.status}, using defaults`);
    return { search_volume: 0, cpc: 0, competition: 0 };
  }

  const data = await response.json();
  
  if (data.tasks?.[0]?.status_code !== 20000) {
    console.warn('[DataForSEO] Metrics task failed:', data.tasks?.[0]?.status_message);
    return { search_volume: 0, cpc: 0, competition: 0 };
  }

  const result = data.tasks?.[0]?.result?.[0];

  if (!result) {
    console.warn('[DataForSEO] No metrics found, using defaults');
    return { search_volume: 0, cpc: 0, competition: 0 };
  }

  const metrics = {
    search_volume: result.search_volume || 0,
    cpc: result.cpc || 0,
    competition: result.competition || 0
  };

  console.log(`[DataForSEO] Metrics: vol=${metrics.search_volume}, cpc=€${metrics.cpc.toFixed(2)}, comp=${(metrics.competition * 100).toFixed(0)}%`);

  return metrics;
}

// Generate Gemini insights
async function generateGeminiInsights(results: any[], apiKey: string) {
  const summary = results.map(r => ({
    keyword: r.keyword,
    advertisers: r.advertisers?.length || 0,
    cpc: r.metrics?.cpc || 0,
    competition: r.metrics?.competition || 0,
    volume: r.metrics?.search_volume || 0
  }));

  const prompt = `
Analizza questi dati SEO/PPC per un cliente italiano e fornisci insights in italiano:

DATI KEYWORDS:
${JSON.stringify(summary, null, 2)}

REGOLE:
- Keywords con >8 advertiser + CPC >€1.50 + competition >0.7 → raccomanda paid
- Keywords con <3 advertiser + CPC <€0.50 → focus SEO organico
- Considera ROI: volume × CTR stimato (2%) × CPC
- Budget mensile = volume × 0.02 × CPC

Rispondi in JSON valido:
{
  "summary": "Sintesi in 2-3 frasi della situazione competitiva",
  "recommendations": ["1. Prima raccomandazione", "2. Seconda...", "3. Terza..."],
  "budget_estimate": "€X - €Y",
  "priority_keywords": ["keyword1", "keyword2", "keyword3"]
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
    throw new Error(`Gemini error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Parse JSON
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
  const totalAdvertisers = validResults.reduce((sum, r) => sum + (r.advertisers?.length || 0), 0);
  const avgAdvertisers = totalAdvertisers / validResults.length;
  const avgCPC = validResults.reduce((sum, r) => sum + (r.metrics?.cpc || 0), 0) / validResults.length;
  const totalVolume = validResults.reduce((sum, r) => sum + (r.metrics?.search_volume || 0), 0);
  
  const highCompetition = validResults.filter(r => 
    (r.advertisers?.length || 0) > 8 && (r.metrics?.cpc || 0) > 1.5
  );

  const estimatedClicks = totalVolume * 0.02;
  const budgetLow = Math.round(estimatedClicks * avgCPC * 0.7);
  const budgetHigh = Math.round(estimatedClicks * avgCPC * 1.3);

  return {
    summary: `Analizzate ${validResults.length} keywords con media ${avgAdvertisers.toFixed(1)} bidders per keyword. CPC medio: €${avgCPC.toFixed(2)}. Volume totale: ${totalVolume.toLocaleString()} ricerche/mese.`,
    recommendations: [
      `1. Priorità alta: investire su ${highCompetition.length} keywords ad alta competizione (>8 bidders)`,
      `2. Ottimizzazione SEO: ${validResults.length - highCompetition.length} keywords hanno opportunità organiche`,
      `3. Budget testing: iniziare con €${budgetLow} e scalare in base al ROI`,
      `4. Monitoraggio: verificare conversioni settimanalmente e ottimizzare le offerte`
    ],
    budget_estimate: `€${budgetLow} - €${budgetHigh}`,
    priority_keywords: highCompetition.slice(0, 5).map(r => r.keyword)
  };
}

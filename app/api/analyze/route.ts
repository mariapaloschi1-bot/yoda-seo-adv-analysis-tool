/**
 * API Route - Complete Analysis with Organic + Paid + Metrics
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
        // MULTI-SOURCE DATA COLLECTION
        const [advertiserData, organicData, metrics] = await Promise.all([
          getAdvertisersLive(keyword, dataForSeoLogin, dataForSeoPassword),
          getOrganicPositionsLive(keyword, dataForSeoLogin, dataForSeoPassword),
          getKeywordMetricsLive(keyword, dataForSeoLogin, dataForSeoPassword)
        ]);

        console.log(`[API] ${keyword} - ${advertiserData.advertisers.length} bidders, ${organicData.organic_count} organic, CPC €${metrics.cpc.toFixed(2)}`);

        results.push({
          keyword,
          advertisers: advertiserData.advertisers,
          organic_positions: organicData.positions,
          metrics,
          success: true
        });

        // Rate limiting: 1 keyword per second
        if (i < keywords.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error: any) {
        console.error(`[API] Error processing ${keyword}:`, error.message);
        results.push({
          keyword,
          advertisers: [],
          organic_positions: [],
          metrics: { search_volume: 0, cpc: 0, competition: 0 },
          success: false,
          error: error.message
        });
      }
    }

    console.log('[API] Analysis complete, generating insights...');

    // Generate AI insights (now includes organic data!)
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

// LIVE Endpoint - Ads Advertisers (bidders)
async function getAdvertisersLive(keyword: string, login: string, password: string) {
  const authHeader = 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');

  console.log(`[DataForSEO] Fetching advertisers for: ${keyword}`);

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
    console.error('[DataForSEO] Advertisers HTTP Error:', response.status, errorText);
    // NON fallire, ritorna vuoto
    return { keyword, advertisers: [], total: 0 };
  }

  const data = await response.json();
  
  if (data.tasks?.[0]?.status_code !== 20000) {
    const errorMsg = data.tasks?.[0]?.status_message || 'Unknown error';
    console.warn('[DataForSEO] Advertisers task failed:', errorMsg);
    return { keyword, advertisers: [], total: 0 };
  }

  const items = data.tasks[0]?.result?.[0]?.items || [];
  console.log(`[DataForSEO] Found ${items.length} advertiser items`);

  // Filtra SOLO ads_advertiser e ads_multi_account_advertiser
  const advertisers = items
    .filter((item: any) => 
      item.type === 'ads_advertiser' || 
      item.type === 'ads_multi_account_advertiser'
    )
    .map((ad: any) => ({
      title: ad.title || 'N/A',
      advertiser_id: ad.advertiser_id || ad.advertisers?.[0]?.advertiser_id || '',
      location: ad.location || 'IT',
      verified: ad.verified || false,
      approx_ads_count: ad.approx_ads_count || ad.advertisers?.reduce((sum: number, a: any) => sum + (a.approx_ads_count || 0), 0) || 0
    }));

  console.log(`[DataForSEO] Extracted ${advertisers.length} advertisers`);

  return {
    keyword,
    advertisers,
    total: advertisers.length
  };
}

// NUOVO! - Organic SERP Positions
async function getOrganicPositionsLive(keyword: string, login: string, password: string) {
  const authHeader = 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');

  console.log(`[DataForSEO] Fetching organic positions for: ${keyword}`);

  const response = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/advanced', {
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
      os: 'windows',
      depth: 20  // Top-20 risultati
    }])
  });

  if (!response.ok) {
    console.warn(`[DataForSEO] Organic HTTP error ${response.status}, returning empty`);
    return { keyword, positions: [], organic_count: 0 };
  }

  const data = await response.json();
  
  if (data.tasks?.[0]?.status_code !== 20000) {
    console.warn('[DataForSEO] Organic task failed:', data.tasks?.[0]?.status_message);
    return { keyword, positions: [], organic_count: 0 };
  }

  const items = data.tasks[0]?.result?.[0]?.items || [];
  
  // Estrai SOLO risultati organici (tipo="organic")
  const organicResults = items
    .filter((item: any) => item.type === 'organic')
    .slice(0, 10)  // Top-10
    .map((item: any) => ({
      position: item.rank_absolute || item.rank_group || 0,
      domain: item.domain || 'N/A',
      title: item.title || '',
      url: item.url || '',
      description: item.description || ''
    }));

  console.log(`[DataForSEO] Found ${organicResults.length} organic results (top-10)`);

  return {
    keyword,
    positions: organicResults,
    organic_count: organicResults.length
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

// Generate Gemini insights (UPDATED - analizza anche posizioni organiche!)
async function generateGeminiInsights(results: any[], apiKey: string) {
  const summary = results.map(r => ({
    keyword: r.keyword,
    advertisers: r.advertisers?.length || 0,
    organic_positions: r.organic_positions?.length || 0,
    top_organic_domains: r.organic_positions?.slice(0, 3).map((p: any) => p.domain) || [],
    cpc: r.metrics?.cpc || 0,
    competition: r.metrics?.competition || 0,
    volume: r.metrics?.search_volume || 0
  }));

  const prompt = `
Analizza questi dati SEO/PPC per un cliente italiano e fornisci insights strategici in italiano:

DATI KEYWORDS (con POSIZIONI ORGANICHE):
${JSON.stringify(summary, null, 2)}

REGOLE DECISIONALI:
- Keywords con >5 advertiser + CPC >€1.00 + competition >0.6 → raccomanda PAID
- Keywords con 0 advertiser + competition <0.3 → focus SEO ORGANICO (nessun paid attivo)
- Keywords con 0 advertiser + competition >0.5 → OPPORTUNITÀ (gap da sfruttare!)
- Keywords con posizioni organiche top-3 MA nessun paid → considera DIFESA con paid
- Considera ROI: volume × CTR stimato (2% paid, 5% organico pos 1-3) × CPC
- Budget mensile = volume × 0.02 × CPC (per paid)

Rispondi in JSON valido:
{
  "summary": "Sintesi in 3-4 frasi: quante keyword hanno paid attivo, quante sono in top-10 organico, opportunità principali",
  "recommendations": [
    "1. Raccomandazione strategica basata su paid vs organic",
    "2. Seconda raccomandazione...",
    "3. Terza..."
  ],
  "budget_estimate": "€X - €Y al mese",
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

// Fallback insights (UPDATED)
function generateFallbackInsights(results: any[]) {
  const validResults = results.filter(r => r.success);
  const totalAdvertisers = validResults.reduce((sum, r) => sum + (r.advertisers?.length || 0), 0);
  const totalOrganic = validResults.reduce((sum, r) => sum + (r.organic_positions?.length || 0), 0);
  const avgAdvertisers = totalAdvertisers / validResults.length;
  const avgCPC = validResults.reduce((sum, r) => sum + (r.metrics?.cpc || 0), 0) / validResults.length;
  const totalVolume = validResults.reduce((sum, r) => sum + (r.metrics?.search_volume || 0), 0);
  
  const yesCount = validResults.filter(r => (r.advertisers?.length || 0) > 5 && (r.metrics?.cpc || 0) > 1).length;
  const noCount = validResults.filter(r => (r.advertisers?.length || 0) === 0 && (r.metrics?.competition || 0) < 0.3).length;
  const testCount = validResults.length - yesCount - noCount;

  const budgetLow = Math.round(totalVolume * 0.015 * avgCPC);
  const budgetHigh = Math.round(totalVolume * 0.025 * avgCPC);

  return {
    summary: `Analizzate ${validResults.length} keywords: ${yesCount} con paid attivo (media ${avgAdvertisers.toFixed(1)} bidders), ${totalOrganic} posizioni organiche trovate, CPC medio €${avgCPC.toFixed(2)}.`,
    recommendations: [
      `Investi in paid advertising per ${yesCount} keyword ad alta competizione (CPC >€1.00, multiple bidder).`,
      `Focus su SEO organico per ${noCount} keyword senza paid attivo (bassa competizione, opportunità organiche).`,
      `Testa ${testCount} keyword con approccio ibrido: monitora performance paid vs organic.`,
      `Budget raccomandato: €${budgetLow}-€${budgetHigh}/mese per copertura paid sulle keyword prioritarie.`
    ],
    budget_estimate: `€${budgetLow} - €${budgetHigh}`,
    priority_keywords: validResults
      .filter(r => (r.advertisers?.length || 0) > 3 && (r.metrics?.volume || 0) > 500)
      .slice(0, 5)
      .map(r => r.keyword)
  };
}

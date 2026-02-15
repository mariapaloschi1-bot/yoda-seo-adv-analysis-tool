/**
 * API Route - Complete Analysis with Organic + Paid + Metrics
 * FIX: Corretto parsing DataForSEO - result è un ARRAY!
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
  
  // 🔍 DEBUG: Log risposta completa DataForSEO
  console.log('[DataForSEO] ===== RISPOSTA COMPLETA ADVERTISERS =====');
  console.log('[DataForSEO] Status Code:', data.tasks?.[0]?.status_code);
  console.log('[DataForSEO] Status Message:', data.tasks?.[0]?.status_message);
  console.log('[DataForSEO] Cost:', data.tasks?.[0]?.cost);
  console.log('[DataForSEO] Result Count:', data.tasks?.[0]?.result_count);
  
  if (data.tasks?.[0]?.status_code !== 20000) {
    const errorMsg = data.tasks?.[0]?.status_message || 'Unknown error';
    console.error('[DataForSEO] ❌ Advertisers task failed:', errorMsg);
    console.error('[DataForSEO] Full response:', JSON.stringify(data, null, 2));
    return { keyword, advertisers: [], total: 0 };
  }

  const items = data.tasks[0]?.result?.[0]?.items || [];
  console.log(`[DataForSEO] ✅ Found ${items.length} advertiser items`);
  
  // 🔍 DEBUG: Log primi 3 items raw
  console.log('[DataForSEO] First 3 items (raw):');
  items.slice(0, 3).forEach((item: any, idx: number) => {
    console.log(`  [${idx}] type:${item.type}, title:${item.title}, advertiser_id:${item.advertiser_id}`);
  });

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

  console.log(`[DataForSEO] ✅ Extracted ${advertisers.length} advertisers after filtering`);
  
  // 🔍 DEBUG: Log advertisers estratti
  if (advertisers.length > 0) {
    console.log('[DataForSEO] Advertisers estratti:');
    advertisers.slice(0, 3).forEach((adv: any, idx: number) => {
      console.log(`  [${idx}] ${adv.title} - ${adv.approx_ads_count} ads`);
    });
  } else {
    console.warn('[DataForSEO] ⚠️ NESSUN ADVERTISER ESTRATTO! Verifica se items contiene ads_advertiser o ads_multi_account_advertiser');
    console.log('[DataForSEO] Item types presenti:', [...new Set(items.map((i: any) => i.type))]);
  }

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

// LIVE Endpoint - Keyword Metrics (CORRETTO - FIX PARSING!)
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
  
  // 🔍 DEBUG: Log risposta metrics
  console.log('[DataForSEO] ===== RISPOSTA METRICS =====');
  console.log('[DataForSEO] Status Code:', data.tasks?.[0]?.status_code);
  console.log('[DataForSEO] Status Message:', data.tasks?.[0]?.status_message);
  console.log('[DataForSEO] Result Count:', data.tasks?.[0]?.result_count);
  
  if (data.tasks?.[0]?.status_code !== 20000) {
    console.error('[DataForSEO] ❌ Metrics task failed:', data.tasks?.[0]?.status_message);
    console.error('[DataForSEO] Full response:', JSON.stringify(data, null, 2));
    return { search_volume: 0, cpc: 0, competition: 0 };
  }

  // ⚠️ FIX: result è un ARRAY, non un oggetto singolo!
  const resultArray = data.tasks?.[0]?.result || [];
  
  // 🔍 DEBUG: Log result array
  console.log('[DataForSEO] Result array length:', resultArray.length);
  
  if (resultArray.length === 0) {
    console.warn('[DataForSEO] ⚠️ No metrics in result array, using defaults');
    return { search_volume: 0, cpc: 0, competition: 0 };
  }

  // Prendi il primo risultato dell'array (che corrisponde alla keyword richiesta)
  const result = resultArray[0];
  
  // 🔍 DEBUG: Log result object
  console.log('[DataForSEO] First result object:', JSON.stringify(result, null, 2));

  const metrics = {
    search_volume: result.search_volume || 0,
    cpc: result.cpc || 0,
    competition: result.competition || 0
  };

  console.log(`[DataForSEO] ✅ Metrics: vol=${metrics.search_volume}, cpc=€${metrics.cpc.toFixed(2)}, comp=${(metrics.competition * 100).toFixed(0)}%`);

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

Rispondi SOLO con JSON valido (no markdown):
{
  "summary": "Panoramica generale 2-3 frasi",
  "recommendations": [
    "Raccomandazione strategica 1",
    "Raccomandazione strategica 2",
    "..."
  ],
  "budget_estimate": "Stima budget totale mensile (es: €500-€800/mese)",
  "priority_keywords": ["keyword1", "keyword2", "..."]
}
`;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Extract JSON from markdown if present
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON in Gemini response');
  }

  const insights = JSON.parse(jsonMatch[1] || jsonMatch[0]);
  
  return {
    summary: insights.summary || 'Analisi completata',
    recommendations: insights.recommendations || [],
    budget_estimate: insights.budget_estimate || 'N/A',
    priority_keywords: insights.priority_keywords || []
  };
}

// Fallback insights (simple calculation)
function generateFallbackInsights(results: any[]) {
  const successful = results.filter(r => r.success);
  
  const totalAdvertisers = successful.reduce((sum, r) => sum + (r.advertisers?.length || 0), 0);
  const avgAdvertisers = successful.length > 0 ? totalAdvertisers / successful.length : 0;
  const avgCpc = successful.length > 0 
    ? successful.reduce((sum, r) => sum + (r.metrics?.cpc || 0), 0) / successful.length 
    : 0;
  const totalVolume = successful.reduce((sum, r) => sum + (r.metrics?.search_volume || 0), 0);

  const highValueKeywords = successful
    .filter(r => (r.advertisers?.length || 0) > 3 && (r.metrics?.cpc || 0) > 1.0)
    .map(r => r.keyword);

  return {
    summary: `Analizzate ${successful.length} keywords. Media ${avgAdvertisers.toFixed(1)} advertiser per keyword, CPC medio €${avgCpc.toFixed(2)}.`,
    recommendations: [
      avgAdvertisers > 5 ? 'Alta competizione paid: valuta campagne mirate' : 'Bassa competizione: opportunità per investire in paid',
      totalVolume > 10000 ? 'Volume di ricerca significativo: potenziale ROI elevato' : 'Volume limitato: focus su long-tail keywords',
      highValueKeywords.length > 0 ? `Keywords ad alto valore: ${highValueKeywords.slice(0, 3).join(', ')}` : 'Nessuna keyword ad alto valore identificata'
    ],
    budget_estimate: `€${Math.round(totalVolume * 0.02 * avgCpc)}-€${Math.round(totalVolume * 0.03 * avgCpc)}/mese`,
    priority_keywords: highValueKeywords.slice(0, 5)
  };
}

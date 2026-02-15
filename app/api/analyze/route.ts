/**
 * API Route - Complete SEO+SEA Analysis with Ad Traffic Forecasting
 * VERSIONE COMPLETA: Include previsioni traffico paid (impressions, clicks, cost)
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

    console.log('[API] 🚀 Starting COMPLETE SEO+SEA analysis for', keywords.length, 'keywords');

    if (!keywords || keywords.length === 0) {
      return NextResponse.json({ error: 'Keywords required' }, { status: 400 });
    }

    const results = [];

    // Process keywords sequentially
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      console.log(`[API] 📊 Processing ${i + 1}/${keywords.length}: "${keyword}"`);
      
      try {
        // MULTI-SOURCE DATA COLLECTION (4 chiamate parallele!)
        const [advertiserData, organicData, adsMetrics, adTraffic] = await Promise.all([
          getAdvertisersLive(keyword, dataForSeoLogin, dataForSeoPassword),
          getOrganicPositionsLive(keyword, dataForSeoLogin, dataForSeoPassword),
          getGoogleAdsMetrics(keyword, dataForSeoLogin, dataForSeoPassword),
          getAdTrafficForecast(keyword, dataForSeoLogin, dataForSeoPassword)
        ]);

        console.log(`[API] ✅ ${keyword} - Bidders:${advertiserData.advertisers.length}, Organic:${organicData.organic_count}, Vol:${adsMetrics.search_volume}, CPC:€${adsMetrics.cpc?.toFixed(2) || '0.00'}, Est.Clicks:${Math.round(adTraffic.clicks || 0)}`);

        results.push({
          keyword,
          advertisers: advertiserData.advertisers,
          organic_positions: organicData.positions,
          metrics: adsMetrics,
          ad_traffic_forecast: adTraffic,
          success: true
        });

        // Rate limiting: 1 keyword per second
        if (i < keywords.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error: any) {
        console.error(`[API] ❌ Error processing ${keyword}:`, error.message);
        results.push({
          keyword,
          advertisers: [],
          organic_positions: [],
          metrics: { search_volume: 0, cpc: 0, competition: 0, competition_index: 0 },
          ad_traffic_forecast: { impressions: 0, ctr: 0, clicks: 0, average_cpc: 0, cost: 0 },
          success: false,
          error: error.message
        });
      }
    }

    console.log('[API] 🤖 Generating AI insights with Gemini...');

    // Generate AI insights con analisi SEO-SEA completa + forecasting
    let insights = null;
    try {
      insights = await generateGeminiInsights(results, geminiKey);
    } catch (error: any) {
      console.error('[API] ⚠️ Gemini error:', error.message);
      insights = generateFallbackInsights(results);
    }

    console.log('[API] ✨ Done! Returning complete SEO+SEA analysis with forecasts');

    return NextResponse.json({
      results,
      insights,
      success: true
    });

  } catch (error: any) {
    console.error('[API] 💥 Fatal error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}

// ============================================
// LIVE Endpoint - Ads Advertisers (bidders)
// ============================================
async function getAdvertisersLive(keyword: string, login: string, password: string) {
  const authHeader = 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');

  console.log(`[DataForSEO] 🎯 Fetching advertisers for: "${keyword}"`);

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
    console.error(`[DataForSEO] ❌ Advertisers HTTP Error: ${response.status}`);
    return { keyword, advertisers: [], total: 0 };
  }

  const data = await response.json();
  
  if (data.tasks?.[0]?.status_code !== 20000) {
    console.error(`[DataForSEO] ❌ Task failed: ${data.tasks?.[0]?.status_message}`);
    return { keyword, advertisers: [], total: 0 };
  }

  const items = data.tasks[0]?.result?.[0]?.items || [];

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

  console.log(`[DataForSEO] ✅ Extracted ${advertisers.length} advertisers`);

  return {
    keyword,
    advertisers,
    total: advertisers.length
  };
}

// ============================================
// Organic SERP Positions
// ============================================
async function getOrganicPositionsLive(keyword: string, login: string, password: string) {
  const authHeader = 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');

  console.log(`[DataForSEO] 🔍 Fetching organic SERP for: "${keyword}"`);

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
      depth: 20
    }])
  });

  if (!response.ok) {
    console.warn(`[DataForSEO] ⚠️ Organic HTTP error ${response.status}`);
    return { keyword, positions: [], organic_count: 0 };
  }

  const data = await response.json();
  
  if (data.tasks?.[0]?.status_code !== 20000) {
    console.warn(`[DataForSEO] ⚠️ Organic task failed: ${data.tasks?.[0]?.status_message}`);
    return { keyword, positions: [], organic_count: 0 };
  }

  const items = data.tasks[0]?.result?.[0]?.items || [];
  
  const organicResults = items
    .filter((item: any) => item.type === 'organic')
    .slice(0, 10)
    .map((item: any) => ({
      position: item.rank_absolute || item.rank_group || 0,
      domain: item.domain || 'N/A',
      title: item.title || '',
      url: item.url || '',
      description: item.description || ''
    }));

  console.log(`[DataForSEO] ✅ Found ${organicResults.length} organic results`);

  return {
    keyword,
    positions: organicResults,
    organic_count: organicResults.length
  };
}

// ============================================
// Google Ads Metrics (keywords_for_keywords)
// ============================================
async function getGoogleAdsMetrics(keyword: string, login: string, password: string) {
  const authHeader = 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');

  console.log(`[DataForSEO] 💰 Fetching Google Ads metrics for: "${keyword}"`);

  const response = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live', {
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
    console.warn(`[DataForSEO] ⚠️ Ads metrics HTTP error ${response.status}`);
    return { search_volume: 0, cpc: 0, competition: 0, competition_index: 0 };
  }

  const data = await response.json();
  
  if (data.tasks?.[0]?.status_code !== 20000) {
    console.error(`[DataForSEO] ❌ Ads metrics failed: ${data.tasks?.[0]?.status_message}`);
    return { search_volume: 0, cpc: 0, competition: 0, competition_index: 0 };
  }

  const results = data.tasks?.[0]?.result || [];
  
  if (results.length === 0) {
    console.warn(`[DataForSEO] ⚠️ No metrics in result array`);
    return { search_volume: 0, cpc: 0, competition: 0, competition_index: 0 };
  }

  const keywordData = results.find((r: any) => 
    r.keyword.toLowerCase() === keyword.toLowerCase()
  ) || results[0];

  const metrics = {
    search_volume: keywordData.search_volume || 0,
    cpc: keywordData.cpc || 0,
    competition: keywordData.competition_index ? keywordData.competition_index / 100 : 0,
    competition_index: keywordData.competition_index || 0,
    competition_level: keywordData.competition || 'UNKNOWN'
  };

  console.log(`[DataForSEO] ✅ Ads Metrics - Vol:${metrics.search_volume}, CPC:€${metrics.cpc?.toFixed(2) || '0.00'}, Comp:${metrics.competition_index}%`);

  return metrics;
}

// ============================================
// 🆕 Ad Traffic Forecast (NUOVO!)
// ============================================
async function getAdTrafficForecast(keyword: string, login: string, password: string) {
  const authHeader = 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');

  console.log(`[DataForSEO] 📈 Fetching ad traffic forecast for: "${keyword}"`);

  // Usa un bid alto (€50) per ottenere stime realistiche
  const response = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/ad_traffic_by_keywords/live', {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{
      keywords: [keyword],
      location_name: 'Italy',
      language_name: 'Italian',
      bid: 50,  // Bid alto per stime accurate
      match: 'exact',
      date_interval: 'next_month'
    }])
  });

  if (!response.ok) {
    console.warn(`[DataForSEO] ⚠️ Ad traffic HTTP error ${response.status}`);
    return { impressions: 0, ctr: 0, clicks: 0, average_cpc: 0, cost: 0 };
  }

  const data = await response.json();
  
  if (data.tasks?.[0]?.status_code !== 20000) {
    console.error(`[DataForSEO] ❌ Ad traffic failed: ${data.tasks?.[0]?.status_message}`);
    return { impressions: 0, ctr: 0, clicks: 0, average_cpc: 0, cost: 0 };
  }

  const results = data.tasks?.[0]?.result || [];
  
  if (results.length === 0) {
    console.warn(`[DataForSEO] ⚠️ No ad traffic data available`);
    return { impressions: 0, ctr: 0, clicks: 0, average_cpc: 0, cost: 0 };
  }

  const forecast = results[0];

  const trafficData = {
    impressions: forecast.impressions || 0,
    ctr: forecast.ctr || 0,
    clicks: forecast.clicks || 0,
    average_cpc: forecast.average_cpc || 0,
    cost: forecast.cost || 0
  };

  console.log(`[DataForSEO] ✅ Ad Traffic - Impressions:${Math.round(trafficData.impressions)}, Clicks:${Math.round(trafficData.clicks)}, Cost:€${trafficData.cost?.toFixed(2) || '0.00'}`);

  return trafficData;
}

// ============================================
// Generate Gemini Insights (CON FORECASTING!)
// ============================================
async function generateGeminiInsights(results: any[], apiKey: string) {
  const summary = results.map(r => ({
    keyword: r.keyword,
    advertisers_count: r.advertisers?.length || 0,
    advertisers_names: r.advertisers?.slice(0, 3).map((a: any) => a.title) || [],
    organic_count: r.organic_positions?.length || 0,
    top_organic_domains: r.organic_positions?.slice(0, 3).map((p: any) => p.domain) || [],
    search_volume: r.metrics?.search_volume || 0,
    cpc: r.metrics?.cpc || 0,
    competition_index: r.metrics?.competition_index || 0,
    competition_level: r.metrics?.competition_level || 'UNKNOWN',
    // DATI FORECASTING
    estimated_impressions: Math.round(r.ad_traffic_forecast?.impressions || 0),
    estimated_clicks: Math.round(r.ad_traffic_forecast?.clicks || 0),
    estimated_ctr: ((r.ad_traffic_forecast?.ctr || 0) * 100).toFixed(2) + '%',
    estimated_monthly_cost: '€' + (r.ad_traffic_forecast?.cost || 0).toFixed(2)
  }));

  const prompt = `
Sei un esperto SEO/SEA italiano. Analizza questi dati COMPLETI di keyword research con FORECASTING traffico paid.

DATI COMPLETI KEYWORDS (con previsioni traffico):
${JSON.stringify(summary, null, 2)}

ANALISI RICHIESTA:

1. **STRATEGIA PAID vs ORGANIC**:
   - Usa i dati di FORECASTING (impressions, clicks, cost stimati) per valutare ROI
   - SE estimated_clicks > 50/mese E cost < €500 → RACCOMANDA PAID
   - SE estimated_clicks < 10/mese O cost > €1000 → SCONSIGLIA PAID
   - SE advertisers = 0 MA estimated_impressions > 1000 → OPPORTUNITÀ GAP

2. **ANALISI ROI REALISTICA**:
   - ROI = (estimated_clicks × tasso conversione 3% × valore medio ordine €100) - estimated_monthly_cost
   - Calcola ROI per ogni keyword e identifica le più profittevoli

3. **BUDGET ALLOCATION**:
   - Budget totale = somma estimated_monthly_cost di tutte le keyword raccomandate
   - Dividi budget per priorità: High (60%), Medium (30%), Low (10%)

4. **COMPETITIVE INTELLIGENCE**:
   - Chi sono i top advertiser? Sono brand o PMI?
   - Chi domina organico? C'è correlazione con paid?

Rispondi in ITALIANO con JSON valido (no markdown):
{
  "summary": "Panoramica con NUMERI REALI da forecasting (impressions, clicks, cost totali)",
  "paid_strategy": {
    "recommended_keywords": [
      {
        "keyword": "kw1",
        "priority": "High",
        "estimated_monthly_cost": "€500",
        "estimated_clicks": 120,
        "estimated_roi": "€200 profitto netto"
      }
    ],
    "total_monthly_budget": "€1200",
    "expected_total_clicks": 350,
    "expected_roi": "Positivo €800/mese"
  },
  "seo_strategy": {
    "priority_keywords": ["kw1", "kw2"],
    "difficulty_level": "Media",
    "time_to_results": "6-12 mesi",
    "organic_potential_traffic": "1500 visite/mese se top-3"
  },
  "competitive_analysis": {
    "main_paid_competitors": ["Brand1", "Brand2"],
    "main_organic_competitors": ["domain1.com", "domain2.com"],
    "market_saturation": "Media",
    "entry_barrier": "€800/mese budget minimo consigliato"
  },
  "recommendations": [
    "Raccomandazione tattica 1 con NUMERI (es: Investire €600/mese su 'kw1' per ottenere 150 click)",
    "Raccomandazione tattica 2",
    "Raccomandazione tattica 3"
  ]
}
`;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 3500
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  let jsonText = text;
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonText = jsonMatch[1] || jsonMatch[0];
  }

  const insights = JSON.parse(jsonText);
  
  return {
    summary: insights.summary || 'Analisi completata',
    paid_strategy: insights.paid_strategy || {},
    seo_strategy: insights.seo_strategy || {},
    competitive_analysis: insights.competitive_analysis || {},
    recommendations: insights.recommendations || []
  };
}

// ============================================
// Fallback Insights (CON FORECASTING)
// ============================================
function generateFallbackInsights(results: any[]) {
  const successful = results.filter(r => r.success);
  
  const totalAdvertisers = successful.reduce((sum, r) => sum + (r.advertisers?.length || 0), 0);
  const avgAdvertisers = successful.length > 0 ? totalAdvertisers / successful.length : 0;
  const totalClicks = successful.reduce((sum, r) => sum + (r.ad_traffic_forecast?.clicks || 0), 0);
  const totalCost = successful.reduce((sum, r) => sum + (r.ad_traffic_forecast?.cost || 0), 0);
  const totalImpressions = successful.reduce((sum, r) => sum + (r.ad_traffic_forecast?.impressions || 0), 0);

  const paidKeywords = successful
    .filter(r => 
      (r.ad_traffic_forecast?.clicks || 0) > 50 && 
      (r.ad_traffic_forecast?.cost || 0) < 500
    )
    .map(r => ({
      keyword: r.keyword,
      priority: 'High',
      estimated_monthly_cost: '€' + (r.ad_traffic_forecast?.cost || 0).toFixed(2),
      estimated_clicks: Math.round(r.ad_traffic_forecast?.clicks || 0),
      estimated_roi: 'Da calcolare'
    }));

  const seoKeywords = successful
    .filter(r => (r.advertisers?.length || 0) === 0)
    .map(r => r.keyword);

  return {
    summary: `Analizzate ${successful.length} keywords. Forecast totale: ${Math.round(totalImpressions)} impressions/mese, ${Math.round(totalClicks)} clicks/mese, costo €${totalCost.toFixed(2)}/mese.`,
    paid_strategy: {
      recommended_keywords: paidKeywords,
      total_monthly_budget: '€' + totalCost.toFixed(2),
      expected_total_clicks: Math.round(totalClicks),
      expected_roi: totalClicks > 100 ? 'Positivo (ROI da calcolare con tasso conversione)' : 'Basso volume, valutare attentamente'
    },
    seo_strategy: {
      priority_keywords: seoKeywords,
      difficulty_level: avgAdvertisers > 8 ? 'Alta' : avgAdvertisers > 3 ? 'Media' : 'Bassa',
      time_to_results: '6-12 mesi',
      organic_potential_traffic: 'Da valutare in base a posizioni raggiunte'
    },
    competitive_analysis: {
      main_paid_competitors: [],
      main_organic_competitors: [],
      market_saturation: avgAdvertisers > 8 ? 'Alta' : avgAdvertisers > 3 ? 'Media' : 'Bassa',
      entry_barrier: '€' + (totalCost * 0.5).toFixed(0) + '/mese budget minimo'
    },
    recommendations: [
      paidKeywords.length > 0 ? `Investire €${totalCost.toFixed(0)}/mese per ottenere ~${Math.round(totalClicks)} click` : 'Volume traffico paid basso, focus su SEO',
      seoKeywords.length > 0 ? `Opportunità SEO su: ${seoKeywords.slice(0, 3).join(', ')}` : 'Valutare keyword a bassa competition',
      totalImpressions > 5000 ? 'Volume impressions significativo, buon potenziale brand awareness' : 'Volume limitato, considerare long-tail'
    ]
  };
}

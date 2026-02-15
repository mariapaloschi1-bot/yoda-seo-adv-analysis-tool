import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// YODA'S PAID INTELLIGENCE - API ROUTE CON OPZIONI DINAMICHE
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords, dataForSeoLogin, dataForSeoPassword, geminiKey, options } = body;

    // Validazione input
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Keywords array is required' },
        { status: 400 }
      );
    }

    if (!dataForSeoLogin || !dataForSeoPassword) {
      return NextResponse.json(
        { success: false, error: 'DataForSEO credentials are required' },
        { status: 400 }
      );
    }

    if (!geminiKey) {
      return NextResponse.json(
        { success: false, error: 'Gemini API key is required' },
        { status: 400 }
      );
    }

    // ✅ PARSE OPZIONI (con defaults)
    const analysisOptions = {
      includeOrganicPositions: options?.includeOrganicPositions ?? true,
      includeAdTrafficForecast: options?.includeAdTrafficForecast ?? false
    };

    console.log('🎯 Analysis options:', analysisOptions);
    console.log(`📊 Processing ${keywords.length} keywords...`);

    const results: any[] = [];
    let currentIndex = 0;

    // Loop su ogni keyword
    for (const keyword of keywords) {
      console.log(`\n🔍 Analyzing keyword: "${keyword}" (${currentIndex + 1}/${keywords.length})`);

      try {
        // 1. SEMPRE: Advertisers + Metrics (parallelo per velocità)
        const [advertisersData, metricsData] = await Promise.all([
          getAdvertisersLive(keyword, dataForSeoLogin, dataForSeoPassword),
          getKeywordMetricsLive(keyword, dataForSeoLogin, dataForSeoPassword)
        ]);

        console.log(`  ✅ Advertisers: ${advertisersData.total} bidders (cost: $0.45)`);
        console.log(`  ✅ Metrics: CPC €${metricsData.cpc.toFixed(2)}, Volume ${metricsData.search_volume}, Competition ${metricsData.competition}% (cost: $0.075)`);

        // 2. CONDIZIONALE: Organic Positions
        let organicData = null;
        if (analysisOptions.includeOrganicPositions) {
          try {
            organicData = await getOrganicPositionsLive(keyword, dataForSeoLogin, dataForSeoPassword);
            console.log(`  ✅ Organic: ${organicData.organic_count} positions (cost: $0.30)`);
          } catch (err) {
            console.error('  ⚠️ Organic fetch failed:', err);
            organicData = { keyword, positions: [], organic_count: 0 };
          }
        } else {
          console.log('  ⏭️  Organic: SKIPPED (user choice)');
        }

        // 3. CONDIZIONALE: Ad Traffic Forecast
        let forecastData = null;
        if (analysisOptions.includeAdTrafficForecast) {
          try {
            forecastData = await getAdTrafficForecast(keyword, dataForSeoLogin, dataForSeoPassword);
            console.log(`  ✅ Forecast: ${forecastData.impressions} impressions, ${forecastData.clicks} clicks (cost: $0.075)`);
          } catch (err) {
            console.error('  ⚠️ Forecast fetch failed:', err);
            forecastData = null;
          }
        } else {
          console.log('  ⏭️  Forecast: SKIPPED (user choice)');
        }

        // Calcola costo keyword
        const baseCost = 0.525;
        const organicCost = analysisOptions.includeOrganicPositions ? 0.30 : 0;
        const forecastCost = analysisOptions.includeAdTrafficForecast ? 0.075 : 0;
        const totalCost = baseCost + organicCost + forecastCost;
        console.log(`  💰 Total cost for this keyword: $${totalCost.toFixed(3)}`);

        results.push({
          keyword,
          advertisers: advertisersData.advertisers,
          metrics: metricsData,
          organic_positions: organicData?.positions || null,
          ad_traffic_forecast: forecastData,
          error: null
        });

      } catch (error: any) {
        console.error(`  ❌ Error processing "${keyword}":`, error.message);
        results.push({
          keyword,
          advertisers: [],
          metrics: { search_volume: 0, cpc: 0, competition: 0 },
          organic_positions: null,
          ad_traffic_forecast: null,
          error: error.message
        });
      }

      currentIndex++;
      
      // Rate limit: 1 keyword/sec
      if (currentIndex < keywords.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`\n✅ Analysis complete! Processed ${results.length} keywords`);

    // 4. Genera insights AI con Gemini
    let insights;
    try {
      insights = await generateGeminiInsights(results, geminiKey, analysisOptions);
    } catch (error) {
      console.error('⚠️ Gemini insights failed, using fallback:', error);
      insights = generateFallbackInsights(results);
    }

    return NextResponse.json({
      success: true,
      results,
      insights
    });

  } catch (error: any) {
    console.error('❌ API Route Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS - DataForSEO API Calls
// ============================================================================

async function getAdvertisersLive(keyword: string, login: string, password: string) {
  const authHeader = 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');

  const response = await fetch('https://api.dataforseo.com/v3/serp/google/ads_advertisers/live/advanced', {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{
      keyword: keyword,
      location_name: 'Italy',
      language_code: 'it',
      device: 'desktop',
      os: 'windows'
    }])
  });

  if (!response.ok) {
    throw new Error(`Advertisers API failed: ${response.status}`);
  }

  const data = await response.json();

  if (data.tasks?.[0]?.status_code !== 20000) {
    console.log('  ⚠️ Advertisers API status:', data.tasks?.[0]?.status_code);
    return { keyword, advertisers: [], total: 0 };
  }

  const items = data.tasks[0].result?.[0]?.items || [];
  const advertisers = items
    .filter((item: any) => 
      item.type === 'ads_advertiser' || 
      item.type === 'ads_multi_account_advertiser'
    )
    .map((item: any) => ({
      title: item.title,
      advertiser_id: item.advertiser_id,
      location: item.location || 'IT',
      verified: item.verified || false,
      approx_ads_count: item.approx_ads_count || (item.ads_count || 0)
    }));

  return {
    keyword,
    advertisers,
    total: advertisers.length
  };
}

async function getOrganicPositionsLive(keyword: string, login: string, password: string) {
  const authHeader = 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');

  const response = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/advanced', {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{
      keyword: keyword,
      location_name: 'Italy',
      language_code: 'it',
      device: 'desktop',
      depth: 20
    }])
  });

  if (!response.ok) {
    throw new Error(`Organic API failed: ${response.status}`);
  }

  const data = await response.json();

  if (data.tasks?.[0]?.status_code !== 20000) {
    return { keyword, positions: [], organic_count: 0 };
  }

  const items = data.tasks[0].result?.[0]?.items || [];
  const organicResults = items
    .filter((item: any) => item.type === 'organic')
    .slice(0, 10)
    .map((item: any) => ({
      position: item.rank_absolute,
      domain: item.domain,
      title: item.title,
      url: item.url,
      description: item.description || ''
    }));

  return {
    keyword,
    positions: organicResults,
    organic_count: organicResults.length
  };
}

async function getKeywordMetricsLive(keyword: string, login: string, password: string) {
  const authHeader = 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');

  const response = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live', {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{
      keywords: [keyword],
      location_code: 2380, // Italy
      language_code: 'it'
    }])
  });

  if (!response.ok) {
    throw new Error(`Metrics API failed: ${response.status}`);
  }

  const data = await response.json();

  if (data.tasks?.[0]?.status_code !== 20000) {
    return { search_volume: 0, cpc: 0, competition: 0 };
  }

  const resultArray = data.tasks[0].result || [];
  const result = resultArray[0];

  if (!result) {
    return { search_volume: 0, cpc: 0, competition: 0 };
  }

  return {
    search_volume: result.search_volume || 0,
    cpc: result.cpc || 0,
    competition: result.competition_index || 0
  };
}

async function getAdTrafficForecast(keyword: string, login: string, password: string) {
  const authHeader = 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');

  const response = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/ad_traffic_by_keywords/live', {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{
      keywords: [keyword],
      location_code: 2380, // Italy
      language_code: 'it',
      bid: 50, // Bid €50
      match: 'exact',
      date_interval: 'next_month'
    }])
  });

  if (!response.ok) {
    throw new Error(`Forecast API failed: ${response.status}`);
  }

  const data = await response.json();

  if (data.tasks?.[0]?.status_code !== 20000) {
    return null;
  }

  const resultArray = data.tasks[0].result || [];
  const result = resultArray[0];

  if (!result) {
    return null;
  }

  return {
    impressions: Math.round(result.impressions || 0),
    ctr: parseFloat((result.ctr || 0).toFixed(2)),
    clicks: Math.round(result.clicks || 0),
    average_cpc: parseFloat((result.average_cpc || 0).toFixed(2)),
    cost: Math.round(result.cost || 0)
  };
}

// ============================================================================
// GEMINI AI INSIGHTS (adattivo basato su opzioni)
// ============================================================================

async function generateGeminiInsights(results: any[], geminiKey: string, options: any) {
  // Costruisci summary adattivo
  const summary = results.map(r => {
    let text = `Keyword: "${r.keyword}"
- Advertisers: ${r.advertisers.length} bidders
- CPC: €${r.metrics.cpc.toFixed(2)}, Volume: ${r.metrics.search_volume}, Competition: ${r.metrics.competition}%`;

    // Aggiungi organic se disponibile
    if (r.organic_positions && r.organic_positions.length > 0) {
      const topDomains = r.organic_positions.slice(0, 3).map((p: any) => p.domain).join(', ');
      text += `\n- Top-3 organic: ${topDomains}`;
    } else if (options.includeOrganicPositions) {
      text += `\n- Organic data: not available`;
    }

    // Aggiungi forecast se disponibile
    if (r.ad_traffic_forecast) {
      text += `\n- Forecast: ${r.ad_traffic_forecast.impressions} impressions, CTR ${r.ad_traffic_forecast.ctr}%, ${r.ad_traffic_forecast.clicks} clicks, €${r.ad_traffic_forecast.cost} costo`;
    } else if (options.includeAdTrafficForecast) {
      text += `\n- Forecast data: not available`;
    }

    return text;
  }).join('\n\n');

  const prompt = `
Sei un esperto di SEO e Google Ads. Analizza questi dati e genera insights strategici in JSON:

${summary}

Restituisci un JSON con questa struttura:
{
  "summary": "Riepilogo generale dell'analisi (max 100 parole)",
  "recommendations": ["Raccomandazione 1", "Raccomandazione 2", "Raccomandazione 3"],
  "budget_estimate": "Budget mensile stimato (es: €500-€800)",
  "priority_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Regole decisionali:
- >5 bidders + CPC >€1.00 + competition >60% → raccomanda PAID
- 0 bidders + competition <30% → raccomanda ORGANIC
- 0 bidders + competition >50% → OPPORTUNITÀ (nessuno bidda ma alta domanda)
- Top-3 posizioni organiche + molti bidders → DIFENDI con paid
${options.includeAdTrafficForecast ? '- Usa dati forecast reali per budget estimate e ROI' : '- Stima budget come: volume × 0.02 × CPC'}
${!options.includeOrganicPositions ? '- Organic data non disponibile: focalizzati solo su paid strategy' : ''}

Rispondi SOLO con JSON valido, senza testo aggiuntivo.
`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API failed: ${response.status}`);
  }

  const data = await response.json();
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Estrai JSON dal testo
  const jsonMatch = textContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON in Gemini response');
  }

  return JSON.parse(jsonMatch[0]);
}

function generateFallbackInsights(results: any[]) {
  const totalAdvertisers = results.reduce((sum, r) => sum + r.advertisers.length, 0);
  const avgAdvertisers = totalAdvertisers / results.length;
  const avgCpc = results.reduce((sum, r) => sum + r.metrics.cpc, 0) / results.length;
  const totalVolume = results.reduce((sum, r) => sum + r.metrics.search_volume, 0);

  const highValueKeywords = results
    .filter(r => r.advertisers.length > 3 && r.metrics.cpc > 1.0)
    .slice(0, 5)
    .map(r => r.keyword);

  const lowBudget = Math.round(totalVolume * 0.02 * avgCpc);
  const highBudget = Math.round(totalVolume * 0.03 * avgCpc);

  return {
    summary: `Analizzate ${results.length} keyword con media ${avgAdvertisers.toFixed(1)} bidders e CPC medio €${avgCpc.toFixed(2)}.`,
    recommendations: [
      `Focus su keyword ad alta competizione (${highValueKeywords.length} identificate)`,
      `Budget stimato: €${lowBudget}-€${highBudget}/mese`,
      `Monitorare keyword con 0 bidders per opportunità SEO`
    ],
    budget_estimate: `€${lowBudget}-€${highBudget}`,
    priority_keywords: highValueKeywords
  };
}

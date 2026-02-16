// app/api/analyze/route.ts - API Route con Calcolo Costi Corretto
import { NextRequest, NextResponse } from 'next/server';
import { analyzeKeywords } from '@/lib/dataforseo';
import { analyzeKeywordResults } from '@/lib/analyzer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      keywords, 
      dataforseo_login, 
      dataforseo_password, 
      gemini_api_key,
      brand_domain,
      includeOrganicPositions = true,
      includeAdTrafficForecast = false
    } = body;

    // Validazione
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Keywords array is required' },
        { status: 400 }
      );
    }

    if (!dataforseo_login || !dataforseo_password) {
      return NextResponse.json(
        { success: false, error: 'DataForSEO credentials are required' },
        { status: 400 }
      );
    }

    if (!gemini_api_key) {
      return NextResponse.json(
        { success: false, error: 'Gemini API key is required' },
        { status: 400 }
      );
    }

    console.log(`[API] Starting analysis for ${keywords.length} keywords`);
    console.log(`[API] Options: organicPositions=${includeOrganicPositions}, adForecast=${includeAdTrafficForecast}`);

    // 💰 CALCOLO COSTI CORRETTO (prezzi ufficiali DataForSEO 2026)
    const numKeywords = keywords.length;
    
    // Search Volume: $0.075 per batch (fino a 1000 keywords)
    const searchVolumeCost = 0.075;
    
    // Ad Traffic: $0.075 per batch (se abilitato)
    const adTrafficCost = includeAdTrafficForecast ? 0.075 : 0;
    
    // Advertisers: $0.002 per keyword (Live mode)
    const advertisersCost = numKeywords * 0.002;
    
    // Organic SERP: $0.0015 per keyword (Live mode, se abilitato)
    const organicCost = includeOrganicPositions ? numKeywords * 0.0015 : 0;
    
    // Totale
    const totalCostUSD = searchVolumeCost + adTrafficCost + advertisersCost + organicCost;
    const totalCostEUR = totalCostUSD * 0.93; // Conversione USD → EUR (tasso 2026)
    
    console.log(`[API] 💰 Estimated cost: $${totalCostUSD.toFixed(4)} (€${totalCostEUR.toFixed(4)})`);
    console.log(`[API]   - Search Volume: $${searchVolumeCost.toFixed(4)} (batch)`);
    console.log(`[API]   - Ad Traffic: $${adTrafficCost.toFixed(4)} (batch)`);
    console.log(`[API]   - Advertisers: $${advertisersCost.toFixed(4)} (${numKeywords} × $0.002)`);
    console.log(`[API]   - Organic SERP: $${organicCost.toFixed(4)} (${numKeywords} × $0.0015)`);

    // Step 1: Get keywords data from DataForSEO
    const results = await analyzeKeywords(
      keywords,
      dataforseo_login,
      dataforseo_password,
      brand_domain,
      includeOrganicPositions,
      includeAdTrafficForecast,
      (current, total) => {
        console.log(`[API] Progress: ${current}/${total} keywords processed`);
      }
    );

    // Step 2: Add forecast if enabled
    if (includeAdTrafficForecast) {
      console.log('[API] Adding ad traffic forecast...');
      const { getAdTrafficForecast } = await import('@/lib/dataforseo');
      
      for (let i = 0; i < results.length; i++) {
        const keyword = results[i];
        try {
          const forecast = await getAdTrafficForecast(
            keyword.keyword,
            dataforseo_login,
            dataforseo_password
          );
          
          // ✅ NULL CHECK: forecast can be null
          if (forecast) {
            keyword.forecast = forecast;
            console.log(`[API] Forecast for "${keyword.keyword}": ${forecast.clicks.toFixed(0)} clicks, ${forecast.impressions.toFixed(0)} impressions`);
          } else {
            console.warn(`[API] No forecast data available for "${keyword.keyword}"`);
          }
          
          // Rate limiting: 1s tra richieste
          if (i < results.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`[API] Failed to get forecast for "${keyword.keyword}":`, error);
        }
      }
    }

    // Step 3: Analyze with Gemini
    console.log('[API] Generating AI insights with Gemini...');
    const analysis = await analyzeKeywordResults(
      results,
      gemini_api_key,
      brand_domain ? [brand_domain] : []
    );

    console.log(`[API] ✅ Analysis completed:`);
    console.log(`[API]   - Total keywords: ${analysis.summary.totalKeywords}`);
    console.log(`[API]   - YES_PAID: ${analysis.summary.yes_paid}`);
    console.log(`[API]   - NO_PAID: ${analysis.summary.no_paid}`);
    console.log(`[API]   - TEST: ${analysis.summary.test}`);
    console.log(`[API]   - Actual cost: $${totalCostUSD.toFixed(4)} (€${totalCostEUR.toFixed(4)})`);

    return NextResponse.json({
      success: true,
      results: analysis.results,
      summary: {
        ...analysis.summary,
        api_cost_usd: totalCostUSD.toFixed(4),
        api_cost_eur: totalCostEUR.toFixed(4)
      },
      insights: analysis.insights
    });

  } catch (error) {
    console.error('[API] ❌ Analysis failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Analysis failed', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

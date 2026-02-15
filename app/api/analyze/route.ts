import { NextRequest, NextResponse } from 'next/server';
import { analyzeKeywords, getAdTrafficForecast } from '@/lib/dataforseo';
import { analyzeKeywordResults } from '@/lib/analyzer';
import { generateInsights } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      keywords, 
      dataForSeoLogin, 
      dataForSeoPassword, 
      geminiApiKey,
      options = {}
    } = body;

    // Validate required fields
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { error: 'Keywords array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!dataForSeoLogin || !dataForSeoPassword) {
      return NextResponse.json(
        { error: 'DataForSEO credentials are required' },
        { status: 400 }
      );
    }

    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is required' },
        { status: 400 }
      );
    }

    // Extract options with defaults
    const includeOrganicPositions = options.includeOrganicPositions !== false;
    const includeAdTrafficForecast = options.includeAdTrafficForecast === true;

    console.log('\n🎯 Starting Yoda Analysis...');
    console.log(`📊 Keywords to analyze: ${keywords.length}`);
    console.log(`🔍 Options: Organic=${includeOrganicPositions}, Forecast=${includeAdTrafficForecast}`);
    console.log(`💰 Estimated cost: $${(0.525 + (includeOrganicPositions ? 0.30 : 0) + (includeAdTrafficForecast ? 0.075 : 0)).toFixed(3)} per keyword\n`);

    // Step 1: Get basic analysis
    console.log('📡 Fetching advertiser data, metrics, and organic positions...');
    const results = await analyzeKeywords(
      keywords,
      dataForSeoLogin,
      dataForSeoPassword,
      includeOrganicPositions,
      (progress) => {
        console.log(`  ⏳ Progress: ${progress.current}/${progress.total} - ${progress.keyword}`);
      }
    );

    console.log('✅ Base analysis completed\n');

    // Step 2: Optionally fetch ad traffic forecast
    if (includeAdTrafficForecast) {
      console.log('📈 Fetching ad traffic forecast data...');
      
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const keyword = result.keyword;
        
        console.log(`  🔮 [${i + 1}/${results.length}] Forecasting: ${keyword}`);
        
        let forecastData = null;
        try {
          forecastData = await getAdTrafficForecast(keyword, dataForSeoLogin, dataForSeoPassword);
          if (forecastData) {
            console.log(`  ✅ Forecast: ${forecastData.impressions} impressions, ${forecastData.clicks} clicks (cost: $0.075)`);
          }
        } catch (err) {
          console.error('  ⚠️ Forecast fetch failed:', err);
          forecastData = null;
        }
        
        result.ad_traffic_forecast = forecastData;
        
        if (i < results.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      console.log('✅ Forecast data collection completed\n');
    }

    // Step 3: Analyze results
    console.log('🤖 Analyzing results and generating recommendations...');
    const analysis = analyzeKeywordResults(results, keywords[0]?.split(' ')[0] || '');
    
    console.log(`✅ Analysis complete:
      - YES_PAID: ${analysis.summary.yesPaid} keywords
      - NO_PAID: ${analysis.summary.noPaid} keywords  
      - TEST: ${analysis.summary.test} keywords
      - Total Budget: €${analysis.summary.totalBudget.toFixed(2)}\n`);

    // Step 4: Generate AI insights
    console.log('🧠 Generating AI insights with Gemini...');
    const insights = await generateInsights(analysis.results, geminiApiKey);
    
    console.log('✅ AI insights generated\n');
    console.log('🎉 Yoda Analysis Complete!\n');

    return NextResponse.json({
      results: analysis.results,
      summary: analysis.summary,
      insights,
      metadata: {
        totalKeywords: keywords.length,
        timestamp: new Date().toISOString(),
        options: {
          includeOrganicPositions,
          includeAdTrafficForecast
        }
      }
    });

  } catch (error) {
    console.error('❌ Error in analyze route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze keywords',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

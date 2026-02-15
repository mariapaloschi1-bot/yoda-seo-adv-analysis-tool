import { NextRequest, NextResponse } from 'next/server';
import { analyzeKeywords, getAdTrafficForecast } from '@/lib/dataforseo';
import { analyzeKeywordResults } from '@/lib/analyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      keywords, 
      dataForSeoLogin, 
      dataForSeoPassword, 
      geminiKey,
      options = {}
    } = body;

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { error: 'Keywords array is required' },
        { status: 400 }
      );
    }

    if (!dataForSeoLogin || !dataForSeoPassword) {
      return NextResponse.json(
        { error: 'DataForSEO credentials required' },
        { status: 400 }
      );
    }

    if (!geminiKey) {
      return NextResponse.json(
        { error: 'Gemini API key required' },
        { status: 400 }
      );
    }

    const includeOrganicPositions = options.includeOrganicPositions !== false;
    const includeAdTrafficForecast = options.includeAdTrafficForecast === true;

    console.log('🎯 Starting analysis...');
    console.log(`📊 Keywords: ${keywords.length}`);
    console.log(`🔍 Options: Organic=${includeOrganicPositions}, Forecast=${includeAdTrafficForecast}`);

    const results = await analyzeKeywords(
      keywords,
      dataForSeoLogin,
      dataForSeoPassword,
      includeOrganicPositions,
      (progress) => {
        console.log(`  ⏳ ${progress.current}/${progress.total} - ${progress.keyword}`);
      }
    );

    console.log('✅ Base analysis done\n');

    if (includeAdTrafficForecast) {
      console.log('📈 Fetching forecast data...');
      
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const keyword = result.keyword;
        
        console.log(`  🔮 [${i + 1}/${results.length}] ${keyword}`);
        
        let forecastData = null;
        try {
          forecastData = await getAdTrafficForecast(keyword, dataForSeoLogin, dataForSeoPassword);
          if (forecastData) {
            console.log(`  ✅ Forecast: ${forecastData.impressions} impressions, ${forecastData.clicks} clicks`);
          }
        } catch (err) {
          console.error('  ⚠️ Forecast failed:', err);
          forecastData = null;
        }
        
        result.ad_traffic_forecast = forecastData;
        
        if (i < results.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      console.log('✅ Forecast done\n');
    }

    console.log('🤖 Analyzing...');
    const analysis = await analyzeKeywordResults(results, geminiKey, []);
    
    console.log(`✅ Complete:
      - YES_PAID: ${analysis.summary.yes_paid}
      - NO_PAID: ${analysis.summary.no_paid}  
      - TEST: ${analysis.summary.test}\n`);

    console.log('🎉 Done!\n');

    return NextResponse.json({
      success: true,
      results: analysis.results,
      summary: analysis.summary,
      insights: analysis.insights
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

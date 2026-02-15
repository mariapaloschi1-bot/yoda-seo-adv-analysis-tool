/**
 * Analyzer Logic
 * Brand vs Generic keyword analysis + recommendation engine
 */

import { KeywordResult } from './dataforseo';
import { generateInsights, GeminiInsight } from './gemini';

export interface AnalysisResult {
  results: KeywordResult[];
  insights: GeminiInsight;
  summary: {
    total: number;
    yes_paid: number;
    no_paid: number;
    test: number;
    total_budget_estimate: string;
  };
}

/**
 * Analyze keywords and generate recommendations
 */
export async function analyzeKeywordResults(
  results: KeywordResult[],
  geminiApiKey: string,
  brandDomains: string[] = []
): Promise<AnalysisResult> {
  
  // Step 1: Detect brand keywords and apply logic
  const analyzedResults = results.map(result => {
    const isBrand = isBrandKeyword(result.keyword, brandDomains);
    const recommendation = determineRecommendation(result, isBrand);
    
    return {
      ...result,
      recommendation
    };
  });

  // Step 2: Generate AI insights
  const insights = await generateInsights(analyzedResults, geminiApiKey, brandDomains[0]);

  // Step 3: Calculate summary
  const summary = {
    total: analyzedResults.length,
    yes_paid: analyzedResults.filter(r => r.recommendation === 'YES_PAID').length,
    no_paid: analyzedResults.filter(r => r.recommendation === 'NO_PAID').length,
    test: analyzedResults.filter(r => r.recommendation === 'TEST').length,
    total_budget_estimate: insights.budget_estimate
  };

  return {
    results: analyzedResults,
    insights,
    summary
  };
}

/**
 * Determine if keyword is brand-related
 */
function isBrandKeyword(keyword: string, brandDomains: string[]): boolean {
  if (brandDomains.length === 0) return false;
  
  const lowerKeyword = keyword.toLowerCase();
  
  return brandDomains.some(domain => {
    const brandName = domain.replace(/\.(com|it|net|org)$/, '').toLowerCase();
    return lowerKeyword.includes(brandName);
  });
}

/**
 * Core recommendation logic
 */
function determineRecommendation(
  result: KeywordResult,
  isBrand: boolean
): 'YES_PAID' | 'NO_PAID' | 'TEST' {
  
  const { advertisers, metrics, organic_positions } = result;
  const totalAdvertisers = advertisers.length;
  const { cpc, competition, search_volume } = metrics;

  // BRAND KEYWORD LOGIC
  if (isBrand) {
    // If brand has 3-4+ top-3 organic positions → NO paid
    const top3Count = organic_positions.filter(pos => pos <= 3).length;
    
    if (top3Count >= 3) {
      return 'NO_PAID';
    }
    
    // If competitors are bidding → YES paid (defensive)
    if (totalAdvertisers > 2) {
      return 'YES_PAID';
    }
    
    return 'TEST';
  }

  // GENERIC KEYWORD LOGIC
  
  // High competition + high CPC + many advertisers → YES paid
  if (competition > 0.7 && cpc > 1.5 && totalAdvertisers > 8) {
    return 'YES_PAID';
  }

  // Low competition + low CPC + few advertisers → NO paid (focus SEO)
  if (competition < 0.3 && cpc < 0.5 && totalAdvertisers < 3) {
    return 'NO_PAID';
  }

  // High volume + medium competition → YES paid (opportunity)
  if (search_volume > 5000 && competition > 0.5 && totalAdvertisers > 5) {
    return 'YES_PAID';
  }

  // Low volume + high CPC → NO paid (not worth it)
  if (search_volume < 500 && cpc > 2) {
    return 'NO_PAID';
  }

  // Everything else → TEST
  return 'TEST';
}

/**
 * Calculate monthly budget estimate for a keyword
 */
export function calculateKeywordBudget(result: KeywordResult): number {
  const { metrics } = result;
  const { search_volume, cpc } = metrics;
  
  // Assume 2% CTR and 30-day month
  const estimatedClicks = search_volume * 0.02;
  return Math.round(estimatedClicks * cpc);
}

/**
 * Export results to CSV format
 */
export function exportToCSV(results: KeywordResult[]): string {
  const headers = [
    'Keyword',
    'Advertisers',
    'CPC (€)',
    'Competition',
    'Search Volume',
    'Recommendation',
    'Estimated Budget (€/month)',
    'Top Advertiser',
    'Top Advertiser Position'
  ];

  const rows = results.map(r => {
    const topAdvertiser = r.advertisers[0] || null;
    return [
      r.keyword,
      r.advertisers.length,
      r.metrics.cpc.toFixed(2),
      (r.metrics.competition * 100).toFixed(0) + '%',
      r.metrics.search_volume,
      r.recommendation,
      calculateKeywordBudget(r),
      topAdvertiser?.domain || 'N/A',
      topAdvertiser?.position || 'N/A'
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Get recommendation color and icon
 */
export function getRecommendationStyle(rec: string): {
  color: string;
  icon: string;
  label: string;
} {
  switch (rec) {
    case 'YES_PAID':
      return {
        color: 'text-red-400',
        icon: '🔴',
        label: 'SI - Investi in Paid'
      };
    case 'NO_PAID':
      return {
        color: 'text-green-400',
        icon: '🟢',
        label: 'NO - Focus SEO'
      };
    case 'TEST':
      return {
        color: 'text-yellow-400',
        icon: '🟡',
        label: 'TEST - Budget limitato'
      };
    default:
      return {
        color: 'text-gray-400',
        icon: '⚪',
        label: 'Sconosciuto'
      };
  }
}

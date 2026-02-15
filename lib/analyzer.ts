import { KeywordResult } from './dataforseo';
import { generateInsights } from './gemini';

export type Recommendation = 'NO_PAID' | 'YES_PAID' | 'TEST' | 'OPPORTUNITY';

export interface AnalysisResult {
  results: KeywordResult[];
  summary: {
    totalKeywords: number;
    yesPaid: number;
    noPaid: number;
    test: number;
    opportunity: number;
    totalBudget: number;
  };
}

// Determine recommendation based on competitive analysis
function determineRecommendation(
  keyword: string,
  advertisers: number,
  organicPositions: number[],
  metrics: { search_volume: number; cpc: number; competition: number },
  brandDomain?: string
): Recommendation {
  const organicPos = organicPositions || [];
  const top3Count = organicPos.filter(pos => pos <= 3).length;
  const top10Count = organicPos.filter(pos => pos <= 10).length;
  
  const isBrandKeyword = brandDomain && keyword.toLowerCase().includes(brandDomain.toLowerCase());

  // Brand keyword logic
  if (isBrandKeyword) {
    if (top3Count >= 3) {
      return 'NO_PAID';
    } else if (advertisers > 2) {
      return 'YES_PAID';
    } else {
      return 'TEST';
    }
  }

  // Generic keyword logic
  const { search_volume, cpc, competition } = metrics;

  if (competition > 0.7 && cpc > 1.5 && advertisers > 8) {
    return 'YES_PAID';
  }

  if (competition < 0.3 && cpc < 0.5 && advertisers < 3) {
    return 'NO_PAID';
  }

  if (search_volume > 5000 && competition > 0.5 && advertisers > 5) {
    return 'YES_PAID';
  }

  if (search_volume < 500 && cpc > 2) {
    return 'NO_PAID';
  }

  if (top3Count >= 2) {
    return 'OPPORTUNITY';
  }

  return 'TEST';
}

// Calculate estimated monthly budget
function calculateBudget(
  searchVolume: number,
  cpc: number,
  recommendation: Recommendation
): number {
  if (recommendation === 'NO_PAID') return 0;
  
  const estimatedClicks = searchVolume * 0.02;
  return Math.round(estimatedClicks * cpc);
}

// Main analysis function
export function analyzeKeywordResults(
  results: KeywordResult[],
  brandDomain?: string
): AnalysisResult {
  const analyzedResults = results.map(result => {
    const recommendation = determineRecommendation(
      result.keyword,
      result.advertisers.length,
      result.organic_positions || [],
      result.metrics,
      brandDomain
    );

    const budget = calculateBudget(
      result.metrics.search_volume,
      result.metrics.cpc,
      recommendation
    );

    return {
      ...result,
      recommendation,
      estimated_budget: budget,
    };
  });

  const summary = {
    totalKeywords: results.length,
    yesPaid: analyzedResults.filter(r => r.recommendation === 'YES_PAID').length,
    noPaid: analyzedResults.filter(r => r.recommendation === 'NO_PAID').length,
    test: analyzedResults.filter(r => r.recommendation === 'TEST').length,
    opportunity: analyzedResults.filter(r => r.recommendation === 'OPPORTUNITY').length,
    totalBudget: analyzedResults.reduce((sum, r) => sum + (r.estimated_budget || 0), 0),
  };

  return {
    results: analyzedResults,
    summary,
  };
}

// Export results to CSV
export function exportToCSV(results: KeywordResult[]): string {
  const headers = [
    'Keyword',
    'Search Volume',
    'CPC',
    'Competition',
    'Advertisers Count',
    'Top Advertisers',
    'Organic Positions',
    'Recommendation',
    'Estimated Budget'
  ];

  const rows = results.map(result => {
    const topAdvertisers = result.advertisers
      .slice(0, 3)
      .map(a => a.domain)
      .join('; ');

    const organicPos = result.organic_positions || [];
    const organicPosStr = organicPos.length > 0 ? organicPos.join(', ') : 'N/A';

    return [
      result.keyword,
      result.metrics.search_volume,
      result.metrics.cpc.toFixed(2),
      (result.metrics.competition * 100).toFixed(0) + '%',
      result.advertisers.length,
      topAdvertisers,
      organicPosStr,
      result.recommendation,
      calculateBudget(result.metrics.search_volume, result.metrics.cpc, result.recommendation)
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}

// Get badge styling for recommendation
export function getRecommendationBadge(recommendation: Recommendation): {
  color: string;
  icon: string;
  label: string;
} {
  switch (recommendation) {
    case 'YES_PAID':
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: '💰',
        label: 'Investi in Paid'
      };
    case 'NO_PAID':
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: '🚫',
        label: 'Non Investire'
      };
    case 'TEST':
      return {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '🧪',
        label: 'Testa'
      };
    case 'OPPORTUNITY':
      return {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: '⭐',
        label: 'Opportunità'
      };
  }
}

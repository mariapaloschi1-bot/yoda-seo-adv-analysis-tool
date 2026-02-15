// DataForSEO API credentials and types
export interface DataForSeoCredentials {
  login: string;
  password: string;
}

export interface Advertiser {
  domain: string;
  position: number;
  title: string;
  description: string;
  first_shown?: string;
}

export interface KeywordMetrics {
  search_volume: number;
  cpc: number;
  competition: number;
}

export interface AdvertiserData {
  keyword: string;
  advertisers: Advertiser[];
  total_count: number;
  competition_level: number;
}

export interface KeywordResult {
  keyword: string;
  advertisers: Advertiser[];
  metrics: KeywordMetrics;
  organic_positions?: number[];
  ad_traffic_forecast?: {
    impressions: number;
    clicks: number;
    ctr: number;
    cost: number;
  } | null;
  recommendation: 'NO_PAID' | 'YES_PAID' | 'TEST' | 'OPPORTUNITY';
}

const DATAFORSEO_API_BASE = 'https://api.dataforseo.com/v3';

// Helper function to make authenticated requests
async function makeDataForSeoRequest(
  endpoint: string,
  credentials: DataForSeoCredentials,
  data: any
) {
  const auth = Buffer.from(`${credentials.login}:${credentials.password}`).toString('base64');
  
  const response = await fetch(`${DATAFORSEO_API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`DataForSEO API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Get advertisers data for a keyword
export async function getAdvertisersData(
  keyword: string,
  login: string,
  password: string
): Promise<AdvertiserData> {
  const credentials = { login, password };
  
  // Post task
  const postData = [{
    keyword,
    location_code: 2380,
    language_code: 'it',
  }];

  const postResult = await makeDataForSeoRequest(
    '/serp/google/ads_advertisers/task_post',
    credentials,
    postData
  );

  if (!postResult.tasks || postResult.tasks.length === 0) {
    throw new Error('No task created');
  }

  const taskId = postResult.tasks[0].id;

  // Wait for task to complete
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Get results
  const getResult = await makeDataForSeoRequest(
    `/serp/google/ads_advertisers/task_get/advanced/${taskId}`,
    credentials,
    [{}]
  );

  const task = getResult.tasks?.[0];
  const result = task?.result?.[0];

  if (!result) {
    return {
      keyword,
      advertisers: [],
      total_count: 0,
      competition_level: 0,
    };
  }

  const advertisers = (result.items || []).map((item: any) => ({
    domain: item.domain || '',
    position: item.rank_absolute || 0,
    title: item.title || '',
    description: item.description || '',
    first_shown: item.first_shown,
  }));

  return {
    keyword,
    advertisers,
    total_count: advertisers.length,
    competition_level: result.se_results_count || 0,
  };
}

// Get keyword metrics (search volume, CPC, competition)
export async function getKeywordMetrics(
  keyword: string,
  login: string,
  password: string
): Promise<KeywordMetrics> {
  const credentials = { login, password };
  
  const postData = [{
    keywords: [keyword],
    location_code: 2380,
    language_code: 'it',
  }];

  try {
    const result = await makeDataForSeoRequest(
      '/dataforseo_labs/google/keyword_ideas/live',
      credentials,
      postData
    );

    const task = result.tasks?.[0];
    const items = task?.result?.[0]?.items || [];
    
    if (items.length === 0) {
      return {
        search_volume: 1000,
        cpc: 0.5,
        competition: 0.5,
      };
    }

    const item = items[0];
    
    return {
      search_volume: item.keyword_info?.search_volume || 1000,
      cpc: item.keyword_info?.cpc || 0.5,
      competition: item.keyword_info?.competition || 0.5,
    };
  } catch (error) {
    console.error('Error fetching keyword metrics:', error);
    return {
      search_volume: 1000,
      cpc: 0.5,
      competition: 0.5,
    };
  }
}

// Get organic SERP positions
export async function getOrganicPositions(
  keyword: string,
  login: string,
  password: string
): Promise<number[]> {
  const credentials = { login, password };
  
  const postData = [{
    keyword,
    location_code: 2380,
    language_code: 'it',
    device: 'desktop',
    os: 'windows',
  }];

  try {
    const postResult = await makeDataForSeoRequest(
      '/serp/google/organic/task_post',
      credentials,
      postData
    );

    if (!postResult.tasks || postResult.tasks.length === 0) {
      return [];
    }

    const taskId = postResult.tasks[0].id;
    await new Promise(resolve => setTimeout(resolve, 5000));

    const getResult = await makeDataForSeoRequest(
      `/serp/google/organic/task_get/advanced/${taskId}`,
      credentials,
      [{}]
    );

    const result = getResult.tasks?.[0]?.result?.[0];
    if (!result || !result.items) {
      return [];
    }

    const positions = result.items
      .filter((item: any) => item.type === 'organic')
      .map((item: any) => item.rank_absolute || 0)
      .filter((pos: number) => pos > 0);

    return positions;
  } catch (error) {
    console.error('Error fetching organic positions:', error);
    return [];
  }
}

// Get ad traffic forecast
export async function getAdTrafficForecast(
  keyword: string,
  login: string,
  password: string
): Promise<{ impressions: number; clicks: number; ctr: number; cost: number } | null> {
  const credentials = { login, password };
  
  const postData = [{
    keywords: [keyword],
    location_code: 2380,
    language_code: 'it',
  }];

  try {
    const result = await makeDataForSeoRequest(
      '/dataforseo_labs/google/keyword_ideas/live',
      credentials,
      postData
    );

    const task = result.tasks?.[0];
    const items = task?.result?.[0]?.items || [];
    
    if (items.length === 0) {
      return null;
    }

    const item = items[0];
    const searchVolume = item.keyword_info?.search_volume || 0;
    const cpc = item.keyword_info?.cpc || 0;
    
    const estimatedImpressions = Math.round(searchVolume * 0.6);
    const estimatedCtr = 0.05;
    const estimatedClicks = Math.round(estimatedImpressions * estimatedCtr);
    const estimatedCost = Number((estimatedClicks * cpc).toFixed(2));

    return {
      impressions: estimatedImpressions,
      clicks: estimatedClicks,
      ctr: estimatedCtr,
      cost: estimatedCost,
    };
  } catch (error) {
    console.error('Error fetching ad traffic forecast:', error);
    return null;
  }
}

// Main function to analyze keywords
export async function analyzeKeywords(
  keywords: string[],
  login: string,
  password: string,
  includeOrganicPositions: boolean = true,
  onProgress?: (progress: { current: number; total: number; keyword: string }) => void
): Promise<KeywordResult[]> {
  const results: KeywordResult[] = [];

  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];
    
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: keywords.length,
        keyword,
      });
    }

    try {
      const [advertiserData, metrics] = await Promise.all([
        getAdvertisersData(keyword, login, password),
        getKeywordMetrics(keyword, login, password),
      ]);

      let organicPositions: number[] | undefined = undefined;
      if (includeOrganicPositions) {
        organicPositions = await getOrganicPositions(keyword, login, password);
      }

      results.push({
        keyword,
        advertisers: advertiserData.advertisers,
        metrics,
        organic_positions: organicPositions,
        recommendation: 'TEST',
      });

      if (i < keywords.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error analyzing keyword "${keyword}":`, error);
      results.push({
        keyword,
        advertisers: [],
        metrics: {
          search_volume: 0,
          cpc: 0,
          competition: 0,
        },
        organic_positions: includeOrganicPositions ? [] : undefined,
        recommendation: 'TEST',
      });
    }
  }

  return results;
}

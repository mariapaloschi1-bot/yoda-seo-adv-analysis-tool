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
  forecast?: {
    impressions: number;
    clicks: number;
    ctr: number;
    cost: number;
  } | null;
  recommendation: 'NO_PAID' | 'YES_PAID' | 'TEST' | 'OPPORTUNITY';
}

const DATAFORSEO_API_BASE = 'https://api.dataforseo.com/v3';

// ✅ BULLETPROOF: Helper function with proper error handling
async function makeDataForSeoRequest(
  endpoint: string,
  credentials: DataForSeoCredentials,
  data: any
) {
  const auth = Buffer.from(`${credentials.login}:${credentials.password}`).toString('base64');
  
  console.log(`📡 Calling DataForSEO: ${endpoint}`);
  console.log(`🔑 Auth (login): ${credentials.login}`);
  
  try {
    const response = await fetch(`${DATAFORSEO_API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // ✅ TRY TO PARSE JSON (might fail if HTML error page)
    let responseData: any;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      // HTML error page or non-JSON response
      const textBody = await response.text();
      console.error(`❌ Non-JSON response (${response.status}):`, textBody.substring(0, 500));
      
      throw new Error(
        `DataForSEO returned non-JSON response (HTTP ${response.status}). ` +
        `This usually means authentication failed. ` +
        `Check your credentials at https://app.dataforseo.com/api-access`
      );
    }

    // ✅ CHECK HTTP STATUS
    if (!response.ok) {
      const errorMessage = responseData?.status_message || response.statusText;
      const errorCode = responseData?.status_code || response.status;
      
      console.error(`❌ DataForSEO HTTP Error ${response.status}:`, errorMessage);
      console.error(`Full response:`, JSON.stringify(responseData, null, 2));
      
      // Special message for 401
      if (response.status === 401) {
        throw new Error(
          `Authentication failed (HTTP 401). ` +
          `Please verify your DataForSEO credentials at https://app.dataforseo.com/api-access. ` +
          `Make sure you're using the API password (not your account password).`
        );
      }
      
      throw new Error(`API Status: ${errorCode} - ${errorMessage}`);
    }

    // ✅ CHECK DATAFORSEO STATUS CODE (success = 20000)
    if (responseData.status_code && responseData.status_code !== 20000) {
      const errorMsg = responseData.status_message || 'Unknown error';
      console.error(`❌ DataForSEO API Error: ${responseData.status_code} - ${errorMsg}`);
      
      // Special handling for common errors
      if (responseData.status_code === 40100) {
        throw new Error(
          `Authorization failed (40100): ${errorMsg}. ` +
          `Your API credentials are invalid or your account doesn't have access to this endpoint. ` +
          `Check: https://app.dataforseo.com/api-access`
        );
      }
      
      if (responseData.status_code === 40101) {
        throw new Error(
          `Insufficient credits (40101): ${errorMsg}. ` +
          `Please add credits to your DataForSEO account: https://app.dataforseo.com/billing`
        );
      }
      
      throw new Error(`API Status: ${responseData.status_code} - ${errorMsg}`);
    }

    return responseData;
    
  } catch (error: any) {
    // Re-throw our custom errors
    if (error.message.includes('DataForSEO') || error.message.includes('API Status')) {
      throw error;
    }
    
    // Network or other errors
    console.error(`❌ Request failed:`, error);
    throw new Error(
      `Failed to connect to DataForSEO API: ${error.message}. ` +
      `Check your internet connection and DataForSEO service status.`
    );
  }
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
    []
  );

  const task = getResult.tasks?.[0];
  const items = task?.result?.[0]?.items || [];

  return {
    keyword,
    advertisers: items.slice(0, 10).map((item: any) => ({
      domain: item.domain,
      position: item.position,
      title: item.title || '',
      description: item.description || '',
      first_shown: item.first_shown,
    })),
    total_count: items.length,
    competition_level: items.length > 10 ? 1.0 : items.length / 10,
  };
}

// Get keyword metrics (search volume, CPC, competition)
export async function getKeywordMetrics(
  keywords: string[],
  login: string,
  password: string
): Promise<Map<string, KeywordMetrics>> {
  const credentials = { login, password };
  
  const postData = [{
    keywords,
    location_code: 2380,
    language_code: 'it',
  }];

  const result = await makeDataForSeoRequest(
    '/keywords_data/google_ads/search_volume/live',
    credentials,
    postData
  );

  const metricsMap = new Map<string, KeywordMetrics>();
  const items = result.tasks?.[0]?.result?.[0]?.items || [];

  items.forEach((item: any) => {
    metricsMap.set(item.keyword, {
      search_volume: item.search_volume || 0,
      cpc: item.cpc || 0,
      competition: item.competition_index ? item.competition_index / 100 : 0,
    });
  });

  return metricsMap;
}

// Get organic SERP positions
export async function getOrganicPositions(
  keyword: string,
  login: string,
  password: string,
  targetDomain?: string
): Promise<number[]> {
  const credentials = { login, password };
  
  const postData = [{
    keyword,
    location_code: 2380,
    language_code: 'it',
  }];

  const result = await makeDataForSeoRequest(
    '/serp/google/organic/live/advanced',
    credentials,
    postData
  );

  const items = result.tasks?.[0]?.result?.[0]?.items || [];
  const positions: number[] = [];

  items.forEach((item: any, index: number) => {
    if (item.type === 'organic') {
      if (!targetDomain || item.domain === targetDomain) {
        positions.push(index + 1);
      }
    }
  });

  return positions;
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
    bid: 999,
    match: 'exact',
  }];

  try {
    const result = await makeDataForSeoRequest(
      '/keywords_data/google_ads/ad_traffic_by_keywords/live',
      credentials,
      postData
    );

    const forecast = result.tasks?.[0]?.result?.[0];
    
    if (forecast && forecast.impressions) {
      return {
        impressions: forecast.impressions || 0,
        clicks: forecast.clicks || 0,
        ctr: forecast.ctr || 0,
        cost: forecast.cost || 0,
      };
    }
  } catch (error) {
    console.warn(`⚠️ Ad traffic forecast unavailable for "${keyword}"`);
  }

  return null;
}

// ✅ FIXED: Main analysis function with correct signature
export async function analyzeKeywords(
  keywords: string[],
  login: string,
  password: string,
  brandDomain?: string,
  includeOrganicPositions: boolean = true,
  includeAdTrafficForecast: boolean = false,
  onProgress?: (current: number, total: number) => void
): Promise<KeywordResult[]> {
  
  console.log(`🎯 Starting analysis for ${keywords.length} keywords...`);
  console.log(`   Brand domain: ${brandDomain || 'none'}`);
  console.log(`   Organic positions: ${includeOrganicPositions}`);
  console.log(`   Ad traffic forecast: ${includeAdTrafficForecast}`);
  
  // Get metrics for all keywords at once
  const metricsMap = await getKeywordMetrics(keywords, login, password);
  
  const results: KeywordResult[] = [];
  
  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];
    
    if (onProgress) {
      onProgress(i + 1, keywords.length);
    }
    
    try {
      const [advertiserData, organicPositions] = await Promise.all([
        getAdvertisersData(keyword, login, password),
        includeOrganicPositions 
          ? getOrganicPositions(keyword, login, password, brandDomain)
          : Promise.resolve([])
      ]);
      
      const metrics = metricsMap.get(keyword) || {
        search_volume: 0,
        cpc: 0,
        competition: 0,
      };
      
      results.push({
        keyword,
        advertisers: advertiserData.advertisers,
        metrics,
        organic_positions: includeOrganicPositions ? organicPositions : undefined,
        forecast: null,
        recommendation: 'TEST',
      });
      
    } catch (error: any) {
      console.error(`❌ Error analyzing keyword "${keyword}":`, error.message);
      
      results.push({
        keyword,
        advertisers: [],
        metrics: {
          search_volume: 0,
          cpc: 0,
          competition: 0,
        },
        organic_positions: undefined,
        forecast: null,
        recommendation: 'TEST',
      });
    }
  }
  
  console.log(`✅ Analysis complete: ${results.length} keywords processed`);
  
  return results;
}

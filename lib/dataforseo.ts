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
  
  console.log(`📡 DataForSEO API call: ${endpoint}`);
  
  const response = await fetch(`${DATAFORSEO_API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ DataForSEO API error [${response.status}]:`, errorText);
    throw new Error(`DataForSEO API error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  
  // Check for API-level errors
  if (result.status_code && result.status_code !== 20000) {
    console.error('❌ DataForSEO API error:', result.status_message);
    throw new Error(`DataForSEO API error: ${result.status_message}`);
  }

  return result;
}

// Get advertisers data for a keyword
export async function getAdvertisersData(
  keyword: string,
  login: string,
  password: string
): Promise<AdvertiserData> {
  const credentials = { login, password };
  
  try {
    // Post task
    const postData = [{
      keyword,
      location_code: 2380, // Italy
      language_code: 'it',
    }];

    console.log(`  🔍 Searching ads for: "${keyword}"`);

    const postResult = await makeDataForSeoRequest(
      '/serp/google/ads_advertisers/task_post',
      credentials,
      postData
    );

    if (!postResult.tasks || postResult.tasks.length === 0) {
      console.warn('  ⚠️ No task created for advertisers');
      return {
        keyword,
        advertisers: [],
        total_count: 0,
        competition_level: 0,
      };
    }

    const taskId = postResult.tasks[0].id;
    console.log(`  ⏳ Task ID: ${taskId}, waiting 5s...`);

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
      console.warn('  ⚠️ No result data');
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

    console.log(`  ✅ Found ${advertisers.length} advertisers`);

    return {
      keyword,
      advertisers,
      total_count: advertisers.length,
      competition_level: result.se_results_count || 0,
    };
  } catch (error) {
    console.error(`  ❌ Error fetching advertisers for "${keyword}":`, error);
    return {
      keyword,
      advertisers: [],
      total_count: 0,
      competition_level: 0,
    };
  }
}

// Get keyword metrics (search volume, CPC, competition) - FIXED ENDPOINT
export async function getKeywordMetrics(
  keyword: string,
  login: string,
  password: string
): Promise<KeywordMetrics> {
  const credentials = { login, password };
  
  try {
    const postData = [{
      keywords: [keyword],
      location_code: 2380, // Italy
      language_code: 'it',
    }];

    console.log(`  📊 Fetching metrics for: "${keyword}"`);

    // ✅ CORRECT ENDPOINT: Google Ads Search Volume Live
    const result = await makeDataForSeoRequest(
      '/keywords_data/google_ads/search_volume/live',
      credentials,
      postData
    );

    const task = result.tasks?.[0];
    const items = task?.result || [];
    
    if (items.length === 0) {
      console.warn(`  ⚠️ No metrics data, using defaults`);
      return {
        search_volume: 100,
        cpc: 0.5,
        competition: 0.5,
      };
    }

    const item = items[0];
    const searchVolume = item.search_volume || 100;
    const cpc = item.cpc || 0.5;
    const competition = item.competition || 0.5;
    
    console.log(`  ✅ Metrics: vol=${searchVolume}, cpc=€${cpc.toFixed(2)}, comp=${(competition * 100).toFixed(0)}%`);
    
    return {
      search_volume: searchVolume,
      cpc: cpc,
      competition: competition,
    };
  } catch (error) {
    console.error(`  ❌ Error fetching metrics for "${keyword}":`, error);
    return {
      search_volume: 100,
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
  
  try {
    const postData = [{
      keyword,
      location_code: 2380,
      language_code: 'it',
      device: 'desktop',
      os: 'windows',
    }];

    console.log(`  🔎 Searching organic positions for: "${keyword}"`);

    const postResult = await makeDataForSeoRequest(
      '/serp/google/organic/task_post',
      credentials,
      postData
    );

    if (!postResult.tasks || postResult.tasks.length === 0) {
      console.warn('  ⚠️ No organic task created');
      return [];
    }

    const taskId = postResult.tasks[0].id;
    console.log(`  ⏳ Task ID: ${taskId}, waiting 5s...`);

    await new Promise(resolve => setTimeout(resolve, 5000));

    const getResult = await makeDataForSeoRequest(
      `/serp/google/organic/task_get/advanced/${taskId}`,
      credentials,
      [{}]
    );

    const result = getResult.tasks?.[0]?.result?.[0];
    if (!result || !result.items) {
      console.warn('  ⚠️ No organic results');
      return [];
    }

    const positions = result.items
      .filter((item: any) => item.type === 'organic')
      .map((item: any) => item.rank_absolute || 0)
      .filter((pos: number) => pos > 0);

    console.log(`  ✅ Found ${positions.length} organic positions`);

    return positions;
  } catch (error) {
    console.error(`  ❌ Error fetching organic positions for "${keyword}":`, error);
    return [];
  }
}

// Get ad traffic forecast - FIXED ENDPOINT
export async function getAdTrafficForecast(
  keyword: string,
  login: string,
  password: string
): Promise<{ impressions: number; clicks: number; ctr: number; cost: number } | null> {
  const credentials = { login, password };
  
  try {
    const postData = [{
      keywords: [keyword],
      location_code: 2380,
      language_code: 'it',
    }];

    console.log(`  🔮 Forecasting ad traffic for: "${keyword}"`);

    // ✅ CORRECT ENDPOINT: Ad Traffic By Keywords Live
    const result = await makeDataForSeoRequest(
      '/keywords_data/google_ads/ad_traffic_by_keywords/live',
      credentials,
      postData
    );

    const task = result.tasks?.[0];
    const items = task?.result || [];
    
    if (items.length === 0) {
      console.warn('  ⚠️ No forecast data');
      return null;
    }

    const item = items[0];
    
    // DataForSEO returns estimated data
    const impressions = item.impressions || 0;
    const clicks = item.clicks || 0;
    const ctr = clicks > 0 && impressions > 0 ? clicks / impressions : 0.05;
    const cpc = item.cpc || 0;
    const cost = Number((clicks * cpc).toFixed(2));

    console.log(`  ✅ Forecast: ${impressions} imp, ${clicks} clicks, €${cost}`);

    return {
      impressions,
      clicks,
      ctr,
      cost,
    };
  } catch (error) {
    console.error(`  ❌ Error fetching forecast for "${keyword}":`, error);
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

  console.log(`\n🚀 Starting analysis of ${keywords.length} keywords...\n`);

  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];
    
    console.log(`[${i + 1}/${keywords.length}] Analyzing: "${keyword}"`);
    
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

      console.log(`✅ [${i + 1}/${keywords.length}] "${keyword}" completed\n`);

      if (i < keywords.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`❌ Error analyzing keyword "${keyword}":`, error);
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

  console.log(`\n🎉 Analysis complete! ${results.length} keywords processed.\n`);

  return results;
}

/**
 * DataForSEO Client - BYOK
 * Retrieve advertiser data from Google Ads Transparency API
 */

export interface DataForSEOCredentials {
  login: string;
  password: string;
}

export interface Advertiser {
  domain: string;
  position: number;
  title: string;
  description: string;
  last_seen: string;
}

export interface KeywordMetrics {
  search_volume: number;
  cpc: number;
  competition: number; // 0-1
}

export interface AdvertiserData {
  keyword: string;
  advertisers: Advertiser[];
  total_advertisers: number;
  competition_level: number;
}

export interface KeywordResult {
  keyword: string;
  advertisers: Advertiser[];
  metrics: KeywordMetrics;
  organic_positions: number[];
  recommendation: 'NO_PAID' | 'YES_PAID' | 'TEST';
}

/**
 * Get advertiser data for a keyword
 */
export async function getAdvertisersData(
  keyword: string,
  credentials: DataForSEOCredentials,
  location: string = 'Italy',
  language: string = 'it'
): Promise<AdvertiserData> {
  try {
    // Step 1: POST task
    const postUrl = 'https://api.dataforseo.com/v3/serp/google/ads_advertisers/task_post';
    
    const postBody = [{
      keyword,
      location_name: location,
      language_code: language,
      device: 'desktop',
      os: 'windows'
    }];

    const authHeader = 'Basic ' + btoa(`${credentials.login}:${credentials.password}`);

    const postResponse = await fetch(postUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postBody)
    });

    if (!postResponse.ok) {
      throw new Error(`DataForSEO POST failed: ${postResponse.status} ${postResponse.statusText}`);
    }

    const postData = await postResponse.json();
    
    if (postData.tasks?.[0]?.status_code !== 20000) {
      throw new Error(`Task creation failed: ${postData.tasks?.[0]?.status_message}`);
    }

    const taskId = postData.tasks[0].id;

    // Step 2: Wait for task completion (poll)
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s

    // Step 3: GET results
    const getUrl = `https://api.dataforseo.com/v3/serp/google/ads_advertisers/task_get/advanced/${taskId}`;
    
    const getResponse = await fetch(getUrl, {
      headers: {
        'Authorization': authHeader
      }
    });

    if (!getResponse.ok) {
      throw new Error(`DataForSEO GET failed: ${getResponse.status}`);
    }

    const getData = await getResponse.json();

    if (getData.tasks?.[0]?.status_code !== 20000) {
      throw new Error(`Task failed: ${getData.tasks?.[0]?.status_message}`);
    }

    const items = getData.tasks[0]?.result?.[0]?.items || [];
    
    const advertisers: Advertiser[] = items
      .filter((item: any) => item.type === 'ad')
      .map((ad: any) => ({
        domain: ad.domain || 'N/A',
        position: ad.rank_absolute || 0,
        title: ad.title || '',
        description: ad.description || '',
        last_seen: new Date().toISOString().split('T')[0]
      }));

    return {
      keyword,
      advertisers,
      total_advertisers: advertisers.length,
      competition_level: advertisers.length > 10 ? 0.8 : advertisers.length / 10
    };

  } catch (error: any) {
    console.error('DataForSEO API Error:', error);
    throw new Error(`Errore DataForSEO: ${error.message}`);
  }
}

/**
 * Get keyword metrics (volume, CPC, competition)
 */
export async function getKeywordMetrics(
  keyword: string,
  credentials: DataForSEOCredentials,
  location: string = 'Italy'
): Promise<KeywordMetrics> {
  try {
    const postUrl = 'https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_ideas/live';
    
    const postBody = [{
      keywords: [keyword],
      location_name: location,
      language_code: 'it',
      include_seed_keyword: true
    }];

    const authHeader = 'Basic ' + btoa(`${credentials.login}:${credentials.password}`);

    const response = await fetch(postUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postBody)
    });

    if (!response.ok) {
      throw new Error(`Keyword metrics failed: ${response.status}`);
    }

    const data = await response.json();
    const items = data.tasks?.[0]?.result?.[0]?.items || [];
    
    if (items.length === 0) {
      // Fallback to estimate
      return {
        search_volume: 1000,
        cpc: 0.5,
        competition: 0.5
      };
    }

    const item = items[0].keyword_info || items[0];

    return {
      search_volume: item.search_volume || 1000,
      cpc: item.cpc || 0.5,
      competition: item.competition || 0.5
    };

  } catch (error: any) {
    console.error('Keyword metrics error:', error);
    // Return safe defaults
    return {
      search_volume: 1000,
      cpc: 0.5,
      competition: 0.5
    };
  }
}

/**
 * Analyze multiple keywords in parallel
 */
export async function analyzeKeywords(
  keywords: string[],
  credentials: DataForSEOCredentials,
  onProgress?: (current: number, total: number) => void
): Promise<KeywordResult[]> {
  const results: KeywordResult[] = [];
  
  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];
    
    try {
      // Get advertisers and metrics in parallel
      const [advertiserData, metrics] = await Promise.all([
        getAdvertisersData(keyword, credentials),
        getKeywordMetrics(keyword, credentials)
      ]);

      results.push({
        keyword,
        advertisers: advertiserData.advertisers,
        metrics,
        organic_positions: [], // Will be populated by analyzer
        recommendation: 'TEST' // Will be calculated by analyzer
      });

      if (onProgress) {
        onProgress(i + 1, keywords.length);
      }

      // Rate limiting: 1 request per second
      if (i < keywords.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error: any) {
      console.error(`Error analyzing ${keyword}:`, error);
      results.push({
        keyword,
        advertisers: [],
        metrics: { search_volume: 0, cpc: 0, competition: 0 },
        organic_positions: [],
        recommendation: 'TEST'
      });
    }
  }

  return results;
}

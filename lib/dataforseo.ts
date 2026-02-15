// lib/dataforseo.ts - DataForSEO API Integration
// ✅ ENDPOINT CORRETTI dalla documentazione ufficiale

const DATAFORSEO_API_BASE = 'https://api.dataforseo.com/v3';

// ✅ Endpoint CORRETTI per Google Ads Keywords Data
const SEARCH_VOLUME_ENDPOINT = '/keywords_data/google_ads/search_volume/live';
const AD_TRAFFIC_ENDPOINT = '/keywords_data/google_ads/ad_traffic_by_keywords/live';

// ✅ Endpoint CORRETTI per Google Organic SERP (LIVE, non task_post)
const ORGANIC_SERP_ENDPOINT = '/serp/google/organic/live/advanced';

// ✅ Endpoint per Advertisers (STANDARD method: task_post + task_get)
const ADS_ADVERTISERS_POST = '/serp/google/ads_advertisers/task_post';
const ADS_ADVERTISERS_GET_BASE = '/serp/google/ads_advertisers/task_get/advanced';

export interface Advertiser {
  domain: string;
  position: number;
  title?: string;
  description?: string;
}

// ✅ ATTENZIONE: competition_index è 0-100, NON 0-1
export interface KeywordMetrics {
  keyword: string;
  search_volume: number;
  cpc: number;
  competition: number; // normalizzato da competition_index / 100
  competition_index: number; // valore originale 0-100
  monthly_searches?: { year: number; month: number; search_volume: number }[];
}

export interface AdvertiserData {
  keyword: string;
  advertisers: Advertiser[];
  organic_positions?: number[];
  forecast?: {
    impressions: number;
    clicks: number;
    ctr: number;
    average_cpc: number;
    cost: number;
  };
}

export interface KeywordResult extends AdvertiserData {
  metrics: KeywordMetrics;
  recommendation?: 'YES_PAID' | 'NO_PAID' | 'TEST';
}

// ✅ Request headers con Basic Auth
function getHeaders(login: string, password: string) {
  const credentials = Buffer.from(`${login}:${password}`).toString('base64');
  return {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json'
  };
}

// ⏱️ Retry con backoff esponenziale
async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.error(`[DataForSEO] Tentativo ${attempt + 1}/${maxRetries} fallito:`, error);
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`[DataForSEO] Riprovo tra ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

// 🔍 1. Get Advertisers Data (STANDARD method: POST task + wait + GET result)
export async function getAdvertisersData(
  keyword: string,
  login: string,
  password: string
): Promise<AdvertiserData> {
  console.log(`[DataForSEO] Getting advertisers for "${keyword}"`);
  
  return retryRequest(async () => {
    // Step 1: POST task
    const postResponse = await fetch(`${DATAFORSEO_API_BASE}${ADS_ADVERTISERS_POST}`, {
      method: 'POST',
      headers: getHeaders(login, password),
      body: JSON.stringify([{
        keyword,
        location_code: 2380, // Italia
        language_code: 'it',
        device: 'desktop',
        os: 'windows'
      }])
    });
    
    if (!postResponse.ok) {
      const errorText = await postResponse.text();
      throw new Error(`Advertisers POST failed (${postResponse.status}): ${errorText}`);
    }
    
    const postData = await postResponse.json();
    console.log('[DataForSEO] Advertisers POST response:', JSON.stringify(postData, null, 2));
    
    if (postData.status_code !== 20000) {
      throw new Error(`POST status: ${postData.status_code} - ${postData.status_message}`);
    }
    
    const taskId = postData.tasks?.[0]?.id;
    if (!taskId) {
      throw new Error('No task ID returned from POST');
    }
    
    console.log(`[DataForSEO] Task created: ${taskId}, waiting 3s...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 2: GET result
    const getResponse = await fetch(`${DATAFORSEO_API_BASE}${ADS_ADVERTISERS_GET_BASE}/${taskId}`, {
      method: 'GET',
      headers: getHeaders(login, password)
    });
    
    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      throw new Error(`Advertisers GET failed (${getResponse.status}): ${errorText}`);
    }
    
    const getData = await getResponse.json();
    console.log('[DataForSEO] Advertisers GET response:', JSON.stringify(getData, null, 2));
    
    if (getData.status_code !== 20000) {
      throw new Error(`GET status: ${getData.status_code} - ${getData.status_message}`);
    }
    
    const result = getData.tasks?.[0]?.result?.[0];
    if (!result) {
      return { keyword, advertisers: [] };
    }
    
    const advertisers = (result.items || [])
      .filter((item: any) => item.type === 'paid')
      .map((item: any) => ({
        domain: item.domain || 'N/A',
        position: item.rank_group || 0,
        title: item.title,
        description: item.description
      }));
    
    console.log(`[DataForSEO] ✅ Found ${advertisers.length} advertisers for "${keyword}"`);
    return { keyword, advertisers };
  }, 3, 2000);
}

// 📊 2. Get Keyword Metrics (LIVE endpoint, corretto!)
export async function getKeywordMetrics(
  keywords: string[],
  login: string,
  password: string
): Promise<KeywordMetrics[]> {
  console.log(`[DataForSEO] Getting metrics for ${keywords.length} keywords`);
  
  return retryRequest(async () => {
    // ✅ ENDPOINT CORRETTO: /keywords_data/google_ads/search_volume/live
    const response = await fetch(`${DATAFORSEO_API_BASE}${SEARCH_VOLUME_ENDPOINT}`, {
      method: 'POST',
      headers: getHeaders(login, password),
      body: JSON.stringify([{
        keywords,
        location_code: 2380, // Italia
        language_code: 'it',
        search_partners: false
      }])
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Search Volume failed (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    console.log('[DataForSEO] Search Volume response:', JSON.stringify(data, null, 2));
    
    if (data.status_code !== 20000) {
      throw new Error(`Status: ${data.status_code} - ${data.status_message}`);
    }
    
    const results = data.tasks?.[0]?.result || [];
    
    const metrics = results.map((item: any) => {
      // ✅ competition_index è 0-100, normalizziamo a 0-1
      const competition_index = item.competition_index ?? 0;
      const competition = competition_index / 100;
      
      return {
        keyword: item.keyword,
        search_volume: item.search_volume ?? 0,
        cpc: item.cpc ?? 0,
        competition,
        competition_index,
        monthly_searches: item.monthly_searches || []
      };
    });
    
    console.log(`[DataForSEO] ✅ Retrieved metrics for ${metrics.length} keywords`);
    return metrics;
  }, 3, 2000);
}

// 🌐 3. Get Organic Positions (LIVE endpoint, corretto!)
export async function getOrganicPositions(
  keyword: string,
  brandDomain: string,
  login: string,
  password: string
): Promise<number[]> {
  console.log(`[DataForSEO] Getting organic positions for "${keyword}" (domain: ${brandDomain})`);
  
  return retryRequest(async () => {
    // ✅ ENDPOINT CORRETTO: /serp/google/organic/live/advanced
    const response = await fetch(`${DATAFORSEO_API_BASE}${ORGANIC_SERP_ENDPOINT}`, {
      method: 'POST',
      headers: getHeaders(login, password),
      body: JSON.stringify([{
        keyword,
        location_code: 2380,
        language_code: 'it',
        device: 'desktop',
        os: 'windows',
        depth: 100 // prime 100 posizioni
      }])
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Organic SERP failed (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    console.log('[DataForSEO] Organic SERP response:', JSON.stringify(data, null, 2));
    
    if (data.status_code !== 20000) {
      throw new Error(`Status: ${data.status_code} - ${data.status_message}`);
    }
    
    const result = data.tasks?.[0]?.result?.[0];
    if (!result) {
      return [];
    }
    
    const items = result.items || [];
    const positions = items
      .filter((item: any) => 
        item.type === 'organic' && 
        item.domain && 
        item.domain.includes(brandDomain)
      )
      .map((item: any) => item.rank_absolute || item.rank_group || 0)
      .filter((pos: number) => pos > 0);
    
    console.log(`[DataForSEO] ✅ Found ${positions.length} organic positions for "${keyword}": [${positions.join(', ')}]`);
    return positions;
  }, 3, 2000);
}

// 📈 4. Get Ad Traffic Forecast (LIVE endpoint, corretto!)
export async function getAdTrafficForecast(
  keyword: string,
  login: string,
  password: string
): Promise<{ impressions: number; clicks: number; ctr: number; average_cpc: number; cost: number }> {
  console.log(`[DataForSEO] Getting ad traffic forecast for "${keyword}"`);
  
  return retryRequest(async () => {
    // ✅ ENDPOINT CORRETTO: /keywords_data/google_ads/ad_traffic_by_keywords/live
    // ⚠️ Richiede parametri "bid" e "match"
    const response = await fetch(`${DATAFORSEO_API_BASE}${AD_TRAFFIC_ENDPOINT}`, {
      method: 'POST',
      headers: getHeaders(login, password),
      body: JSON.stringify([{
        keywords: [keyword],
        location_code: 2380,
        language_code: 'it',
        bid: 999, // bid alto per ottenere stime realistiche
        match: 'exact', // exact match
        date_interval: 'next_month'
      }])
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ad Traffic failed (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    console.log('[DataForSEO] Ad Traffic response:', JSON.stringify(data, null, 2));
    
    if (data.status_code !== 20000) {
      throw new Error(`Status: ${data.status_code} - ${data.status_message}`);
    }
    
    const result = data.tasks?.[0]?.result?.[0];
    if (!result) {
      return { impressions: 0, clicks: 0, ctr: 0, average_cpc: 0, cost: 0 };
    }
    
    const forecast = {
      impressions: result.impressions ?? 0,
      clicks: result.clicks ?? 0,
      ctr: result.ctr ?? 0,
      average_cpc: result.average_cpc ?? 0,
      cost: result.cost ?? 0
    };
    
    console.log(`[DataForSEO] ✅ Forecast for "${keyword}": ${forecast.clicks.toFixed(0)} clicks, ${forecast.impressions.toFixed(0)} impressions`);
    return forecast;
  }, 3, 2000);
}

// 🔄 5. Main function: orchestrare tutte le chiamate
export async function analyzeKeywords(
  keywords: string[],
  login: string,
  password: string,
  brandDomain?: string,
  includeOrganicPositions = true,
  includeAdTrafficForecast = false,
  onProgress?: (current: number, total: number) => void
): Promise<KeywordResult[]> {
  console.log(`[DataForSEO] Starting analysis for ${keywords.length} keywords`);
  console.log(`[DataForSEO] Options: organicPositions=${includeOrganicPositions}, adForecast=${includeAdTrafficForecast}`);
  
  try {
    // Step 1: Get metrics (batch)
    const metrics = await getKeywordMetrics(keywords, login, password);
    const metricsMap = new Map(metrics.map(m => [m.keyword, m]));
    
    // Step 2: Get advertisers + organic positions (sequential con progress)
    const results: KeywordResult[] = [];
    
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      onProgress?.(i + 1, keywords.length);
      
      console.log(`[DataForSEO] Processing ${i + 1}/${keywords.length}: "${keyword}"`);
      
      // Get advertisers (sempre)
      const advertiserData = await getAdvertisersData(keyword, login, password);
      
      // Get organic positions (opzionale)
      let organic_positions: number[] | undefined;
      if (includeOrganicPositions && brandDomain) {
        try {
          organic_positions = await getOrganicPositions(keyword, brandDomain, login, password);
        } catch (error) {
          console.error(`[DataForSEO] Organic positions failed for "${keyword}":`, error);
          organic_positions = [];
        }
      }
      
      const keywordMetrics = metricsMap.get(keyword) || {
        keyword,
        search_volume: 0,
        cpc: 0,
        competition: 0,
        competition_index: 0
      };
      
      results.push({
        ...advertiserData,
        metrics: keywordMetrics,
        organic_positions
      });
      
      // Rate limiting: 1s tra richieste
      if (i < keywords.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`[DataForSEO] ✅ Analysis completed: ${results.length} keywords processed`);
    return results;
    
  } catch (error) {
    console.error('[DataForSEO] ❌ Analysis failed:', error);
    throw error;
  }
}

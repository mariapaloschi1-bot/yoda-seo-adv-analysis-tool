// lib/dataforseo.ts - DataForSEO API Integration CORRETTA
// ✅ Endpoint verificati dalla documentazione ufficiale 2026

const DATAFORSEO_API_BASE = 'https://api.dataforseo.com/v3';

export interface Advertiser {
  domain: string;
  position: number;
  title?: string;
  description?: string;
}

export interface KeywordMetrics {
  keyword: string;
  search_volume: number;
  cpc: number;
  competition: number; // normalizzato 0-1
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

// ✅ Headers con Basic Auth
function getHeaders(login: string, password: string) {
  const credentials = Buffer.from(`${login}:${password}`).toString('base64');
  return {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json'
  };
}

// ⏱️ Retry con backoff
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
      console.error(`[DataForSEO] Attempt ${attempt + 1}/${maxRetries} failed:`, error);
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`[DataForSEO] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

// 📊 1. Get Keyword Metrics (Search Volume, CPC, Competition)
// ✅ ENDPOINT CORRETTO: /keywords_data/google_ads/search_volume/live
export async function getKeywordMetrics(
  keywords: string[],
  login: string,
  password: string
): Promise<KeywordMetrics[]> {
  console.log(`[DataForSEO] Getting metrics for ${keywords.length} keywords`);
  
  return retryRequest(async () => {
    const response = await fetch(`${DATAFORSEO_API_BASE}/keywords_data/google_ads/search_volume/live`, {
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
      throw new Error(`Search Volume API failed (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    console.log('[DataForSEO] Search Volume response:', JSON.stringify(data, null, 2));
    
    if (data.status_code !== 20000) {
      throw new Error(`API Status: ${data.status_code} - ${data.status_message}`);
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

// 💰 2. Get Paid SERP Competitors (Chi sta biddando?)
// ✅ ENDPOINT CORRETTO: /serp/google/paid/live/advanced
export async function getPaidCompetitors(
  keyword: string,
  login: string,
  password: string
): Promise<Advertiser[]> {
  console.log(`[DataForSEO] Getting paid competitors for "${keyword}"`);
  
  return retryRequest(async () => {
    const response = await fetch(`${DATAFORSEO_API_BASE}/serp/google/paid/live/advanced`, {
      method: 'POST',
      headers: getHeaders(login, password),
      body: JSON.stringify([{
        keyword,
        location_code: 2380,
        language_code: 'it',
        device: 'desktop',
        os: 'windows',
        depth: 100 // primi 100 risultati
      }])
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Paid SERP failed (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    console.log('[DataForSEO] Paid SERP response:', JSON.stringify(data, null, 2));
    
    if (data.status_code !== 20000) {
      throw new Error(`API Status: ${data.status_code} - ${data.status_message}`);
    }
    
    const result = data.tasks?.[0]?.result?.[0];
    if (!result) {
      return [];
    }
    
    // Filtra solo gli annunci paid
    const items = result.items || [];
    const advertisers = items
      .filter((item: any) => item.type === 'paid')
      .map((item: any) => ({
        domain: item.domain || 'N/A',
        position: item.rank_absolute || item.rank_group || 0,
        title: item.title,
        description: item.description
      }));
    
    console.log(`[DataForSEO] ✅ Found ${advertisers.length} paid advertisers for "${keyword}"`);
    return advertisers;
  }, 3, 2000);
}

// 🌐 3. Get Organic SERP Positions (Posizioni organiche)
// ✅ ENDPOINT CORRETTO: /serp/google/organic/live/advanced
export async function getOrganicPositions(
  keyword: string,
  brandDomain: string,
  login: string,
  password: string
): Promise<number[]> {
  console.log(`[DataForSEO] Getting organic positions for "${keyword}" (domain: ${brandDomain})`);
  
  return retryRequest(async () => {
    const response = await fetch(`${DATAFORSEO_API_BASE}/serp/google/organic/live/advanced`, {
      method: 'POST',
      headers: getHeaders(login, password),
      body: JSON.stringify([{
        keyword,
        location_code: 2380,
        language_code: 'it',
        device: 'desktop',
        os: 'windows',
        depth: 100
      }])
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Organic SERP failed (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    console.log('[DataForSEO] Organic SERP response:', JSON.stringify(data, null, 2));
    
    if (data.status_code !== 20000) {
      throw new Error(`API Status: ${data.status_code} - ${data.status_message}`);
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
    
    console.log(`[DataForSEO] ✅ Found ${positions.length} organic positions: [${positions.join(', ')}]`);
    return positions;
  }, 3, 2000);
}

// 📈 4. Get Ad Traffic Forecast
// ✅ ENDPOINT CORRETTO: /keywords_data/google_ads/ad_traffic_by_keywords/live
export async function getAdTrafficForecast(
  keyword: string,
  login: string,
  password: string
): Promise<{ impressions: number; clicks: number; ctr: number; average_cpc: number; cost: number }> {
  console.log(`[DataForSEO] Getting ad traffic forecast for "${keyword}"`);
  
  return retryRequest(async () => {
    const response = await fetch(`${DATAFORSEO_API_BASE}/keywords_data/google_ads/ad_traffic_by_keywords/live`, {
      method: 'POST',
      headers: getHeaders(login, password),
      body: JSON.stringify([{
        keywords: [keyword],
        location_code: 2380,
        language_code: 'it',
        bid: 999, // bid alto per stime realistiche
        match: 'exact',
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
      throw new Error(`API Status: ${data.status_code} - ${data.status_message}`);
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
    
    console.log(`[DataForSEO] ✅ Forecast: ${forecast.clicks.toFixed(0)} clicks, ${forecast.impressions.toFixed(0)} impressions`);
    return forecast;
  }, 3, 2000);
}

// 🔄 5. Main Function: Orchestrate All API Calls
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
    // Step 1: Get metrics (batch - veloce!)
    console.log('[DataForSEO] Step 1/3: Fetching metrics (batch)...');
    const metrics = await getKeywordMetrics(keywords, login, password);
    const metricsMap = new Map(metrics.map(m => [m.keyword, m]));
    
    // Step 2: Get paid competitors + organic positions (sequential)
    console.log('[DataForSEO] Step 2/3: Fetching paid competitors...');
    const results: KeywordResult[] = [];
    
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      onProgress?.(i + 1, keywords.length);
      
      console.log(`[DataForSEO] Processing ${i + 1}/${keywords.length}: "${keyword}"`);
      
      // Get paid competitors
      const advertisers = await getPaidCompetitors(keyword, login, password);
      
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
        keyword,
        advertisers,
        metrics: keywordMetrics,
        organic_positions
      });
      
      // Rate limiting: 1s tra richieste
      if (i < keywords.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Step 3: Add forecast (opzionale)
    if (includeAdTrafficForecast) {
      console.log('[DataForSEO] Step 3/3: Adding ad traffic forecast...');
      for (let i = 0; i < results.length; i++) {
        try {
          results[i].forecast = await getAdTrafficForecast(results[i].keyword, login, password);
          
          // Rate limiting
          if (i < results.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`[DataForSEO] Forecast failed for "${results[i].keyword}":`, error);
          results[i].forecast = undefined;
        }
      }
    }
    
    console.log(`[DataForSEO] ✅ Analysis completed: ${results.length} keywords processed`);
    return results;
    
  } catch (error) {
    console.error('[DataForSEO] ❌ Analysis failed:', error);
    throw error;
  }
}

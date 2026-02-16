/**
 * Gemini AI Client - BYOK con Fallback Robusto
 * Generate insights using Google Gemini API
 */

import { KeywordResult } from './dataforseo';

export interface GeminiInsight {
  summary: string;
  recommendations: string[];
  budget_estimate: string;
  priority_keywords: string[];
}

/**
 * Generate AI insights from keyword analysis
 */
export async function generateInsights(
  results: KeywordResult[],
  apiKey: string,
  brandName?: string
): Promise<GeminiInsight> {
  // ✅ SEMPRE usa fallback se non c'è API key
  if (!apiKey || apiKey.trim() === '') {
    console.warn('⚠️ No Gemini API key provided, using fallback insights');
    return generateFallbackInsights(results);
  }

  try {
    const prompt = buildPrompt(results, brandName);
    
    console.log('🤖 Calling Gemini API for insights...');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        })
      }
    );

    if (!response.ok) {
      console.error(`❌ Gemini API error: ${response.status}`);
      console.warn('⚠️ Using fallback insights instead');
      return generateFallbackInsights(results);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text) {
      console.warn('⚠️ Empty response from Gemini, using fallback');
      return generateFallbackInsights(results);
    }

    const parsed = parseInsights(text, results);
    console.log('✅ Gemini insights generated successfully');
    return parsed;

  } catch (error: any) {
    console.error('❌ Gemini API Error:', error.message);
    console.warn('⚠️ Using fallback insights');
    return generateFallbackInsights(results);
  }
}

/**
 * Build prompt for Gemini
 */
function buildPrompt(results: KeywordResult[], brandName?: string): string {
  const keywordsData = results.map(r => ({
    keyword: r.keyword,
    volume: r.metrics.search_volume,
    cpc: r.metrics.cpc,
    competition: r.metrics.competition,
    advertisers: r.advertisers.length,
    recommendation: r.recommendation
  }));

  return `Sei un esperto di marketing digitale e SEO. Analizza questi dati di keyword e fornisci insights strategici in ITALIANO.

Dati Keywords:
${JSON.stringify(keywordsData, null, 2)}

${brandName ? `Brand: ${brandName}` : ''}

Fornisci un'analisi in formato JSON con questa struttura ESATTA:
{
  "summary": "Breve analisi della situazione complessiva (2-3 frasi)",
  "recommendations": ["Raccomandazione 1", "Raccomandazione 2", "Raccomandazione 3"],
  "budget_estimate": "€X-Y/mese",
  "priority_keywords": ["keyword1", "keyword2", "keyword3"]
}

Rispondi SOLO con il JSON, senza altri testi.`;
}

/**
 * Parse Gemini response
 */
function parseInsights(text: string, results: KeywordResult[]): GeminiInsight {
  try {
    // Estrai JSON dalla risposta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || 'Analisi generata',
        recommendations: parsed.recommendations || [],
        budget_estimate: parsed.budget_estimate || '€0-0/mese',
        priority_keywords: parsed.priority_keywords || []
      };
    }
  } catch (error) {
    console.warn('Failed to parse Gemini response, using fallback');
  }
  
  return generateFallbackInsights(results);
}

/**
 * ✅ FALLBACK ROBUSTO: Genera insights senza AI
 */
function generateFallbackInsights(results: KeywordResult[]): GeminiInsight {
  const yesPaid = results.filter(r => r.recommendation === 'YES_PAID');
  const noPaid = results.filter(r => r.recommendation === 'NO_PAID');
  const test = results.filter(r => r.recommendation === 'TEST');

  // Calcola metriche aggregate
  const totalVolume = results.reduce((sum, r) => sum + r.metrics.search_volume, 0);
  const avgCpc = results.reduce((sum, r) => sum + r.metrics.cpc, 0) / results.length;
  const avgCompetition = results.reduce((sum, r) => sum + r.metrics.competition, 0) / results.length;
  
  // Budget stimato (CTR 2%)
  const lowBudget = Math.round(totalVolume * 0.02 * avgCpc * 0.7);
  const highBudget = Math.round(totalVolume * 0.02 * avgCpc * 1.3);

  // Genera summary intelligente
  let summary = `Analisi di ${results.length} keywords completata. `;
  
  if (noPaid.length > yesPaid.length) {
    summary += `Focus su SEO raccomandato per ${noPaid.length} keywords (${Math.round(noPaid.length/results.length*100)}%). `;
  } else if (yesPaid.length > 0) {
    summary += `Investimento in Paid consigliato per ${yesPaid.length} keywords ad alta competizione. `;
  }
  
  summary += `Volume totale: ${totalVolume.toLocaleString()}, CPC medio: €${avgCpc.toFixed(2)}.`;

  // Raccomandazioni intelligenti
  const recommendations: string[] = [];
  
  if (noPaid.length > 0) {
    recommendations.push(`Concentrati su ${noPaid.length} keywords con bassa competizione per SEO organico`);
  }
  
  if (yesPaid.length > 0) {
    recommendations.push(`Valuta campagne Paid per ${yesPaid.length} keywords ad alta conversione`);
  }
  
  if (test.length > 0) {
    recommendations.push(`Testa ${test.length} keywords con budget limitato per validare il ROI`);
  }
  
  if (avgCompetition > 0.7) {
    recommendations.push('Mercato altamente competitivo: considera long-tail keywords');
  }
  
  if (avgCpc > 2) {
    recommendations.push('CPC elevato: ottimizza Quality Score per ridurre costi');
  }

  // Top 5 keywords per volume
  const topKeywords = [...results]
    .sort((a, b) => b.metrics.search_volume - a.metrics.search_volume)
    .slice(0, 5)
    .map(r => r.keyword);

  return {
    summary,
    recommendations: recommendations.slice(0, 5),
    budget_estimate: `€${lowBudget}-${highBudget}/mese`,
    priority_keywords: topKeywords
  };
}

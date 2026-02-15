/**
 * Gemini AI Client - BYOK
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
  try {
    const prompt = buildPrompt(results, brandName);
    
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
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return parseInsights(text, results);

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return generateFallbackInsights(results);
  }
}

function buildPrompt(results: KeywordResult[], brandName?: string): string {
  const summary = results.map(r => ({
    keyword: r.keyword,
    advertisers: r.advertisers.length,
    cpc: r.metrics.cpc,
    competition: r.metrics.competition,
    volume: r.metrics.search_volume,
    recommendation: r.recommendation
  }));

  return `
Analizza questi dati SEO/PPC per ${brandName || 'il sito'} e fornisci:

1. **SUMMARY**: Sintesi in 2-3 frasi della situazione competitiva
2. **RECOMMENDATIONS**: 3-4 raccomandazioni strategiche numerate
3. **BUDGET**: Stima budget mensile necessario (formato: "€X - €Y")
4. **PRIORITY**: 5 keyword prioritarie da biddare subito

DATI:
${JSON.stringify(summary, null, 2)}

REGOLE:
- Keywords con 3-4+ posizioni organiche top-3 → NO paid
- Keywords generiche con CPC alto + bassa presenza organica → SI paid
- Considera il ROI: volume × CTR × conversion rate
- Budget = sum(CPC × clicks stimati)

Rispondi in italiano, formato JSON:
{
  "summary": "...",
  "recommendations": ["1. ...", "2. ...", "3. ..."],
  "budget_estimate": "€X - €Y",
  "priority_keywords": ["kw1", "kw2", ...]
}
`;
}

function parseInsights(text: string, results: KeywordResult[]): GeminiInsight {
  try {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      return {
        summary: parsed.summary || 'Analisi completata.',
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        budget_estimate: parsed.budget_estimate || 'N/A',
        priority_keywords: Array.isArray(parsed.priority_keywords) ? parsed.priority_keywords : []
      };
    }
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
  }

  return generateFallbackInsights(results);
}

function generateFallbackInsights(results: KeywordResult[]): GeminiInsight {
  const yesCount = results.filter(r => r.recommendation === 'YES_PAID').length;
  const noCount = results.filter(r => r.recommendation === 'NO_PAID').length;
  const testCount = results.filter(r => r.recommendation === 'TEST').length;

  const avgCPC = results.reduce((sum, r) => sum + r.metrics.cpc, 0) / results.length;
  const totalVolume = results.reduce((sum, r) => sum + r.metrics.search_volume, 0);

  const estimatedClicks = totalVolume * 0.02; // 2% CTR estimate
  const budgetLow = Math.round(estimatedClicks * avgCPC * 0.7);
  const budgetHigh = Math.round(estimatedClicks * avgCPC * 1.3);

  const priorityKeywords = results
    .filter(r => r.recommendation === 'YES_PAID')
    .sort((a, b) => b.metrics.search_volume - a.metrics.search_volume)
    .slice(0, 5)
    .map(r => r.keyword);

  return {
    summary: `Analizzate ${results.length} keywords: ${yesCount} richiedono paid (alta competizione), ${noCount} hanno già forte presenza organica, ${testCount} da testare. Budget medio CPC: €${avgCPC.toFixed(2)}.`,
    recommendations: [
      `1. Priorità alta: investire su ${yesCount} keywords generiche con alto traffico potenziale`,
      `2. Ottimizzazione: ${noCount} keywords brand già performano bene organicamente`,
      `3. Testing: sperimentare con budget limitato su ${testCount} keywords a medio potenziale`,
      `4. Monitoraggio: verificare ROI settimanalmente e ottimizzare le offerte`
    ],
    budget_estimate: `€${budgetLow} - €${budgetHigh}`,
    priority_keywords
  };
}

/**
 * Simple Gemini call for single-keyword analysis
 */
export async function analyzeKeywordIntent(
  keyword: string,
  apiKey: string
): Promise<string> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analizza l'intento di ricerca della keyword "${keyword}" in 1 frase (informazionale, navigazionale, transazionale, commerciale).`
            }]
          }],
          generationConfig: { maxOutputTokens: 100 }
        })
      }
    );

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Intento sconosciuto';
  } catch {
    return 'Intento sconosciuto';
  }
}

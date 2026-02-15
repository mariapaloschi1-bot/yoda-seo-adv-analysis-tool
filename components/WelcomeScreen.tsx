/**
 * Welcome Screen - Yoda's Paid Intelligence
 * CON CHECKBOX OPZIONALI PER ANALISI AVANZATE
 */

'use client';

import { useState } from 'react';

interface WelcomeScreenProps {
  onStart: (options: AnalysisOptions) => void;
}

export interface AnalysisOptions {
  includeAdTrafficForecast: boolean;
  includeOrganicPositions: boolean;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [options, setOptions] = useState<AnalysisOptions>({
    includeAdTrafficForecast: false,
    includeOrganicPositions: true, // Default ON (essenziale)
  });

  // Calcolo costo dinamico
  const baseCost = 0.525; // Advertisers ($0.45) + Metrics ($0.075)
  const organicCost = options.includeOrganicPositions ? 0.30 : 0;
  const forecastCost = options.includeAdTrafficForecast ? 0.075 : 0;
  const totalCostPerKeyword = baseCost + organicCost + forecastCost;
  const totalCostFor150 = (totalCostPerKeyword * 150).toFixed(2);

  const handleStart = () => {
    onStart(options);
  };

  return (
    <div className="min-h-screen bg-stardust flex items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center">
        
        {/* Baby Yoda Animated */}
        <div className="flex justify-center mb-8 animate-bounce" style={{ animationDuration: '1.5s' }}>
          <div className="relative w-32 h-32 rounded-full border-4 border-teal-500/50 overflow-hidden shadow-[0_0_40px_rgba(45,212,191,0.4)] bg-slate-800">
            <img
              src="https://www.shutterstock.com/image-vector/baby-yoda-grogu-cartoon-character-260nw-2293123629.jpg"
              alt="Baby Yoda"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-teal-400 mb-4 tracking-tight drop-shadow-lg">
          Yoda's Paid Intelligence
        </h1>
        
        <p className="text-xl text-slate-300 italic mb-8">
          "Bilanciare paid e organic, la via del Maestro è."
        </p>

        {/* What it does */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-teal-500/30 p-8 mb-8 text-left space-y-6 glow-teal">
          <h2 className="text-2xl font-bold text-teal-400 mb-4 text-center">Cosa Fa Questo Tool?</h2>
          
          <div className="space-y-4 text-slate-300">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-500/20 border border-teal-500/50 flex items-center justify-center">
                <span className="text-teal-400 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-teal-300 mb-1">Analisi Bidding Competitiva</h3>
                <p className="text-sm text-slate-400">
                  Per ogni keyword inserita, scopri <strong>chi sta facendo paid advertising</strong> su Google: 
                  numero di inserzionisti, domini, posizioni pubblicitarie.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-500/20 border border-teal-500/50 flex items-center justify-center">
                <span className="text-teal-400 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-teal-300 mb-1">Metriche di Investimento (CPC, Volume, Competition)</h3>
                <p className="text-sm text-slate-400">
                  <strong>CPC medio</strong> (costo per click in €), <strong>volume di ricerca mensile</strong>, 
                  e <strong>livello di competizione</strong> (0-100%) direttamente da DataForSEO.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-500/20 border border-teal-500/50 flex items-center justify-center">
                <span className="text-teal-400 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-teal-300 mb-1">Posizioni Organiche (SERP Analysis)</h3>
                <p className="text-sm text-slate-400">
                  Top-20 risultati organici per ogni keyword: domini, posizioni, titoli. 
                  Confronta chi domina il paid vs chi domina l'organico.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-500/20 border border-teal-500/50 flex items-center justify-center">
                <span className="text-teal-400 font-bold">4</span>
              </div>
              <div>
                <h3 className="font-semibold text-teal-300 mb-1">Insights AI Strategici (Gemini)</h3>
                <p className="text-sm text-slate-400">
                  Raccomandazioni automatiche: quale keyword investire in paid, quali ottimizzare per SEO, 
                  budget stimato, ROI previsto. Tutto generato da AI.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* NUOVO: Opzioni analisi avanzate */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-amber-500/30 p-8 mb-8 text-left space-y-4">
          <h2 className="text-xl font-bold text-amber-400 mb-4 text-center">⚙️ Opzioni Analisi</h2>
          
          {/* Organic Positions - ESSENZIALE */}
          <label className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700 hover:border-teal-500/50 transition cursor-pointer group">
            <input
              type="checkbox"
              checked={options.includeOrganicPositions}
              onChange={(e) => setOptions(prev => ({ ...prev, includeOrganicPositions: e.target.checked }))}
              className="mt-1 w-5 h-5 text-teal-600 bg-slate-800 border-slate-600 rounded focus:ring-teal-500 focus:ring-2 cursor-pointer"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-teal-300 group-hover:text-teal-200 transition">
                  Analisi Posizioni Organiche (SERP)
                </h3>
                <span className="text-xs bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30">
                  Raccomandato
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Top-20 risultati organici per ogni keyword. <strong>Essenziale</strong> per confrontare 
                paid vs organic e identificare opportunità SEO.
              </p>
              <p className="text-xs text-amber-400 mt-2">
                💰 Costo aggiuntivo: <strong>+$0.30/keyword</strong> (+€40.50 per 150 kw)
              </p>
            </div>
          </label>

          {/* Ad Traffic Forecast - OPZIONALE */}
          <label className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700 hover:border-amber-500/50 transition cursor-pointer group">
            <input
              type="checkbox"
              checked={options.includeAdTrafficForecast}
              onChange={(e) => setOptions(prev => ({ ...prev, includeAdTrafficForecast: e.target.checked }))}
              className="mt-1 w-5 h-5 text-amber-600 bg-slate-800 border-slate-600 rounded focus:ring-amber-500 focus:ring-2 cursor-pointer"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-amber-300 group-hover:text-amber-200 transition">
                  Forecast Traffico Paid (Impressions, CTR, Clicks)
                </h3>
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                  Avanzato
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stime precise di <strong>impressions</strong>, <strong>CTR</strong>, <strong>clicks mensili</strong> 
                e <strong>costo totale campagna</strong> basate su bid €50. Utile per pianificazione budget dettagliata.
              </p>
              <p className="text-xs text-amber-400 mt-2">
                💰 Costo aggiuntivo: <strong>+$0.075/keyword</strong> (+€10.13 per 150 kw)
              </p>
            </div>
          </label>
        </div>

        {/* BYOK Cost Notice - DINAMICO */}
        <div className="bg-amber-900/30 border border-amber-600/50 rounded-xl p-5 mb-8">
          <p className="text-amber-200 text-sm mb-3">
            <strong>💰 Bring Your Own Key (BYOK):</strong> Usa le tue API key DataForSEO e Gemini.
          </p>
          <div className="bg-slate-900/50 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Costo per keyword:</span>
              <span className="text-sm font-bold text-amber-300">${totalCostPerKeyword.toFixed(3)}</span>
            </div>
            <div className="flex items-center justify-between text-lg font-extrabold">
              <span className="text-teal-300">Totale per 150 keywords:</span>
              <span className="text-amber-400">~€{totalCostFor150}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-center">
              vs SEMrush €119/mese • Risparmio {((1 - parseFloat(totalCostFor150) / 119) * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="group relative px-10 py-5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold text-lg rounded-xl shadow-[0_0_30px_rgba(45,212,191,0.5)] hover:shadow-[0_0_50px_rgba(45,212,191,0.8)] transition-all duration-300 transform hover:scale-105"
        >
          <span className="flex items-center gap-3 justify-center">
            <span className="text-2xl">✨</span>
            Inizia Analisi Paid vs Organic
            <span className="text-2xl">✨</span>
          </span>
        </button>

        <p className="text-slate-500 text-sm mt-6">
          Analizza fino a 150 keywords in una sessione
        </p>
      </div>
    </div>
  );
}

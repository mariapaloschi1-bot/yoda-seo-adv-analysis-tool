/**
 * Welcome Screen - Yoda's Paid Intelligence
 */

'use client';

import { Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
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

        {/* BYOK Cost Notice */}
        <div className="bg-amber-900/30 border border-amber-600/50 rounded-xl p-5 mb-8">
          <p className="text-amber-200 text-sm">
            <strong>💰 Bring Your Own Key (BYOK):</strong> Usa le tue API key DataForSEO e Gemini. 
            Costo stimato: <strong>~€0.55 per 150 keywords</strong> (vs SEMrush €119/mese).
          </p>
        </div>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="group relative px-10 py-5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold text-lg rounded-xl shadow-[0_0_30px_rgba(45,212,191,0.5)] hover:shadow-[0_0_50px_rgba(45,212,191,0.8)] transition-all duration-300 transform hover:scale-105"
        >
          <span className="flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            Inizia Analisi Paid vs Organic
            <Sparkles className="w-6 h-6" />
          </span>
        </button>

        <p className="text-slate-500 text-sm mt-6">
          Analizza fino a 150 keywords in una sessione
        </p>
      </div>
    </div>
  );
}

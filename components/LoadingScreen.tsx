/**
 * Loading Screen with Progress
 */

'use client';

import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  currentKeyword: string;
  progress: number;
  total: number;
}

export default function LoadingScreen({ currentKeyword, progress, total }: LoadingScreenProps) {
  const [dots, setDots] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    "🧘 La pazienza è la via della Forza...",
    "🔍 Esploro la galassia dei bidders...",
    "💰 Calcolo i CPC nel Lato Chiaro...",
    "🎯 Analizzo la competizione paid...",
    "📊 Raccolgo dati dalle stelle...",
    "🌌 Navigando tra SERP e ads...",
    "⚡ La Forza scorre nei dati...",
  ];

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 3000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(messageInterval);
    };
  }, []);

  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Yoda Icon */}
        <div className="text-center mb-8">
          <div className="text-8xl animate-pulse mb-4">🐸</div>
          <h2 className="text-3xl font-bold text-teal-400 mb-2">
            Analisi in Corso{dots}
          </h2>
          <p className="text-slate-400">
            {messages[messageIndex]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-800 rounded-xl border border-teal-500/30 p-8 shadow-2xl shadow-teal-500/20">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Keyword Analizzate</span>
              <span className="text-lg font-bold text-teal-400">
                {progress} / {total}
              </span>
            </div>
            <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-600 to-teal-400 transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-center mt-2 text-2xl font-bold text-teal-400">
              {percentage}%
            </div>
          </div>

          {/* Current Keyword */}
          {currentKeyword && (
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <p className="text-xs text-slate-500 mb-1">Keyword Corrente:</p>
              <p className="text-lg font-semibold text-teal-300">
                {currentKeyword}
              </p>
            </div>
          )}

          {/* Animated Lightsaber */}
          <div className="mt-6 flex justify-center">
            <div className="w-16 h-2 bg-teal-500 rounded-full animate-pulse shadow-lg shadow-teal-500/50" />
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-slate-500">
          ⏱️ Tempo stimato: ~{Math.ceil((total - progress) * 1.5)}s • DataForSEO API in azione
        </div>
      </div>
    </div>
  );
}

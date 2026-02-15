/**
 * Loading Screen with Yoda-style messages
 */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  currentKeyword: string;
  progress: number;
  total: number;
}

export default function LoadingScreen({ currentKeyword, progress, total }: LoadingScreenProps) {
  const [dots, setDots] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);

  const yodaMessages = [
    "Meditare sui dati della galassia, sto...",
    "Nel Lato Luminoso delle SERP, guardare devo...",
    "Bidders nella Forza, sentire posso...",
    "Pazienza, giovane Padawan. Lento il CPC è...",
    "Competizione nel Lato Oscuro, esplorare devo...",
    "Keywords analizzare, tempo serve...",
    "ROI ottimizzare, la via del Maestro è...",
  ];

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % yodaMessages.length);
    }, 3500);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(messageInterval);
    };
  }, []);

  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;
  const estimatedTime = Math.ceil((total - progress) * 1.5);

  return (
    <div className="min-h-screen bg-stardust flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Yoda Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative w-32 h-32 yoda-pulse">
            <Image
              src="/yoda-icon.svg"
              alt="Maestro Yoda"
              width={128}
              height={128}
              className="animate-pulse"
              priority
            />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-teal-400 mb-3">
            Meditando sui Dati{dots}
          </h2>
          <p className="text-slate-400 italic text-lg">
            "{yodaMessages[messageIndex]}"
          </p>
        </div>

        {/* Progress Card */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-teal-500/30 p-8 glow-teal">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-slate-400">Keywords Meditate</span>
              <span className="text-lg font-bold text-teal-400">
                {progress} / {total}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="relative w-full h-5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="absolute inset-0 bg-gradient-to-r from-teal-600 via-teal-500 to-teal-400 transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
            
            <div className="text-center mt-3 text-3xl font-bold text-teal-400">
              {percentage}%
            </div>
          </div>

          {/* Current Keyword */}
          {currentKeyword && (
            <div className="bg-slate-900/70 rounded-lg p-5 border border-teal-500/20">
              <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Keyword Corrente:</p>
              <p className="text-xl font-semibold text-teal-300 font-mono">
                "{currentKeyword}"
              </p>
            </div>
          )}

          {/* Animated Lightsaber */}
          <div className="mt-8 flex justify-center items-center gap-3">
            <div className="w-20 h-3 bg-gradient-to-r from-transparent via-teal-500 to-teal-400 rounded-full animate-pulse glow-teal-strong" />
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-ping" />
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            ⏱️ Tempo stimato: ~{estimatedTime}s • DataForSEO API in azione
          </p>
          <p className="text-xs text-slate-600 mt-2">
            "Fretta mai avere devi. Accuratezza, la chiave è." — Maestro Yoda
          </p>
        </div>
      </div>
    </div>
  );
}

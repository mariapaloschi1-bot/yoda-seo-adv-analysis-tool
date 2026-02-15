/**
 * Setup View - BYOK API Keys Input
 */

'use client';

import { useState } from 'react';
import type { ApiKeys } from '@/app/page';

interface SetupViewProps {
  onComplete: (keys: ApiKeys) => void;
}

export default function SetupView({ onComplete }: SetupViewProps) {
  const [dataForSeoLogin, setDataForSeoLogin] = useState('');
  const [dataForSeoPassword, setDataForSeoPassword] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dataForSeoLogin || !dataForSeoPassword || !geminiKey) {
      alert('⚠️ Tutti i campi sono obbligatori!');
      return;
    }

    onComplete({
      dataForSeo: {
        login: dataForSeoLogin,
        password: dataForSeoPassword
      },
      gemini: geminiKey
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-4 animate-pulse">🐸</div>
          <h1 className="text-4xl font-bold text-teal-400 mb-2">
            Yoda's Organic-Paid Analysis
          </h1>
          <p className="text-slate-400 text-lg">
            "Forza nelle chiavi API, trovare devi." — Maestro Yoda
          </p>
        </div>

        {/* Setup Card */}
        <div className="bg-slate-800 rounded-2xl border border-teal-500/30 shadow-2xl shadow-teal-500/20 p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🔑</span>
            <h2 className="text-2xl font-bold text-teal-400">
              Setup API Keys (BYOK)
            </h2>
          </div>

          <div className="bg-teal-900/20 border border-teal-500/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-teal-300">
              ✅ <strong>Sicurezza BYOK</strong>: Le tue chiavi API vengono salvate <strong>solo nel browser</strong> (localStorage).
              Nessun dato viene inviato a server esterni.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* DataForSEO Login */}
            <div>
              <label className="block text-sm font-semibold text-teal-400 mb-2">
                🌐 DataForSEO Login
              </label>
              <input
                type="text"
                value={dataForSeoLogin}
                onChange={(e) => setDataForSeoLogin(e.target.value)}
                placeholder="es. user@example.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
              />
              <p className="text-xs text-slate-500 mt-1">
                Registrati su{' '}
                <a
                  href="https://app.dataforseo.com/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:underline"
                >
                  DataForSEO
                </a>
              </p>
            </div>

            {/* DataForSEO Password */}
            <div>
              <label className="block text-sm font-semibold text-teal-400 mb-2">
                🔐 DataForSEO Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={dataForSeoPassword}
                  onChange={(e) => setDataForSeoPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-teal-500 transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-400"
                >
                  {showPasswords ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Gemini API Key */}
            <div>
              <label className="block text-sm font-semibold text-teal-400 mb-2">
                🧠 Google Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIza••••••••••••••••••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-teal-500 transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-400"
                >
                  {showPasswords ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Ottieni la chiave su{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:underline"
                >
                  Google AI Studio
                </a>{' '}
                (gratis)
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold py-4 rounded-lg transition-all shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50"
            >
              🚀 Inizia Analisi
            </button>
          </form>

          {/* Info Cost */}
          <div className="mt-6 text-center text-sm text-slate-500">
            💰 Costo per 150 keywords: ~$0.60 (DataForSEO $0.50 + Gemini $0.10)
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-600">
          <p>May the Force be with your CTR • Powered by DataForSEO + Gemini</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Domain Input - Analyze a specific domain
 */

'use client';

import { useState } from 'react';
import type { ApiKeys } from '@/app/page';

interface DomainInputProps {
  apiKeys: ApiKeys;
  onStart: (data: { domain: string }) => void;
  onBack: () => void;
}

export default function DomainInput({ apiKeys, onStart, onBack }: DomainInputProps) {
  const [domain, setDomain] = useState('');

  const handleSubmit = () => {
    const cleanDomain = domain.trim().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');

    if (!cleanDomain) {
      alert('⚠️ Inserisci un dominio valido!');
      return;
    }

    // For now, redirect to keywords mode with a note
    alert('🚧 Domain Analysis in sviluppo!\n\nPer ora usa la modalità "Bulk Keywords" e inserisci manualmente le keyword del tuo dominio.');
    onBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="text-6xl">🐸</div>
            <div>
              <h1 className="text-3xl font-bold text-teal-400">
                Domain Analysis
              </h1>
              <p className="text-slate-400 mt-1">
                Analizza un dominio specifico
              </p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-all"
          >
            ← Indietro
          </button>
        </div>

        {/* Input Card */}
        <div className="bg-slate-800 rounded-2xl border border-teal-500/30 shadow-2xl shadow-teal-500/20 p-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-teal-400 mb-3">
              🌐 Dominio da Analizzare
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="es. nike.com"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 text-lg focus:outline-none focus:border-teal-500 transition-colors"
            />
            <p className="text-xs text-slate-500 mt-2">
              Inserisci solo il dominio (senza http:// o www)
            </p>
          </div>

          {/* Info */}
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-300">
              🚧 <strong>Feature in sviluppo</strong>: Questa modalità richiede crawling del sito per estrarre keyword.
              Per ora usa la modalità <strong>Bulk Keywords</strong> e inserisci manualmente le keyword del tuo dominio.
            </p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold py-4 rounded-lg transition-all shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50"
          >
            🚀 Avvia Analisi
          </button>
        </div>

        {/* Example Box */}
        <div className="mt-6 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="font-semibold text-teal-400 mb-3">💡 Esempio Workflow</h3>
          <ol className="space-y-2 text-sm text-slate-400">
            <li>1. Inserisci dominio: <code className="text-teal-300">nike.com</code></li>
            <li>2. Il sistema identifica keyword su cui bidda Nike</li>
            <li>3. Per ogni keyword mostra competitor e metriche</li>
            <li>4. Raccomandazione SE continuare a biddare o ottimizzare SEO</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

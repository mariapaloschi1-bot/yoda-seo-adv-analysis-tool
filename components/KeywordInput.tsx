/**
 * Keyword Input - Bulk keywords entry (CSV/TXT or manual)
 */

'use client';

import { useState } from 'react';
import type { ApiKeys } from '@/app/page';

interface KeywordInputProps {
  apiKeys: ApiKeys;
  onStart: (data: { keywords: string[] }) => void;
  onBack: () => void;
}

export default function KeywordInput({ apiKeys, onStart, onBack }: KeywordInputProps) {
  const [keywords, setKeywords] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setKeywords(text);
      };
      reader.readAsText(uploadedFile);
    }
  };

  const handleSubmit = () => {
    const lines = keywords
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      alert('⚠️ Inserisci almeno 1 keyword!');
      return;
    }

    if (lines.length > 150) {
      alert('⚠️ Massimo 150 keywords consentite!');
      return;
    }

    onStart({ keywords: lines });
  };

  const keywordCount = keywords.split('\n').filter(l => l.trim()).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="text-6xl">🐸</div>
            <div>
              <h1 className="text-3xl font-bold text-teal-400">
                Bulk Keywords Analysis
              </h1>
              <p className="text-slate-400 mt-1">
                Carica o inserisci fino a 150 keywords
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
          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-teal-400 mb-3">
              📁 Carica File (CSV/TXT)
            </label>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="block w-full text-sm text-slate-400
                file:mr-4 file:py-3 file:px-6
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-teal-600 file:text-white
                hover:file:bg-teal-500 file:cursor-pointer
                cursor-pointer"
            />
            {file && (
              <p className="mt-2 text-sm text-teal-300">
                ✅ File caricato: <strong>{file.name}</strong>
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-700"></div>
            <span className="text-slate-500 text-sm">oppure</span>
            <div className="flex-1 h-px bg-slate-700"></div>
          </div>

          {/* Manual Input */}
          <div>
            <label className="block text-sm font-semibold text-teal-400 mb-3">
              ✍️ Inserisci Manualmente (una per riga)
            </label>
            <textarea
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder={`scarpe running\nscarpe trail\nnike running\nadidas scarpe\n...`}
              rows={12}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-teal-500 transition-colors resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-slate-500">
                Una keyword per riga, max 150
              </p>
              <p className={`text-sm font-semibold ${
                keywordCount > 150 ? 'text-red-400' : keywordCount > 0 ? 'text-teal-400' : 'text-slate-500'
              }`}>
                {keywordCount} / 150
              </p>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleSubmit}
            disabled={keywordCount === 0 || keywordCount > 150}
            className="w-full mt-8 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold py-4 rounded-lg transition-all shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚀 Avvia Analisi ({keywordCount} keywords)
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-teal-900/20 border border-teal-500/30 rounded-lg p-4">
          <p className="text-sm text-teal-300">
            💡 <strong>Tip</strong>: Usa keyword generiche e brand per confrontare la competizione.
            Tempo stimato: ~{Math.ceil(keywordCount * 1.5)}s ({keywordCount} kw × 1.5s)
          </p>
        </div>
      </div>
    </div>
  );
}

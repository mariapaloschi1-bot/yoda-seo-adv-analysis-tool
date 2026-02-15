/**
 * Mode Selection - Choose between Bulk Keywords or Domain Analysis
 */

'use client';

interface ModeSelectionProps {
  onSelect: (mode: 'keywords' | 'domain') => void;
  onChangeKeys: () => void;
}

export default function ModeSelection({ onSelect, onChangeKeys }: ModeSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-8xl mb-4 animate-pulse">🐸</div>
          <h1 className="text-4xl font-bold text-teal-400 mb-2">
            Scegli Modalità di Analisi
          </h1>
          <p className="text-slate-400 text-lg">
            "Percorso tuo, scegliere devi." — Maestro Yoda
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Bulk Keywords Mode */}
          <button
            onClick={() => onSelect('keywords')}
            className="group bg-slate-800 hover:bg-slate-750 border-2 border-teal-500/30 hover:border-teal-500 rounded-2xl p-8 transition-all shadow-lg hover:shadow-teal-500/20 text-left"
          >
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
              📊
            </div>
            <h2 className="text-2xl font-bold text-teal-400 mb-3">
              Bulk Keywords
            </h2>
            <p className="text-slate-400 mb-4 leading-relaxed">
              Analizza fino a <strong className="text-teal-300">150 keywords</strong> contemporaneamente.
              Carica CSV/TXT o inserisci manualmente.
            </p>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>✅ Lista completa bidders per ogni keyword</li>
              <li>✅ CPC, competition, search volume</li>
              <li>✅ Raccomandazioni SI/NO/TEST</li>
              <li>✅ Export CSV completo</li>
            </ul>
            <div className="mt-6 inline-flex items-center gap-2 text-teal-400 font-semibold group-hover:gap-3 transition-all">
              Inizia Analisi →
            </div>
          </button>

          {/* Domain Analysis Mode */}
          <button
            onClick={() => onSelect('domain')}
            className="group bg-slate-800 hover:bg-slate-750 border-2 border-teal-500/30 hover:border-teal-500 rounded-2xl p-8 transition-all shadow-lg hover:shadow-teal-500/20 text-left"
          >
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
              🌐
            </div>
            <h2 className="text-2xl font-bold text-teal-400 mb-3">
              Domain Analysis
            </h2>
            <p className="text-slate-400 mb-4 leading-relaxed">
              Inserisci un <strong className="text-teal-300">dominio</strong> (es. nike.com) per analizzare
              le keyword su cui sta biddando.
            </p>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>✅ Identifica keyword biddabili del sito</li>
              <li>✅ Competitor bidding analysis</li>
              <li>✅ Budget optimization per domain</li>
              <li>✅ Brand vs generic detection</li>
            </ul>
            <div className="mt-6 inline-flex items-center gap-2 text-teal-400 font-semibold group-hover:gap-3 transition-all">
              Analizza Dominio →
            </div>
          </button>
        </div>

        {/* Change Keys Button */}
        <div className="text-center">
          <button
            onClick={onChangeKeys}
            className="text-slate-500 hover:text-teal-400 text-sm transition-colors"
          >
            🔑 Cambia API Keys
          </button>
        </div>
      </div>
    </div>
  );
}

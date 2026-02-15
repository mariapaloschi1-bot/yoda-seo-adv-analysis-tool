/**
 * Welcome Screen - Yoda's Paid Intelligence
 */

'use client';

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-stardust flex items-center justify-center p-6">
      <div className="max-w-3xl w-full text-center">
        
        {/* Baby Yoda Animated */}
        <div className="flex justify-center mb-8">
          <div className="relative w-32 h-32 rounded-full border-4 border-teal-500/50 overflow-hidden shadow-[0_0_40px_rgba(45,212,191,0.4)] bg-slate-800">
            <img
              src="https://www.shutterstock.com/image-vector/baby-yoda-grogu-cartoon-character-260nw-2293123629.jpg"
              alt="Baby Yoda"
              className="w-full h-full object-cover animate-bounce"
              style={{ animationDuration: '2s' }}
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
                <h3 className="font-semibold text-teal-300 mb-1">Decisione Strategica AI (Paid vs Organic)</h3>
                <p className="text-sm text-slate-400">
                  Gemini AI ti suggerisce <strong>dove investire in paid</strong>, dove puntare su <strong>SEO organica</strong>, 
                  e quali keyword testare. Include stima budget mensile.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
                <span className="text-amber-400 font-bold">⚡</span>
              </div>
              <div>
                <h3 className="font-semibold text-amber-300 mb-1">Bulk Analysis (fino a 150 keywords)</h3>
                <p className="text-sm text-slate-400">
                  Analizza <strong>fino a 150 keyword in una volta sola</strong>. 
                  Ricevi dashboard interattiva, grafici, tabelle esportabili in CSV.
                </p>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-5 mt-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">
              Requisiti (BYOK - Bring Your Own Key)
            </h3>
            <ul className="text-xs text-slate-500 space-y-2">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  <strong className="text-teal-400">DataForSEO API</strong> (login + password) — 
                  deposito minimo $10, costo ~$0.60 per 150 keywords. 
                  <a href="https://app.dataforseo.com/register" target="_blank" rel="noopener" className="underline hover:text-teal-300 ml-1">
                    Registrati qui
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  <strong className="text-amber-400">Google Gemini API Key</strong> — 
                  gratuita (15 req/min), nessun costo sotto quota free tier. 
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" className="underline hover:text-amber-300 ml-1">
                    Ottieni chiave
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>
                  Tutte le chiavi sono <strong>salvate solo nel tuo browser</strong> (localStorage), 
                  mai inviate ai nostri server. BYOK = massima sicurezza.
                </span>
              </li>
            </ul>
          </div>

          {/* Cost estimate */}
          <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4 text-center">
            <p className="text-sm text-amber-300">
              <strong>Costo per analisi</strong>: ~€0.55 per 150 keywords 
              (vs SEMrush €119/mese → <strong className="text-teal-400">risparmio 99.5%</strong>)
            </p>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="bg-teal-600 hover:bg-teal-500 text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-[0_0_30px_rgba(20,184,166,0.5)] hover:shadow-[0_0_40px_rgba(20,184,166,0.7)] transition transform hover:-translate-y-1 hover:scale-105 border border-teal-400/20"
        >
          Inizia l'Analisi →
        </button>

        <p className="text-xs text-slate-600 mt-6 italic">
          "Pazienza avere devi. Tempo e crediti l'analisi richiede." — Maestro Yoda
        </p>
      </div>
    </div>
  );
}

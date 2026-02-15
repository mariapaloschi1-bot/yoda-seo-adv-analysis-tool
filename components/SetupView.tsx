'use client'

import { useState } from 'react'

interface SetupViewProps {
  onComplete: (keys: {
    dataForSeo: { login: string; password: string }
    gemini: string
  }) => void
}

export default function SetupView({ onComplete }: SetupViewProps) {
  const [dataForSeoLogin, setDataForSeoLogin] = useState('')
  const [dataForSeoPassword, setDataForSeoPassword] = useState('')
  const [geminiKey, setGeminiKey] = useState('')
  const [showDataForSeo, setShowDataForSeo] = useState(false)
  const [showGemini, setShowGemini] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!dataForSeoLogin || !dataForSeoPassword || !geminiKey) {
      alert('Tutte le chiavi sono necessarie, giovane Padawan!')
      return
    }

    onComplete({
      dataForSeo: {
        login: dataForSeoLogin,
        password: dataForSeoPassword
      },
      gemini: geminiKey
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Header con Logo Yoda */}
      <header className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-6 animate-bounce">
          <div className="w-20 h-20 rounded-full border-2 border-teal-400 shadow-glow-teal overflow-hidden">
            <img 
              src="https://www.shutterstock.com/image-vector/baby-yoda-grogu-cartoon-character-260nw-2293123629.jpg" 
              alt="Yoda Logo" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-teal-400 tracking-tight mb-2 font-mono">
          YODA'S <span className="text-slate-100">ORGANIC-PAID</span>
        </h1>
        
        <h2 className="text-sm md:text-lg text-teal-600/80 font-bold uppercase tracking-widest mb-4">
          Analisi Strategica SEO vs PPC
        </h2>
        
        <div className="inline-block bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700 mb-6">
          <p className="text-sm md:text-lg text-slate-400 italic">
            "Budget ottimizzare tu devi. Organic o Paid, strategia scegliere..."
          </p>
        </div>
      </header>

      {/* Form API Keys */}
      <div className="max-w-2xl w-full bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-50"></div>

        <div className="bg-slate-900/50 border-b border-slate-700 p-6">
          <h3 className="text-2xl font-bold text-teal-400 mb-2">
            🔑 Cristalli Kyber Configurazione
          </h3>
          <p className="text-slate-400 text-sm italic">
            "Chiavi fornire tu devi. Sicure nel browser restare esse faranno."
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* DataForSEO */}
          <div className="bg-blue-900/20 border-2 border-blue-600/50 rounded-xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="hidden sm:flex w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/50 items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-1">
                  DataForSEO API
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  Dati SERP reali, advertiser e metriche.{' '}
                  <a 
                    href="https://app.dataforseo.com/register" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-300 underline hover:text-blue-200"
                  >
                    Registrati qui
                  </a>
                </p>
                
                <div className="space-y-3">
                  <div className="relative">
                    <label className="block text-xs text-slate-500 mb-1">Login</label>
                    <input
                      type="text"
                      value={dataForSeoLogin}
                      onChange={(e) => setDataForSeoLogin(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full p-3 bg-slate-900 border border-blue-600/30 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 text-sm"
                    />
                  </div>
                  
                  <div className="relative">
                    <label className="block text-xs text-slate-500 mb-1">Password</label>
                    <input
                      type={showDataForSeo ? 'text' : 'password'}
                      value={dataForSeoPassword}
                      onChange={(e) => setDataForSeoPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-3 pr-12 bg-slate-900 border border-blue-600/30 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDataForSeo(!showDataForSeo)}
                      className="absolute right-3 top-8 text-slate-500 hover:text-blue-400 transition"
                    >
                      {showDataForSeo ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-teal-400 bg-teal-900/30 px-2 py-1 rounded-full border border-teal-500/30">
                ✓ BYOK - Salvato solo nel browser
              </span>
            </div>
          </div>

          {/* Google Gemini */}
          <div className="bg-amber-900/20 border-2 border-amber-600/50 rounded-xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="hidden sm:flex w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/50 items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-1">
                  Google Gemini API
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  AI per insights e raccomandazioni.{' '}
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-300 underline hover:text-amber-200"
                  >
                    Ottieni key qui
                  </a>
                </p>
                
                <div className="relative">
                  <input
                    type={showGemini ? 'text' : 'password'}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIza..."
                    className="w-full p-3 pr-12 bg-slate-900 border border-amber-600/30 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-slate-200 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGemini(!showGemini)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-amber-400 transition"
                  >
                    {showGemini ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-teal-400 bg-teal-900/30 px-2 py-1 rounded-full border border-teal-500/30">
                ✓ Privacy garantita - localStorage only
              </span>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-teal-400">Perché servono?</strong><br/>
              • <strong>DataForSEO</strong>: Dati reali chi bidda, CPC, competition<br/>
              • <strong>Gemini</strong>: Analisi AI e raccomandazioni strategiche<br/>
              <span className="text-teal-300">Tutte le chiavi restano nel TUO browser. Mai inviate ai nostri server.</span>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition shadow-lg shadow-teal-500/30"
          >
            Attiva la Forza →
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-xs text-slate-500 mt-8 text-center max-w-md">
        Creato con ❤️ per SEO Professionals. Ispirato dall'universo di Star Wars.
      </p>
    </div>
  )
}

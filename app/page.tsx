'use client';

import { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import LoadingScreen from '@/components/LoadingScreen';
import WelcomeScreen from '@/components/WelcomeScreen';
import type { AnalysisResult } from '@/lib/analyzer';

type AppState = 'welcome' | 'input' | 'loading' | 'dashboard' | 'error';

export default function Home() {
  const [state, setState] = useState<AppState>('welcome');
  const [apiKeys, setApiKeys] = useState({ dataForSeo: { login: '', password: '' }, gemini: '' });
  const [keywords, setKeywords] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [loadingState, setLoadingState] = useState({ current: 0, total: 0, keyword: '' });

  // Load API keys from localStorage
  useEffect(() => {
    const storedDFS = localStorage.getItem('yoda_dataforseo_credentials');
    const storedGemini = localStorage.getItem('yoda_gemini_api_key');
    
    if (storedDFS) {
      try {
        const dfs = JSON.parse(storedDFS);
        setApiKeys(prev => ({ ...prev, dataForSeo: dfs }));
      } catch {}
    }
    if (storedGemini) {
      setApiKeys(prev => ({ ...prev, gemini: storedGemini }));
    }
  }, []);

  const isApiKeyStored = (type: 'dfs' | 'gemini') => {
    if (type === 'dfs') return !!(apiKeys.dataForSeo.login && apiKeys.dataForSeo.password);
    return !!apiKeys.gemini;
  };

  const handleSubmit = async () => {
    const keywordList = keywords.split('\n').filter(k => k.trim()).slice(0, 150);
    
    if (keywordList.length === 0) {
      alert('⚠️ Almeno una keyword inserire, devi!');
      return;
    }

    if (!apiKeys.dataForSeo.login || !apiKeys.dataForSeo.password || !apiKeys.gemini) {
      alert('⚠️ Tutti i Cristalli Kyber necessari sono!');
      return;
    }

    // Save to localStorage
    localStorage.setItem('yoda_dataforseo_credentials', JSON.stringify(apiKeys.dataForSeo));
    localStorage.setItem('yoda_gemini_api_key', apiKeys.gemini);

    setState('loading');
    setError('');
    setLoadingState({ current: 0, total: keywordList.length, keyword: keywordList[0] });

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: keywordList,
          dataForSeoLogin: apiKeys.dataForSeo.login,
          dataForSeoPassword: apiKeys.dataForSeo.password,
          geminiKey: apiKeys.gemini
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const apiResult = await response.json();

      if (!apiResult.success) {
        throw new Error(apiResult.error || 'Analysis failed');
      }

      const transformedResults = apiResult.results.map((r: any) => ({
        keyword: r.keyword,
        advertisers: r.advertisers || [],
        metrics: r.metrics || { search_volume: 0, cpc: 0, competition: 0 },
        organic_positions: [],
        recommendation: determineRecommendation(r)
      }));

      const yesCount = transformedResults.filter((r: any) => r.recommendation === 'YES_PAID').length;
      const noCount = transformedResults.filter((r: any) => r.recommendation === 'NO_PAID').length;
      const testCount = transformedResults.filter((r: any) => r.recommendation === 'TEST').length;

      const analysis: AnalysisResult = {
        results: transformedResults,
        insights: apiResult.insights,
        summary: {
          total: transformedResults.length,
          yes_paid: yesCount,
          no_paid: noCount,
          test: testCount,
          total_budget_estimate: apiResult.insights.budget_estimate
        }
      };

      setAnalysisResult(analysis);
      setState('dashboard');

    } catch (err: any) {
      console.error('Analysis failed:', err);
      setError(err.message || "Nell'analisi, un disturbo c'è stato.");
      setState('error');
    }
  };

  function determineRecommendation(result: any): 'YES_PAID' | 'NO_PAID' | 'TEST' | 'OPPORTUNITY' {
    const advertiserCount = result.advertisers?.length || 0;
    const organicCount = result.organic_positions?.length || 0;
    const cpc = result.metrics?.cpc || 0;
    const competition = result.metrics?.competition || 0;
    const volume = result.metrics?.search_volume || 0;

    // NUOVA LOGICA CON POSIZIONI ORGANICHE
    
    // Caso 1: Nessun paid MA alta competition → OPPORTUNITÀ!
    if (advertiserCount === 0 && competition > 0.5) {
      return 'OPPORTUNITY';
    }
    
    // Caso 2: Nessun paid E bassa competition → focus organico
    if (advertiserCount === 0 && competition < 0.3) {
      return 'NO_PAID';
    }
    
    // Caso 3: Molti bidders + CPC alto → investire in paid
    if (advertiserCount > 5 && cpc > 1.0 && competition > 0.6) {
      return 'YES_PAID';
    }
    
    // Caso 4: Volume alto + competizione media → testare
    if (volume > 1000 && competition > 0.4 && advertiserCount > 2) {
      return 'TEST';
    }
    
    // Caso 5: Posizioni organiche top-3 MA nessun paid → difesa con paid
    if (organicCount > 0 && result.organic_positions[0]?.position <= 3 && advertiserCount > 3) {
      return 'YES_PAID';
    }
    
    // Default: testare
    return 'TEST';
  }

  const keywordCount = keywords.split('\n').filter(k => k.trim()).length;

  if (state === 'welcome') {
    return <WelcomeScreen onStart={() => setState('input')} />;
  }

  if (state === 'loading') {
    return <LoadingScreen currentKeyword={loadingState.keyword} progress={loadingState.current} total={loadingState.total} />;
  }

  if (state === 'dashboard' && analysisResult) {
    return <Dashboard analysisResult={analysisResult} onReset={() => setState('input')} />;
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-stardust flex items-center justify-center p-6">
        <div className="bg-slate-800/80 backdrop-blur-sm p-10 rounded-2xl shadow-2xl max-w-lg w-full border border-red-900/50">
          <div className="text-red-500 mb-6 bg-red-900/20 inline-block p-6 rounded-full border border-red-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-500 mb-2">Disturbo nella Forza</h2>
          <p className="text-slate-400 mb-6 italic">"Fallito ho. Nel Lato Oscuro un errore c'è."</p>
          <div className="bg-red-950/50 border border-red-500/20 p-4 rounded-lg mb-8 text-left max-h-40 overflow-auto">
            <p className="text-red-400 text-xs font-mono break-words">{error}</p>
          </div>
          <button onClick={() => setState('input')} className="w-full bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-bold transition">
            ← Ritorna al Tempio
          </button>
        </div>
      </div>
    );
  }

  // INPUT VIEW (stile Yoda's Eye identico)
  return (
    <div className="min-h-screen bg-stardust">
      <div className="max-w-5xl mx-auto p-6 lg:p-12 font-sans">
        <div className="bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden relative">
          {/* Glow effect top */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-50"></div>

          {/* Header Section */}
          <div className="bg-slate-900/50 border-b border-slate-700 p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              {/* Yoda Icon - IMMAGINE SHUTTERSTOCK (hidden on mobile) */}
              <div className="hidden sm:flex w-24 h-24 shrink-0 bg-slate-800 rounded-full border-2 border-teal-500/50 items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.3)] overflow-hidden relative group">
                <div className="absolute inset-0 bg-teal-500/20 group-hover:bg-transparent transition duration-500 z-10"></div>
                <img
                  src="https://www.shutterstock.com/image-vector/baby-yoda-grogu-cartoon-character-260nw-2293123629.jpg"
                  alt="Maestro Yoda"
                  className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
                />
              </div>
              
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-teal-400 mb-2 tracking-tight drop-shadow-sm">
                  Analisi Paid vs Organic
                </h2>
                <p className="text-slate-400 italic text-sm sm:text-base">
                  "Bilanciare paid e organic, la via del Maestro è. 150 keywords il limite è."
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-10">
            
            {/* DataForSEO Credentials */}
            <div className="bg-teal-900/20 border-2 border-teal-600/50 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-teal-500/10 blur-2xl"></div>
              
              <div className="flex items-start gap-4 mb-4">
                <div className="hidden sm:flex flex-shrink-0 w-10 h-10 rounded-full bg-teal-500/20 border border-teal-500/50 items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-teal-400 uppercase tracking-widest mb-1">
                    Cristallo DataForSEO (Bidding Data)
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    <strong className="text-teal-300">Login e Password DataForSEO</strong> per accedere ai dati di bidding: chi fa pubblicità su Google, quanto spendono (CPC), volume di ricerca, competizione.{' '}
                    <span className="text-teal-300">Salvati solo nel tuo browser</span>, mai inviati ai nostri server.{' '}
                    <a href="https://app.dataforseo.com/register" target="_blank" rel="noopener noreferrer" className="underline hover:text-teal-300 transition">
                      Registrati qui
                    </a> (deposito minimo $10).
                  </p>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={apiKeys.dataForSeo.login}
                      onChange={(e) => setApiKeys(prev => ({ ...prev, dataForSeo: { ...prev.dataForSeo, login: e.target.value } }))}
                      placeholder="Login (email)"
                      className="w-full p-4 bg-slate-900 border border-teal-600/30 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-slate-200 font-mono text-sm"
                    />
                    
                    <div className="relative">
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={apiKeys.dataForSeo.password}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, dataForSeo: { ...prev.dataForSeo, password: e.target.value } }))}
                        placeholder="Password"
                        className="w-full p-4 pr-12 bg-slate-900 border border-teal-600/30 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-slate-200 font-mono text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-teal-400 transition p-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          {showPasswords ? (
                            <>
                              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                            </>
                          ) : (
                            <>
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </>
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="inline-flex items-center gap-1 text-xs text-teal-400 bg-teal-900/30 px-2 py-1 rounded-full border border-teal-500/30">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      BYOK (Bring Your Own Key)
                    </span>
                    {isApiKeyStored('dfs') && <span className="text-xs text-slate-500">✓ Salvata</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Gemini API Key */}
            <div className="bg-amber-900/20 border-2 border-amber-600/50 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl"></div>
              
              <div className="flex items-start gap-4 mb-4">
                <div className="hidden sm:flex flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/50 items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-1">
                    Cristallo Gemini (AI Insights)
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    La tua <strong className="text-amber-300">API Key di Google Gemini</strong> per generare insights strategici AI: quale keyword investire in paid, quali ottimizzare per SEO, budget stimato.{' '}
                    <span className="text-teal-300">Salvata solo nel tuo browser</span>, mai inviata ai nostri server.{' '}
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-300 transition">
                      Ottieni qui la tua chiave
                    </a>
                  </p>
                  
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={apiKeys.gemini}
                      onChange={(e) => setApiKeys(prev => ({ ...prev, gemini: e.target.value }))}
                      placeholder="Inserisci la tua Gemini API Key..."
                      className="w-full p-4 pr-12 bg-slate-900 border border-amber-600/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition text-slate-200 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 transition p-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        {showPasswords ? (
                          <>
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </>
                        ) : (
                          <>
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="inline-flex items-center gap-1 text-xs text-teal-400 bg-teal-900/30 px-2 py-1 rounded-full border border-teal-500/30">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      BYOK
                    </span>
                    {isApiKeyStored('gemini') && <span className="text-xs text-slate-500">✓ Salvata</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Keywords Input */}
            <div>
              <label className="block text-xs font-bold text-teal-500 uppercase tracking-widest mb-2">
                Le Tue Keywords (Bulk Input)
              </label>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                Inserisci <strong>fino a 150 keyword</strong> (una per riga). Per ognuna riceverai: 
                numero inserzionisti, CPC medio (€), volume ricerche/mese, competizione (%), 
                raccomandazione AI (paid/organic/test).
              </p>
              <textarea
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="scarpe running&#10;nike running&#10;adidas scarpe&#10;...&#10;(una per riga, max 150)"
                className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition font-mono text-xs text-slate-400"
                rows={12}
              />
              <p className="text-[10px] text-slate-500 text-right">
                {keywordCount} / 150 keywords • Il resto verrà troncato automaticamente
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <button
                onClick={handleSubmit}
                disabled={keywordCount === 0 || !apiKeys.dataForSeo.login || !apiKeys.dataForSeo.password || !apiKeys.gemini}
                className="w-full sm:w-auto bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-10 py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:shadow-[0_0_30px_rgba(20,184,166,0.6)] transition transform hover:-translate-y-1 flex items-center justify-center gap-3 border border-teal-400/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Analizza Bidding ({keywordCount} kw)
              </button>
            </div>
          </div>

        </div>

        {/* Footer - stile identico Yoda's Eye */}
        <footer className="text-center mt-8 text-slate-500 text-sm font-medium opacity-60 hover:opacity-100 transition-opacity duration-300">
          Fatto con ❤️ per la SEO da Maria Paloschi
        </footer>
      </div>
    </div>
  );
}

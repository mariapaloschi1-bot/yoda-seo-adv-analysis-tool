'use client';

import { useState, useEffect } from 'react';
import SetupView from '@/components/SetupView';
import ModeSelection from '@/components/ModeSelection';
import KeywordInput from '@/components/KeywordInput';
import DomainInput from '@/components/DomainInput';
import LoadingScreen from '@/components/LoadingScreen';
import Dashboard from '@/components/Dashboard';
import { analyzeKeywords, DataForSEOCredentials } from '@/lib/dataforseo';
import { analyzeKeywordResults, AnalysisResult } from '@/lib/analyzer';

type AppState = 'setup' | 'mode' | 'keyword-input' | 'domain-input' | 'loading' | 'dashboard' | 'error';

export interface ApiKeys {
  dataForSeo: { login: string; password: string };
  gemini: string;
}

export default function Home() {
  const [state, setState] = useState<AppState>('setup');
  const [mode, setMode] = useState<'keywords' | 'domain' | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeys | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');
  const [loadingState, setLoadingState] = useState({ current: 0, total: 0, keyword: '' });

  // Load API keys from localStorage on mount
  useEffect(() => {
    const storedKeys = localStorage.getItem('yoda_api_keys');
    if (storedKeys) {
      try {
        const keys = JSON.parse(storedKeys);
        setApiKeys(keys);
        setState('mode');
      } catch (e) {
        console.error('Error loading stored keys:', e);
      }
    }
  }, []);

  const handleSetupComplete = (keys: ApiKeys) => {
    setApiKeys(keys);
    localStorage.setItem('yoda_api_keys', JSON.stringify(keys));
    setState('mode');
  };

  const handleModeSelect = (selectedMode: 'keywords' | 'domain') => {
    setMode(selectedMode);
    setState(selectedMode === 'keywords' ? 'keyword-input' : 'domain-input');
  };

  const handleStartAnalysis = async (data: { keywords?: string[]; domain?: string }) => {
    if (!apiKeys) return;

    setState('loading');
    setError('');

    try {
      const keywords = data.keywords || [];
      setLoadingState({ current: 0, total: keywords.length, keyword: keywords[0] || '' });

      // Step 1: Analyze with DataForSEO
      const results = await analyzeKeywords(
        keywords,
        apiKeys.dataForSeo as DataForSEOCredentials,
        (current, total) => {
          setLoadingState({
            current,
            total,
            keyword: keywords[current - 1] || ''
          });
        }
      );

      // Step 2: Generate insights with Gemini
      const analysis = await analyzeKeywordResults(results, apiKeys.gemini, [data.domain || '']);
      
      setAnalysisResult(analysis);
      setState('dashboard');
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setError(err.message || "Errore durante l'analisi");
      setState('error');
    }
  };

  const handleReset = () => {
    setState('mode');
    setMode(null);
    setAnalysisResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Setup Screen */}
      {state === 'setup' && (
        <SetupView onComplete={handleSetupComplete} />
      )}

      {/* Mode Selection */}
      {state === 'mode' && (
        <ModeSelection onSelect={handleModeSelect} onChangeKeys={() => setState('setup')} />
      )}

      {/* Keyword Input */}
      {state === 'keyword-input' && apiKeys && (
        <KeywordInput
          apiKeys={apiKeys}
          onStart={handleStartAnalysis}
          onBack={handleReset}
        />
      )}

      {/* Domain Input */}
      {state === 'domain-input' && apiKeys && (
        <DomainInput
          apiKeys={apiKeys}
          onStart={handleStartAnalysis}
          onBack={handleReset}
        />
      )}

      {/* Loading */}
      {state === 'loading' && (
        <LoadingScreen
          currentKeyword={loadingState.keyword}
          progress={loadingState.current}
          total={loadingState.total}
        />
      )}

      {/* Dashboard */}
      {state === 'dashboard' && analysisResult && (
        <Dashboard analysisResult={analysisResult} onReset={handleReset} />
      )}

      {/* Error */}
      {state === 'error' && (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900">
          <div className="bg-slate-800 p-10 rounded-2xl shadow-2xl max-w-lg w-full border border-red-900/50">
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
            <button
              onClick={handleReset}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-bold transition"
            >
              Ritorna al Tempio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Dashboard - Professional & Elegant Style
 */

'use client';

import { useState } from 'react';
import { AnalysisResult, getRecommendationStyle, exportToCSV, calculateKeywordBudget } from '@/lib/analyzer';

interface DashboardProps {
  analysisResult: AnalysisResult;
  onReset: () => void;
}

export default function Dashboard({ analysisResult, onReset }: DashboardProps) {
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const { results, insights, summary } = analysisResult;

  const handleExportCSV = () => {
    const csv = exportToCSV(results);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yodas-analysis-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-teal-500/20 to-teal-600/10 border border-teal-500/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-light text-slate-100 tracking-tight">
                  Analisi Completata
                </h1>
                <p className="text-slate-400 mt-1 font-light">
                  {results.length} keyword analizzate
                </p>
              </div>
            </div>
            <button
              onClick={onReset}
              className="px-5 py-2.5 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 rounded-lg transition-all text-sm font-light backdrop-blur-sm"
            >
              Nuova Analisi
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
          <MetricCard 
            title="Keyword Totali" 
            value={summary.totalKeywords} 
            icon={<ChartIcon />}
          />
          <MetricCard 
            title="Investimento Consigliato" 
            value={summary.yes_paid}
            valueColor="text-red-400"
            icon={<TrendUpIcon />}
          />
          <MetricCard 
            title="Solo Organico" 
            value={summary.no_paid}
            valueColor="text-emerald-400"
            icon={<SearchIcon />}
          />
          <MetricCard 
            title="Da Testare" 
            value={summary.test}
            valueColor="text-amber-400"
            icon={<FlaskIcon />}
          />
        </div>

        {/* AI Insights */}
        <div className="mb-10">
          <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-xl font-light text-slate-100">Analisi AI</h2>
            </div>
            
            <p className="text-slate-300 mb-8 leading-relaxed font-light text-[15px]">
              {insights.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Raccomandazioni</h3>
                <ul className="space-y-3">
                  {insights.recommendations.map((rec, i) => (
                    <li key={i} className="text-[15px] text-slate-300 pl-4 border-l border-slate-700/50 font-light">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Budget Stimato</h3>
                <p className="text-3xl font-light text-teal-400 mb-6">
                  {insights.budget_estimate}
                </p>

                <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Keyword Prioritarie</h3>
                <div className="flex flex-wrap gap-2">
                  {insights.priority_keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-slate-800/40 border border-slate-700/40 text-slate-300 rounded-md text-sm font-light"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          <DistributionChart summary={summary} />
          <TopCPCChart results={results.slice(0, 10)} />
        </div>

        {/* Export Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={handleExportCSV}
            className="px-5 py-2.5 bg-teal-600/90 hover:bg-teal-600 rounded-lg transition-all text-sm font-light flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Esporta CSV
          </button>
        </div>

        {/* Results Table */}
        <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/60 border-b border-slate-800/60">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Keyword</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Inserzionisti</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">CPC</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Competizione</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Volume</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Budget/mese</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Raccomandazione</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, idx) => {
                  const style = getRecommendationStyle(result.recommendation);
                  const budget = calculateKeywordBudget(result);
                  const isExpanded = selectedKeyword === result.keyword;

                  return (
                    <>
                      <tr
                        key={idx}
                        className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors cursor-pointer"
                        onClick={() => setSelectedKeyword(isExpanded ? null : result.keyword)}
                      >
                        <td className="px-6 py-4 font-light text-slate-200">
                          {result.keyword}
                        </td>
                        <td className="px-6 py-4 text-slate-300 font-light">
                          {result.advertisers.length}
                        </td>
                        <td className="px-6 py-4 text-slate-300 font-mono text-sm">
                          €{result.metrics.cpc.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-teal-500/70"
                                style={{ width: `${result.metrics.competition * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 font-light">
                              {(result.metrics.competition * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300 font-light">
                          {result.metrics.search_volume.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-slate-300 font-light">
                          €{budget.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <RecommendationBadge recommendation={result.recommendation} />
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </td>
                      </tr>

                      {isExpanded && result.advertisers.length > 0 && (
                        <tr className="bg-slate-900/20">
                          <td colSpan={8} className="px-6 py-6">
                            <div className="bg-slate-900/40 rounded-lg p-5 border border-slate-800/40">
                              <h4 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
                                Inserzionisti ({result.advertisers.length})
                              </h4>
                              <div className="space-y-3">
                                {result.advertisers.slice(0, 10).map((adv, i) => (
                                  <div
                                    key={i}
                                    className="flex items-start gap-4 p-4 bg-slate-800/20 rounded-lg border border-slate-800/30"
                                  >
                                    <span className="text-teal-400 font-mono text-sm">#{adv.position}</span>
                                    <div className="flex-1">
                                      <div className="font-light text-slate-200 text-sm">
                                        {adv.domain}
                                      </div>
                                      <div className="text-sm text-slate-400 mt-1 font-light">
                                        {adv.title}
                                      </div>
                                      {adv.description && (
                                        <div className="text-xs text-slate-500 mt-2 font-light">
                                          {adv.description}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-slate-600 text-sm font-light">
          Fatto con passione per la SEO da Maria Paloschi
        </footer>
      </div>
    </div>
  );
}

// Icon Components
function ChartIcon() {
  return (
    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function TrendUpIcon() {
  return (
    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function FlaskIcon() {
  return (
    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  );
}

// Helper Components
function MetricCard({ title, value, valueColor = "text-slate-100", icon }: any) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 p-6">
      <div className="flex items-center justify-between mb-3">
        {icon}
        <span className={`text-3xl font-light ${valueColor}`}>{value}</span>
      </div>
      <div className="text-sm text-slate-400 font-light">{title}</div>
    </div>
  );
}

function RecommendationBadge({ recommendation }: { recommendation: string }) {
  const styles: Record<string, { bg: string; border: string; text: string; label: string }> = {
    'YES_PAID': {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      label: 'Investimento Consigliato'
    },
    'NO_PAID': {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      label: 'Solo Organico'
    },
    'TEST': {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      label: 'Da Testare'
    }
  };

  const style = styles[recommendation] || styles['TEST'];

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-md border text-xs font-light ${style.bg} ${style.border} ${style.text}`}>
      {style.label}
    </span>
  );
}

function DistributionChart({ summary }: { summary: any }) {
  const total = summary.yes_paid + summary.no_paid + summary.test;
  const yesPercent = (summary.yes_paid / total) * 100;
  const noPercent = (summary.no_paid / total) * 100;

  return (
    <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 p-6">
      <h3 className="text-sm font-medium text-slate-400 mb-6 uppercase tracking-wider">Distribuzione Raccomandazioni</h3>
      <div className="flex items-center justify-center gap-10">
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="16" />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#f87171"
              strokeWidth="16"
              strokeDasharray={`${yesPercent * 2.513} ${251.3 - yesPercent * 2.513}`}
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#34d399"
              strokeWidth="16"
              strokeDasharray={`${noPercent * 2.513} ${251.3 - noPercent * 2.513}`}
              strokeDashoffset={`${-yesPercent * 2.513}`}
            />
          </svg>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-400 rounded-sm" />
            <span className="text-sm font-light text-slate-300">Investimento: {summary.yes_paid} ({yesPercent.toFixed(0)}%)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-400 rounded-sm" />
            <span className="text-sm font-light text-slate-300">Organico: {summary.no_paid} ({noPercent.toFixed(0)}%)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-amber-400 rounded-sm" />
            <span className="text-sm font-light text-slate-300">Test: {summary.test}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopCPCChart({ results }: { results: any[] }) {
  const maxCPC = Math.max(...results.map(r => r.metrics.cpc));

  return (
    <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 p-6">
      <h3 className="text-sm font-medium text-slate-400 mb-6 uppercase tracking-wider">Top 10 CPC</h3>
      <div className="space-y-4">
        {results.map((result, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-slate-600 w-6 font-mono">#{i + 1}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300 truncate font-light">{result.keyword}</span>
                <span className="text-sm font-mono text-teal-400 ml-3">
                  €{result.metrics.cpc.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500/70"
                  style={{ width: `${(result.metrics.cpc / maxCPC) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

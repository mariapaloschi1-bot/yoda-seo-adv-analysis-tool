/**
 * Dashboard - Complete with Yoda Style + Footer
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
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
    <div className="min-h-screen bg-stardust text-slate-200">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 yoda-pulse">
                <Image src="/yoda-icon.svg" alt="Maestro Yoda" width={80} height={80} priority />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-teal-400">
                  Meditazione Completa
                </h1>
                <p className="text-slate-400 mt-1">
                  {results.length} keywords nella galassia analizzate
                </p>
              </div>
            </div>
            <button
              onClick={onReset}
              className="px-6 py-3 bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all backdrop-blur-sm"
            >
              ← Nuova Analisi
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <SummaryCard title="Keywords Totali" value={summary.total} icon="📊" color="text-blue-400" />
          <SummaryCard title="SI - Investire" value={summary.yes_paid} icon="🔴" color="text-red-400" />
          <SummaryCard title="NO - SEO Focus" value={summary.no_paid} icon="🟢" color="text-green-400" />
          <SummaryCard title="TEST - Sperimentare" value={summary.test} icon="🟡" color="text-yellow-400" />
        </div>

        {/* AI Insights */}
        <div className="mb-8">
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-teal-500/30 p-6 shadow-[0_0_20px_rgba(45,212,191,0.2)]">
            <h2 className="text-xl font-bold text-teal-400 mb-4 flex items-center gap-2">
              🧠 Saggezza del Maestro (Gemini AI)
            </h2>
            
            <p className="text-slate-300 mb-4 leading-relaxed italic">
              "{insights.summary}"
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-teal-300 mb-2">📜 Insegnamenti</h3>
                <ul className="space-y-2">
                  {insights.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-slate-400 pl-4 border-l-2 border-teal-500/30">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-teal-300 mb-2">💰 Budget da Meditare</h3>
                <p className="text-3xl font-bold text-teal-400 mb-4">
                  {insights.budget_estimate}
                </p>

                <h3 className="font-semibold text-teal-300 mb-2">🎯 Priorità del Consiglio</h3>
                <div className="flex flex-wrap gap-2">
                  {insights.priority_keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-sm border border-teal-500/30"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <PieChart summary={summary} />
          <TopCPCChart results={results.slice(0, 10)} />
        </div>

        {/* Export Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={handleExportCSV}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-500 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:shadow-[0_0_30px_rgba(20,184,166,0.6)]"
          >
            📥 Esporta CSV
          </button>
        </div>

        {/* Results Table */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-teal-400">Keyword</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-teal-400">Bidders</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-teal-400">CPC</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-teal-400">Competition</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-teal-400">Volume</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-teal-400">Budget/mese</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-teal-400">Consiglio Jedi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-teal-400">Dettagli</th>
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
                        className="border-b border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer"
                        onClick={() => setSelectedKeyword(isExpanded ? null : result.keyword)}
                      >
                        <td className="px-6 py-4 font-medium text-slate-200 font-mono">
                          {result.keyword}
                        </td>
                        <td className="px-6 py-4 text-slate-300 font-semibold">
                          {result.advertisers.length}
                        </td>
                        <td className="px-6 py-4 text-slate-300 font-mono">
                          €{result.metrics.cpc.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-teal-500"
                                style={{ width: `${result.metrics.competition * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-slate-400">
                              {(result.metrics.competition * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {result.metrics.search_volume.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-slate-300 font-semibold">
                          €{budget.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`${style.color} font-semibold flex items-center gap-2`}>
                            {style.icon} {style.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-teal-400 hover:text-teal-300">
                            {isExpanded ? '▼' : '▶'}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && result.advertisers.length > 0 && (
                        <tr className="bg-slate-750">
                          <td colSpan={8} className="px-6 py-4">
                            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                              <h4 className="font-semibold text-teal-400 mb-3">
                                🎯 Bidders nella Galassia ({result.advertisers.length})
                              </h4>
                              <div className="space-y-2">
                                {result.advertisers.slice(0, 10).map((adv, i) => (
                                  <div
                                    key={i}
                                    className="flex items-start gap-3 p-3 bg-slate-900 rounded border border-slate-700"
                                  >
                                    <span className="text-teal-400 font-bold">#{adv.position}</span>
                                    <div className="flex-1">
                                      <div className="font-semibold text-slate-200">
                                        {adv.domain}
                                      </div>
                                      <div className="text-sm text-slate-400 mt-1">
                                        {adv.title}
                                      </div>
                                      {adv.description && (
                                        <div className="text-xs text-slate-500 mt-1">
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

        {/* Footer - stile identico Yoda's Eye */}
        <footer className="text-center mt-8 text-slate-500 text-sm font-medium opacity-60 hover:opacity-100 transition-opacity duration-300">
          Fatto con ❤️ per la SEO da Maria Paloschi
        </footer>
      </div>
    </div>
  );
}

// Helper Components

function SummaryCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700 p-6 shadow-[0_0_20px_rgba(45,212,191,0.1)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        <span className={`text-4xl font-bold ${color}`}>{value}</span>
      </div>
      <div className="text-sm text-slate-400">{title}</div>
    </div>
  );
}

function PieChart({ summary }: { summary: any }) {
  const total = summary.yes_paid + summary.no_paid + summary.test;
  const yesPercent = (summary.yes_paid / total) * 100;
  const noPercent = (summary.no_paid / total) * 100;

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-teal-400 mb-4">📊 Distribuzione Consigli</h3>
      <div className="flex items-center justify-center gap-8">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#334155" strokeWidth="20" />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#f87171"
              strokeWidth="20"
              strokeDasharray={`${yesPercent * 2.513} ${251.3 - yesPercent * 2.513}`}
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#4ade80"
              strokeWidth="20"
              strokeDasharray={`${noPercent * 2.513} ${251.3 - noPercent * 2.513}`}
              strokeDashoffset={`${-yesPercent * 2.513}`}
            />
          </svg>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-red-400 rounded" />
            <span className="text-sm">SI: {summary.yes_paid} ({yesPercent.toFixed(0)}%)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-green-400 rounded" />
            <span className="text-sm">NO: {summary.no_paid} ({noPercent.toFixed(0)}%)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-yellow-400 rounded" />
            <span className="text-sm">Test: {summary.test}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopCPCChart({ results }: { results: any[] }) {
  const maxCPC = Math.max(...results.map(r => r.metrics.cpc));

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-teal-400 mb-4">💰 Top 10 CPC Galattici</h3>
      <div className="space-y-3">
        {results.map((result, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-8">#{i + 1}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-300 truncate font-mono">{result.keyword}</span>
                <span className="text-sm font-semibold text-teal-400">
                  €{result.metrics.cpc.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500"
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

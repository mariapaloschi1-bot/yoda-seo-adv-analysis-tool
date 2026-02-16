// components/Dashboard.tsx - Dashboard Arricchita con Grafici e Export
'use client';

import { AnalysisResult } from '@/lib/analyzer';
import { exportToCSV } from '@/lib/analyzer';
import { useState } from 'react';

interface DashboardProps {
  results: AnalysisResult;
}

export default function Dashboard({ results }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'insights' | 'charts'>('overview');
  const { results: keywords, insights, summary } = results;

  // 📊 Calcolo statistiche per grafici
  const competitionDistribution = {
    low: keywords.filter(k => k.metrics.competition < 0.3).length,
    medium: keywords.filter(k => k.metrics.competition >= 0.3 && k.metrics.competition < 0.7).length,
    high: keywords.filter(k => k.metrics.competition >= 0.7).length
  };

  const volumeDistribution = {
    veryLow: keywords.filter(k => k.metrics.search_volume < 100).length,
    low: keywords.filter(k => k.metrics.search_volume >= 100 && k.metrics.search_volume < 1000).length,
    medium: keywords.filter(k => k.metrics.search_volume >= 1000 && k.metrics.search_volume < 10000).length,
    high: keywords.filter(k => k.metrics.search_volume >= 10000).length
  };

  const cpcDistribution = {
    low: keywords.filter(k => k.metrics.cpc < 1).length,
    medium: keywords.filter(k => k.metrics.cpc >= 1 && k.metrics.cpc < 3).length,
    high: keywords.filter(k => k.metrics.cpc >= 3).length
  };

  // 💰 Calcolo budget totale stimato
  const totalBudget = keywords.reduce((sum, k) => {
    const clicks = k.metrics.search_volume * 0.02;
    return sum + (clicks * k.metrics.cpc);
  }, 0);

  // 📥 Export CSV
  const handleExportCSV = () => {
    const csv = exportToCSV(keywords);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `yoda-seo-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // 📊 Export JSON
  const handleExportJSON = () => {
    const json = JSON.stringify(results, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `yoda-seo-analysis-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // 🎨 Stile raccomandazioni
  const getRecommendationStyle = (rec: string) => {
    switch (rec) {
      case 'YES_PAID':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          text: 'text-red-400',
          label: 'Investi in Paid',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
          )
        };
      case 'NO_PAID':
        return {
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          text: 'text-green-400',
          label: 'Focus su SEO',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
          )
        };
      case 'TEST':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          text: 'text-yellow-400',
          label: 'Test con budget limitato',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
          )
        };
      default:
        return {
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/30',
          text: 'text-gray-400',
          label: 'Sconosciuto',
          icon: null
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Analisi SEO Avanzata</h1>
              <p className="text-sm text-gray-400 mt-1">
                {summary.totalKeywords} keywords analizzate • Budget stimato: €{totalBudget.toFixed(2)}/mese
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Esporta CSV
              </button>
              <button
                onClick={handleExportJSON}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Esporta JSON
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6">
            {[
              { id: 'overview', label: 'Panoramica', icon: '📊' },
              { id: 'keywords', label: 'Keywords', icon: '🔑' },
              { id: 'insights', label: 'Insights AI', icon: '🤖' },
              { id: 'charts', label: 'Grafici', icon: '📈' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* TAB: Panoramica */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <SummaryCard
                title="Keywords Totali"
                value={summary.totalKeywords}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                }
                color="text-blue-400"
              />
              <SummaryCard
                title="Investi in Paid"
                value={summary.yes_paid}
                subtitle={`${((summary.yes_paid / summary.totalKeywords) * 100).toFixed(0)}%`}
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                  </svg>
                }
                color="text-red-400"
              />
              <SummaryCard
                title="Focus su SEO"
                value={summary.no_paid}
                subtitle={`${((summary.no_paid / summary.totalKeywords) * 100).toFixed(0)}%`}
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                }
                color="text-green-400"
              />
              <SummaryCard
                title="Test con budget"
                value={summary.test}
                subtitle={`${((summary.test / summary.totalKeywords) * 100).toFixed(0)}%`}
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clipRule="evenodd"/>
                  </svg>
                }
                color="text-yellow-400"
              />
            </div>

            {/* Budget Totale */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Budget Mensile Stimato</h3>
                  <p className="text-3xl font-bold text-blue-400">€{totalBudget.toFixed(2)}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Basato su CTR stimato 2% e CPC medio €{(keywords.reduce((sum, k) => sum + k.metrics.cpc, 0) / keywords.length).toFixed(2)}
                  </p>
                </div>
                <svg className="w-16 h-16 text-blue-400/30" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>

            {/* Top 5 Keywords per Recommendation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* YES_PAID */}
              <KeywordListCard
                title="Top 5 - Investi in Paid"
                keywords={keywords.filter(k => k.recommendation === 'YES_PAID').slice(0, 5)}
                emptyMessage="Nessuna keyword richiede investimento paid"
                color="red"
              />
              {/* NO_PAID */}
              <KeywordListCard
                title="Top 5 - Focus SEO"
                keywords={keywords.filter(k => k.recommendation === 'NO_PAID').slice(0, 5)}
                emptyMessage="Nessuna keyword ideale per SEO"
                color="green"
              />
              {/* TEST */}
              <KeywordListCard
                title="Top 5 - Test Budget"
                keywords={keywords.filter(k => k.recommendation === 'TEST').slice(0, 5)}
                emptyMessage="Nessuna keyword da testare"
                color="yellow"
              />
            </div>
          </div>
        )}

        {/* TAB: Keywords */}
        {activeTab === 'keywords' && (
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Keyword</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Volume</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">CPC</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Competition</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Advertisers</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Raccomandazione</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Budget/mese</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {keywords.map((keyword, idx) => {
                    const style = getRecommendationStyle(keyword.recommendation || '');
                    const monthlyBudget = keyword.metrics.search_volume * 0.02 * keyword.metrics.cpc;
                    return (
                      <tr key={idx} className="hover:bg-gray-700/20 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-medium text-white">{keyword.keyword}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {keyword.metrics.search_volume.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-blue-400 font-medium">€{keyword.metrics.cpc.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  keyword.metrics.competition < 0.3
                                    ? 'bg-green-500'
                                    : keyword.metrics.competition < 0.7
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${keyword.metrics.competition * 100}%` }}
                              />
                            </div>
                            <span className="text-gray-400 text-sm">
                              {(keyword.metrics.competition * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {keyword.advertisers.length}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium ${style.bg} ${style.border} ${style.text} border`}>
                            {style.icon}
                            {style.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-purple-400 font-medium">€{monthlyBudget.toFixed(2)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: Insights AI */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            {/* Strategia Generale */}
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">Strategia Generale</h3>
                  <p className="text-gray-300 leading-relaxed">{insights.summary}</p>
                </div>
              </div>
            </div>

            {/* Raccomandazioni */}
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">Raccomandazioni Strategiche</h3>
                  <ul className="space-y-2">
                    {insights.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-300">
                        <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Priority Keywords */}
            <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">Keywords Prioritarie</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {insights.priority_keywords.map((kw, idx) => (
                      <div key={idx} className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                        <span className="text-white font-medium">{kw}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Estimate */}
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">Stima Budget</h3>
                  <p className="text-gray-300 leading-relaxed">{insights.budget_estimate}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Grafici */}
        {activeTab === 'charts' && (
          <div className="space-y-6">
            {/* Recommendation Pie Chart */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Distribuzione Raccomandazioni</h3>
              <div className="flex items-center justify-center gap-8">
                <div className="relative w-64 h-64">
                  <svg viewBox="0 0 200 200" className="transform -rotate-90">
                    {/* YES_PAID */}
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="40"
                      strokeDasharray={`${(summary.yes_paid / summary.totalKeywords) * 502.65} 502.65`}
                      strokeDashoffset="0"
                    />
                    {/* NO_PAID */}
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="40"
                      strokeDasharray={`${(summary.no_paid / summary.totalKeywords) * 502.65} 502.65`}
                      strokeDashoffset={`-${(summary.yes_paid / summary.totalKeywords) * 502.65}`}
                    />
                    {/* TEST */}
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#eab308"
                      strokeWidth="40"
                      strokeDasharray={`${(summary.test / summary.totalKeywords) * 502.65} 502.65`}
                      strokeDashoffset={`-${((summary.yes_paid + summary.no_paid) / summary.totalKeywords) * 502.65}`}
                    />
                  </svg>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-gray-300">Investi in Paid: {summary.yes_paid} ({((summary.yes_paid / summary.totalKeywords) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-gray-300">Focus SEO: {summary.no_paid} ({((summary.no_paid / summary.totalKeywords) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-gray-300">Test Budget: {summary.test} ({((summary.test / summary.totalKeywords) * 100).toFixed(0)}%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bar Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Competition Distribution */}
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Distribuzione Competition</h3>
                <div className="space-y-3">
                  <BarChart label="Bassa (<30%)" value={competitionDistribution.low} max={summary.totalKeywords} color="bg-green-500" />
                  <BarChart label="Media (30-70%)" value={competitionDistribution.medium} max={summary.totalKeywords} color="bg-yellow-500" />
                  <BarChart label="Alta (>70%)" value={competitionDistribution.high} max={summary.totalKeywords} color="bg-red-500" />
                </div>
              </div>

              {/* Volume Distribution */}
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Distribuzione Volume</h3>
                <div className="space-y-3">
                  <BarChart label="<100" value={volumeDistribution.veryLow} max={summary.totalKeywords} color="bg-gray-500" />
                  <BarChart label="100-1K" value={volumeDistribution.low} max={summary.totalKeywords} color="bg-blue-500" />
                  <BarChart label="1K-10K" value={volumeDistribution.medium} max={summary.totalKeywords} color="bg-purple-500" />
                  <BarChart label=">10K" value={volumeDistribution.high} max={summary.totalKeywords} color="bg-pink-500" />
                </div>
              </div>

              {/* CPC Distribution */}
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Distribuzione CPC</h3>
                <div className="space-y-3">
                  <BarChart label="<€1" value={cpcDistribution.low} max={summary.totalKeywords} color="bg-green-500" />
                  <BarChart label="€1-€3" value={cpcDistribution.medium} max={summary.totalKeywords} color="bg-yellow-500" />
                  <BarChart label=">€3" value={cpcDistribution.high} max={summary.totalKeywords} color="bg-red-500" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 📦 Componenti Helper
function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  color
}: {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg bg-gray-700/50 ${color}`}>{icon}</div>
      </div>
      <h3 className="text-sm font-medium text-gray-400 mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-white">{value}</p>
        {subtitle && <span className="text-sm text-gray-400">{subtitle}</span>}
      </div>
    </div>
  );
}

function KeywordListCard({
  title,
  keywords,
  emptyMessage,
  color
}: {
  title: string;
  keywords: any[];
  emptyMessage: string;
  color: 'red' | 'green' | 'yellow';
}) {
  const colorClasses = {
    red: 'border-red-500/30 bg-red-500/5',
    green: 'border-green-500/30 bg-green-500/5',
    yellow: 'border-yellow-500/30 bg-yellow-500/5'
  };

  return (
    <div className={`bg-gray-800/50 border ${colorClasses[color]} rounded-xl p-6`}>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      {keywords.length === 0 ? (
        <p className="text-gray-400 text-sm">{emptyMessage}</p>
      ) : (
        <ul className="space-y-3">
          {keywords.map((kw, idx) => (
            <li key={idx} className="border-b border-gray-700/50 pb-3 last:border-0 last:pb-0">
              <div className="flex justify-between items-start mb-1">
                <span className="text-white font-medium">{kw.keyword}</span>
                <span className="text-blue-400 text-sm">€{kw.metrics.cpc.toFixed(2)}</span>
              </div>
              <div className="flex gap-4 text-xs text-gray-400">
                <span>Vol: {kw.metrics.search_volume.toLocaleString()}</span>
                <span>Comp: {(kw.metrics.competition * 100).toFixed(0)}%</span>
                <span>Ads: {kw.advertisers.length}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BarChart({
  label,
  value,
  max,
  color
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm text-gray-400 mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

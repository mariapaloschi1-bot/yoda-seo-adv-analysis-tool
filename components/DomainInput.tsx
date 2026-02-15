'use client'

import { useState } from 'react'

interface DomainInputProps {
  apiKeys: any
  onStart: (data: any) => void
  onBack: () => void
}

export default function DomainInput({ apiKeys, onStart, onBack }: DomainInputProps) {
  const [domain, setDomain] = useState('')
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '12m'>('6m')

  const handleStartAnalysis = () => {
    if (!domain.trim()) {
      alert('Inserisci un dominio valido!')
      return
    }

    onStart({
      mode: 'domain',
      domain: domain.trim(),
      timeRange
    })
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="text-slate-500 hover:text-teal-400 mb-4 inline-flex items-center gap-2 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Indietro
          </button>
          
          <h1 className="text-3xl font-bold text-teal-400 mb-2">
            🌐 Domain Bidding Analysis
          </h1>
          <p className="text-slate-400 italic">
            "Il dominio parlarmi farà. Scoprire dove bidda io posso."
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 mb-6">
          {/* Domain Input */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-teal-400 mb-4">
              Inserisci Dominio
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="es: nike.com"
              className="w-full px-6 py-4 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-200 text-lg"
            />
            <p className="text-xs text-slate-500 mt-2">
              Senza https:// - solo il dominio principale
            </p>
          </div>

          {/* Time Range */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-teal-400 mb-4">
              Periodo Analisi Bidding
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: '3m', label: '3 Mesi' },
                { value: '6m', label: '6 Mesi' },
                { value: '12m', label: '1 Anno' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value as any)}
                  className={`p-4 rounded-lg border-2 transition ${
                    timeRange === option.value
                      ? 'border-teal-500 bg-teal-900/20'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <p className="font-bold text-slate-200">{option.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartAnalysis}
            className="w-full py-4 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white rounded-lg font-bold text-lg transition shadow-lg"
          >
            Rileva Bidding →
          </button>
        </div>

        {/* Info */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-blue-400 font-bold mb-2">🔍 Cosa Rileverò</h3>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>• Keyword su cui {domain || 'il dominio'} bidda attualmente</li>
            <li>• Posizioni organic vs paid per ogni keyword</li>
            <li>• Competitors che biddano sulle stesse keyword</li>
            <li>• Raccomandazioni: dove il paid è superfluo</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

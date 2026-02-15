'use client'

import { useState } from 'react'
import Papa from 'papaparse'

interface KeywordInputProps {
  apiKeys: any
  onStart: (data: any) => void
  onBack: () => void
}

export default function KeywordInput({ apiKeys, onStart, onBack }: KeywordInputProps) {
  const [keywords, setKeywords] = useState<string[]>([])
  const [inputText, setInputText] = useState('')
  const [domain, setDomain] = useState('')
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '12m'>('6m')

  const processKeywords = (text: string) => {
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#'))
      .slice(0, 150)
    
    setKeywords(lines)
    return lines
  }

  const handleTextSubmit = () => {
    const kws = processKeywords(inputText)
    if (kws.length === 0) {
      alert('Inserisci almeno una keyword, giovane Padawan!')
      return
    }
    setKeywords(kws)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        complete: (results) => {
          const kws = results.data
            .flat()
            .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
            .slice(0, 150)
          
          setKeywords(kws)
          setInputText(kws.join('\n'))
        },
        header: false
      })
    } else if (file.name.endsWith('.txt')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        setInputText(text)
        const kws = processKeywords(text)
        setKeywords(kws)
      }
      reader.readAsText(file)
    }
  }

  const handleStartAnalysis = () => {
    if (keywords.length === 0) {
      alert('Carica almeno una keyword prima di procedere!')
      return
    }

    onStart({
      mode: 'keywords',
      keywords,
      domain: domain.trim() || null,
      timeRange
    })
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
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
            📝 Bulk Keywords Analysis
          </h1>
          <p className="text-slate-400 italic">
            "150 keyword massimo. Qualità sulla quantità prevale sempre."
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 mb-6">
          {/* Keyword Input */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-teal-400 mb-4">
              Keyword da Analizzare
            </label>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Text Input */}
              <div>
                <p className="text-sm text-slate-400 mb-3">
                  Inserisci manualmente (una per riga):
                </p>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="scarpe running&#10;nike air max&#10;scarpe da ginnastica&#10;..."
                  className="w-full h-64 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-200 font-mono text-sm resize-none"
                />
                <button
                  onClick={handleTextSubmit}
                  className="mt-3 w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                >
                  Carica da Testo ({inputText.split('\n').filter(l => l.trim()).length}/150)
                </button>
              </div>

              {/* File Upload */}
              <div>
                <p className="text-sm text-slate-400 mb-3">
                  Oppure carica file CSV/TXT:
                </p>
                <div className="border-2 border-dashed border-slate-700 hover:border-teal-500 rounded-lg p-12 text-center transition cursor-pointer">
                  <input
                    type="file"
                    accept=".txt,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-5xl mb-3">📁</div>
                    <p className="text-slate-400 font-semibold mb-2">
                      Clicca per caricare
                    </p>
                    <p className="text-xs text-slate-500">
                      CSV o TXT (max 150 kw)
                    </p>
                  </label>
                </div>

                {keywords.length > 0 && (
                  <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 font-semibold text-sm">
                      ✓ {keywords.length} keyword caricate
                    </p>
                    <p className="text-xs text-green-300 mt-1">
                      Prime 3: {keywords.slice(0, 3).join(', ')}...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Optional Domain */}
          <div className="mb-8 bg-slate-900/50 border border-slate-700 rounded-lg p-6">
            <label className="block text-lg font-semibold text-teal-400 mb-2">
              Dominio (Opzionale)
            </label>
            <p className="text-sm text-slate-400 mb-4">
              Se fornito, analizzerò anche le posizioni organic di questo sito per ogni keyword
            </p>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="es: nike.com"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-200"
            />
          </div>

          {/* Time Range */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-teal-400 mb-4">
              Periodo Analisi Bidding
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: '3m', label: '3 Mesi', desc: 'Trend recenti' },
                { value: '6m', label: '6 Mesi', desc: 'Medio termine' },
                { value: '12m', label: '1 Anno', desc: 'Lungo termine' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value as any)}
                  className={`p-4 rounded-lg border-2 transition ${
                    timeRange === option.value
                      ? 'border-teal-500 bg-teal-900/20'
                      : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                  }`}
                >
                  <p className="font-bold text-slate-200 mb-1">{option.label}</p>
                  <p className="text-xs text-slate-500">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartAnalysis}
            disabled={keywords.length === 0}
            className="w-full py-4 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-lg font-bold text-lg transition shadow-lg disabled:cursor-not-allowed"
          >
            {keywords.length === 0 
              ? 'Carica Keyword per Iniziare' 
              : `Avvia Analisi (${keywords.length} keyword)`}
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-blue-400 font-bold mb-2">💡 Cosa Analizzerò</h3>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>• Chi bidda su ogni keyword (brand + competitors)</li>
            <li>• CPC, volume di ricerca e competition level</li>
            <li>• Posizioni organic (se fornisci dominio)</li>
            <li>• Raccomandazioni: investire paid o focus SEO</li>
            <li>• Trend bidding nel periodo selezionato</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

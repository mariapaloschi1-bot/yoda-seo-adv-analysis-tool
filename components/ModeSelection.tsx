'use client'

interface ModeSelectionProps {
  onSelect: (mode: 'keywords' | 'domain') => void
  onChangeKeys: () => void
}

export default function ModeSelection({ onSelect, onChangeKeys }: ModeSelectionProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Header */}
      <header className="text-center mb-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-teal-400 shadow-glow-teal overflow-hidden">
          <img 
            src="https://www.shutterstock.com/image-vector/baby-yoda-grogu-cartoon-character-260nw-2293123629.jpg" 
            alt="Yoda" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-teal-400 mb-3">
          Percorso Scegliere Tu Devi
        </h1>
        
        <p className="text-slate-400 italic text-lg">
          "Due sentieri vedo. Uno solo percorrere tu puoi..."
        </p>
      </header>

      {/* Mode Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-5xl w-full mb-8">
        {/* Domain Mode */}
        <button
          onClick={() => onSelect('domain')}
          className="group bg-slate-800 hover:bg-slate-750 border-2 border-slate-700 hover:border-teal-500 rounded-2xl p-8 transition-all duration-300 text-left relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative z-10">
            <div className="text-5xl mb-4">🌐</div>
            <h3 className="text-2xl font-bold text-teal-400 mb-3 group-hover:text-teal-300 transition">
              Analizza Dominio
            </h3>
            <p className="text-slate-400 mb-4 leading-relaxed">
              Inserisci un sito web (es: <code className="text-teal-300">nike.com</code>). 
              Rileverò su quali keyword il sito bidda attualmente e analizzerò se il bidding è necessario vs organic.
            </p>
            <ul className="text-sm text-slate-500 space-y-2">
              <li>✓ Rileva bidding attuale automaticamente</li>
              <li>✓ Analisi brand vs generic keywords</li>
              <li>✓ Raccomandazioni budget specifiche</li>
              <li>✓ Confronto con competitors</li>
            </ul>
          </div>
          
          <div className="absolute bottom-4 right-4 text-teal-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </button>

        {/* Keywords Mode */}
        <button
          onClick={() => onSelect('keywords')}
          className="group bg-slate-800 hover:bg-slate-750 border-2 border-slate-700 hover:border-teal-500 rounded-2xl p-8 transition-all duration-300 text-left relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative z-10">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-teal-400 mb-3 group-hover:text-teal-300 transition">
              Analizza Keywords
            </h3>
            <p className="text-slate-400 mb-4 leading-relaxed">
              Carica un bulk fino a <strong className="text-teal-300">150 keyword</strong>. 
              Per ogni keyword analizzerò organic positions, paid competition, CPC e consigli budget.
            </p>
            <ul className="text-sm text-slate-500 space-y-2">
              <li>✓ Input bulk (CSV, TXT, manuale)</li>
              <li>✓ Fino a 150 keyword simultanee</li>
              <li>✓ Chi bidda + ad copy competitors</li>
              <li>✓ Export CSV completo</li>
            </ul>
          </div>
          
          <div className="absolute bottom-4 right-4 text-teal-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </button>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={onChangeKeys}
          className="text-slate-500 hover:text-teal-400 text-sm transition flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Cambia API Keys
        </button>
      </div>
    </div>
  )
}

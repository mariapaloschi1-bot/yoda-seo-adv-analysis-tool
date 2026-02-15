# 🐸 Yoda's Organic-Paid Analysis

> **"Do or do not. There is no try."** — Maestro Yoda

Strumento SEO/PPC per analizzare la competizione paid e ottimizzare il budget pubblicitario basandosi sulla presenza organica.

---

## ✨ Features

### 🔑 **BYOK (Bring Your Own Keys)**
- **DataForSEO API**: dati real-time su bidders, CPC, competition, search volume
- **Google Gemini API**: insights AI e raccomandazioni strategiche
- ✅ Chiavi salvate solo nel browser (localStorage)
- ✅ Zero server-side storage

### 📊 **Analisi Completa**
- **Bulk Keywords**: fino a 150 keyword contemporaneamente
- **Domain Analysis**: analizza il sito e identifica keyword biddabili
- **Bidders Detection**: lista completa di chi sta biddando (domain, ad copy, position)
- **Metriche**: CPC, competition level (0-100%), search volume, budget mensile stimato

### 🎯 **Logica Brand vs Generic**
- **Brand Keywords**: se hai 3-4+ posizioni top-3 organiche → **NO paid** (già domini la SERP)
- **Generic Keywords**: valuta CPC, competition, volume → **SI paid** / **TEST** / **NO paid**
- **Defensive Bidding**: alert se competitor biddano sul tuo brand

### 📈 **Dashboard Interattiva**
- Summary cards (SI paid, NO paid, TEST)
- Pie chart distribuzione raccomandazioni
- Bar chart top 10 CPC più alti
- Tabella dettagliata con bidders espandibili
- Export CSV completo

### 🧠 **AI Insights (Gemini)**
- Sintesi strategica in italiano
- 3-4 raccomandazioni actionable
- Stima budget mensile (range min-max)
- Top 5 keyword prioritarie

---

## 🚀 Quick Start

### 1️⃣ **Installa dipendenze**

```bash
npm install
# oppure
yarn install
```

### 2️⃣ **Avvia Development**

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000)

### 3️⃣ **Ottieni le API Keys**

#### DataForSEO
1. Registrati su [DataForSEO](https://app.dataforseo.com/register)
2. Ottieni **login** e **password** API
3. Costo: ~$0.60 per 150 keywords (pay-as-you-go)

#### Google Gemini
1. Vai su [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Crea una API key gratuita
3. Quota: 15 requests/minuto (tier gratuito)

### 4️⃣ **Usa l'app**

1. Inserisci le API keys nella schermata Setup
2. Scegli modalità:
   - **Bulk Keywords**: carica CSV/TXT o inserisci manualmente
   - **Domain Analysis**: inserisci dominio (es. `nike.com`)
3. Attendi l'analisi (~1-2 min per 150 keywords)
4. Esplora dashboard e esporta CSV

---

## 📂 Struttura Progetto

```
yodas-paid/
├── app/
│   ├── layout.tsx          # Layout globale
│   ├── page.tsx            # Routing principale
│   └── globals.css         # Tailwind + tema Yoda
├── components/
│   ├── SetupView.tsx       # BYOK input
│   ├── ModeSelection.tsx   # Scelta domain/keywords
│   ├── KeywordInput.tsx    # Bulk input
│   ├── DomainInput.tsx     # Domain input
│   ├── LoadingScreen.tsx   # Progress bar
│   └── Dashboard.tsx       # Risultati + charts
├── lib/
│   ├── dataforseo.ts       # Client DataForSEO
│   ├── gemini.ts           # Client Gemini AI
│   └── analyzer.ts         # Logica raccomandazioni
├── package.json
└── README.md
```

---

## 🎨 Design Theme

### Palette Colori (Yoda's Eye)
- **Background**: `slate-900` (#0f172a)
- **Cards**: `slate-800` (#1e293b)
- **Accent**: `teal-400` (#2dd4bf)
- **Borders**: `slate-700` + `teal-500/30`
- **Text**: `slate-200` (primario), `slate-400` (secondario)

### Font
- **Sans**: Inter (Google Fonts)
- **Mono**: JetBrains Mono

### Effetti
- Glow: `shadow-teal-500/20`
- Pulse: `animate-pulse` per loading
- Gradients: `from-slate-800 to-slate-900`

---

## 💰 Costi Operativi

| Servizio | Tipo | Costo per 150 keywords |
|----------|------|------------------------|
| **DataForSEO** | Pay-as-you-go | ~$0.50 |
| **Google Gemini** | Freemium | ~$0.10 (GPT-4o-mini) |
| **Vercel Hosting** | Gratis | $0 |
| **TOTALE** | Per analisi | **~$0.60** |

**Confronto Alternative:**
- SEMrush: $119/mese
- Ahrefs: $99/mese
- SpyFu: $39/mese

---

## 🧪 Esempio Output

### Dashboard Summary
```
📊 Keywords Totali: 150
🔴 SI Paid: 67 (45%)
🟢 NO Paid: 53 (35%)
🟡 Test: 30 (20%)
💰 Budget Stimato: €1,400 - €2,100/mese
```

### Tabella Dettagli
| Keyword | Bidders | CPC | Competition | Volume | Budget/mese | Raccomandazione |
|---------|---------|-----|-------------|--------|-------------|-----------------|
| scarpe running | 12 | €2.80 | 87% | 8,900 | €498 | 🔴 SI Paid |
| nike running | 3 | €1.20 | 45% | 12,000 | €288 | 🟢 NO Paid (brand) |
| scarpe trail | 8 | €1.90 | 72% | 3,400 | €129 | 🟡 TEST |

### AI Insight
> "Analizzate 150 keywords: 67 richiedono investimento paid (alta competizione), 53 hanno già forte presenza organica, 30 da testare. CPC medio: €1.85. **Raccomandazione**: priorità su keywords generiche alto-volume (es. 'scarpe running'), ottimizzare SEO su brand keywords, monitorare ROI settimanalmente."

---

## 🛠️ Deploy su Vercel

### Via GitHub

1. **Push su GitHub**
```bash
git init
git add .
git commit -m "Yoda's Organic-Paid Analysis v1.0"
git remote add origin https://github.com/TUO-USERNAME/yodas-paid.git
git push -u origin main
```

2. **Import su Vercel**
   - Vai su [vercel.com](https://vercel.com)
   - Click "New Project" → Import da GitHub
   - Seleziona `yodas-paid`
   - Deploy (auto-detect Next.js)

3. **Live in 3 minuti** 🚀
   - URL: `https://yodas-paid.vercel.app`

---

## 🔧 Troubleshooting

### ❌ "DataForSEO task failed"
- Verifica login/password corretti
- Controlla saldo account DataForSEO
- Rate limit: max 2000 requests/minuto

### ❌ "Gemini API error 429"
- Superato quota gratuita (15 req/min)
- Attendi 1 minuto o passa a tier pagato

### ❌ "No advertisers found"
- Normale per keyword di nicchia
- Controlla spelling keyword
- Prova con keyword più generiche

---

## 📚 API Reference

### DataForSEO
- **Ads Advertisers**: [Docs](https://docs.dataforseo.com/v3/serp/google/ads_advertisers/overview/)
- **Keyword Ideas**: [Docs](https://docs.dataforseo.com/v3/dataforseo_labs/google/keyword_ideas/overview/)
- **Pricing**: [Link](https://dataforseo.com/apis/serp-api/pricing)

### Google Gemini
- **AI Studio**: [Link](https://aistudio.google.com/)
- **API Docs**: [Link](https://ai.google.dev/docs)
- **Models**: `gemini-1.5-flash` (free), `gemini-1.5-pro` (pagato)

---

## 🌟 Roadmap Future

- [ ] **Historical Data**: confronto 3/6/12 mesi
- [ ] **Competitor Tracking**: monitor specifici domain
- [ ] **Automated Reports**: PDF/Email settimanali
- [ ] **Multi-Location**: analisi per paese/città
- [ ] **Bid Simulator**: simula ROI per diversi budget
- [ ] **Integration**: Google Ads API per sync offerte
- [ ] **Dark Mode Toggle** (già dark by default)

---

## 📄 License

MIT License - uso libero commerciale e privato.

---

## 🙏 Credits

- **Design**: Ispirato a Yoda's Eye
- **APIs**: DataForSEO + Google Gemini
- **Framework**: Next.js 14 + Tailwind CSS
- **Icons**: Emoji native

---

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/TUO-USERNAME/yodas-paid/issues)
- **Docs**: Questo README
- **Email**: tuo@email.com

---

**May the Force be with your CTR.** 🐸✨

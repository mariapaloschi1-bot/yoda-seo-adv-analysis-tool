# 🌟 Yoda's Paid Intelligence

**Analisi competitiva paid vs organic per Google Ads**  
Scopri chi fa bidding, quanto costa, e dove investire — guidato dall'intelligenza artificiale.

---

## 🚀 Cosa Fa Questo Tool?

### 1. **Analisi Bidding Competitiva**
Per ogni keyword inserita, scopri **chi sta facendo paid advertising** su Google:
- Numero di inserzionisti attivi
- Domini e nomi delle aziende
- Posizioni pubblicitarie (rank)

### 2. **Metriche di Investimento**
Dati reali da DataForSEO per ogni keyword:
- **CPC medio** (costo per click in €)
- **Volume di ricerca mensile**
- **Livello di competizione** (0-100%)

### 3. **Decisione Strategica AI**
Gemini AI suggerisce:
- **Dove investire in paid** (alto ROI, competitivo)
- **Dove puntare su SEO organica** (bassa competizione paid)
- **Quali keyword testare** (potenziale incerto)
- **Budget mensile stimato**

### 4. **Bulk Analysis**
- Analizza **fino a 150 keyword in una volta sola**
- Dashboard interattiva con grafici
- Tabelle esportabili in CSV
- Tempo di elaborazione: ~30s per 5 keywords, ~2.5 min per 150

---

## 📋 Requisiti (BYOK)

### 1. DataForSEO API
- **Login + Password** da [app.dataforseo.com](https://app.dataforseo.com/register)
- **Deposito minimo**: $10 una tantum
- **Costo per analisi**: ~$0.60 per 150 keywords
  - Ads Advertisers: 150 × $0.003 = $0.45
  - Keywords Data: 1 task × $0.15 = $0.15

### 2. Google Gemini API Key
- **Gratuita**: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- **Quota free**: 15 req/min, 1500 req/giorno
- **Costo sotto quota**: $0

### 3. Sicurezza BYOK
- Tutte le chiavi salvate **solo nel tuo browser** (localStorage)
- **Mai inviate** ai nostri server
- BYOK = Bring Your Own Key = massima sicurezza

---

## 💻 Installazione Locale

```bash
# 1. Estrai archivio
tar -xzf yodas-paid-COMPLETE-FINAL.tar.gz
cd yodas-paid

# 2. Installa dipendenze
npm install

# 3. Avvia dev server
npm run dev

# Apri http://localhost:3000
```

---

## 🌐 Deploy su Vercel

```bash
# 1. Push su GitHub
git init
git add .
git commit -m "Initial commit - Yoda's Paid Intelligence"
git remote add origin https://github.com/TUO-USERNAME/yodas-paid.git
git push -u origin main

# 2. Deploy Vercel
# → Dashboard Vercel: Import Project
# → Seleziona repo: yodas-paid
# → Framework: Next.js (auto-detect)
# → Build command: npm run build
# → Output directory: .next
# → Deploy!

# URL live: https://yodas-paid-TUO-USERNAME.vercel.app
```

---

## 🧪 Test del Tool

### Test Rapido (5 keywords)
```
scarpe running
nike running
adidas scarpe
scarpe trail
running donna
```

**Output atteso**:
- ✅ 12 advertiser per "scarpe running"
- ✅ CPC medio: €2.80
- ✅ Competition: 87%
- ✅ Volume: 8,900/mese
- ✅ Budget stimato: €498/mese
- ✅ Raccomandazione: **SI - Investire in Paid**

### Tempo di Elaborazione
- 5 keywords: ~30 secondi
- 50 keywords: ~60 secondi
- 150 keywords: ~2.5 minuti (rate limit 1 kw/sec)

---

## 📊 Esempio Dashboard

### Riepilogo
```
📈 Totale Keywords: 150
✅ Paid (SI): 67 (45%)
❌ Organic (NO): 53 (35%)
⚠️ Test: 30 (20%)
💰 Budget Stimato: €1,400-€2,100/mese
```

### Saggezza Jedi (AI)
```
"Focus su 'scarpe running' (8.9k vol, €2.80 CPC) e 'running donna' (5.2k vol, €1.90 CPC).
ROI atteso: €1,850/mese con CTR 2%. Evita 'scarpe economiche' (alta competition, basso CPC)."
```

### Tabella Dettagliata
| Keyword | Bidders | CPC (€) | Competition | Volume | Budget/mese | Raccomandazione |
|---------|---------|---------|-------------|--------|-------------|-----------------|
| scarpe running | 12 | 2.80 | 87% | 8,900 | €498 | ✅ SI - Investire in Paid |
| nike running | 8 | 1.50 | 65% | 5,200 | €156 | ⚠️ TEST - Monitorare |
| adidas scarpe | 3 | 0.80 | 32% | 2,100 | €34 | ❌ NO - Focus Organico |

---

## 🐛 Troubleshooting

### Dati a Zero / Tabelle Vuote
**Causa**: Credenziali DataForSEO errate o saldo insufficiente  
**Soluzione**:
1. Verifica login/password su [app.dataforseo.com/api-access](https://app.dataforseo.com/api-access)
2. Controlla saldo (minimo $10)
3. Test curl:
```bash
curl -u "LOGIN:PASSWORD" \
  https://api.dataforseo.com/v3/keywords_data/google/search_volume/live \
  -H "Content-Type: application/json" \
  -d '[{"keywords":["test"],"location_name":"Italy","language_name":"Italian"}]'
```

### Errore 40301 Insufficient Funds
**Causa**: Saldo DataForSEO < $10  
**Soluzione**: Ricarica account su [app.dataforseo.com](https://app.dataforseo.com)

### Gemini 429 Too Many Requests
**Causa**: >15 req/min (quota free)  
**Soluzione**:
- Attendi 1 minuto
- Oppure passa a quota Pro ($0.001/req)

### "Disturbo nella Forza" (Errore Generico)
**Causa**: Timeout API, rate limit, network error  
**Soluzione**:
1. Riduci numero keywords (max 50 per test)
2. Controlla console browser (F12 → Console)
3. Vercel logs: Dashboard → Functions → `/api/analyze`

### Baby Yoda Non Carica
**Causa**: Immagine Shutterstock non accessibile  
**Soluzione**:
1. Verifica `public/baby-yoda-loading.png` presente
2. Download manuale: [Shutterstock Link](https://www.shutterstock.com/image-vector/baby-yoda-grogu-cartoon-character-260nw-2293123629.jpg)

### Font Sbagliato / Stile Diverso
**Causa**: Cache browser  
**Soluzione**: Hard refresh (Ctrl+Shift+R o Cmd+Shift+R)

---

## 💰 Analisi Costi

### Per 150 Keywords (1 analisi completa)
| Servizio | Costo | Note |
|----------|-------|------|
| DataForSEO Ads Advertisers | $0.45 | 150 × $0.003 |
| DataForSEO Keywords Data | $0.15 | 1 task |
| Google Gemini (free tier) | $0 | < 15 req/min |
| Vercel Hosting | $0 | Hobby plan |
| **TOTALE** | **$0.60** | (~€0.55) |

### Confronto con Competitor
| Tool | Costo/mese | Per analisi | Risparmio |
|------|------------|-------------|-----------|
| **Yoda's Paid Intelligence** | **Pay-as-you-go** | **€0.55** | **Baseline** |
| SEMrush | €119/mese | — | 99.5% |
| Ahrefs | €99/mese | — | 99.4% |
| SpyFu | €39/mese | — | 98.6% |

**💡 ROI**: Risparmio di ~€1,400/anno vs SEMrush (€119×12 - €0.55×12 = €1,421)

---

## 🛠️ Stack Tecnologico

- **Framework**: Next.js 14.2.35 (React 18, App Router)
- **Styling**: Tailwind CSS 3.x + custom Yoda theme
- **Fonts**: Inter (UI) + JetBrains Mono (code)
- **APIs**:
  - DataForSEO Keywords Data API v3 (CPC/volume/competition)
  - DataForSEO Ads Advertisers API v3 (bidding data)
  - Google Gemini 1.5 Flash (AI insights)
- **Hosting**: Vercel (serverless functions)
- **Storage**: Browser localStorage (BYOK)

---

## 📁 Struttura Progetto

```
yodas-paid/
├── public/
│   └── baby-yoda-loading.png       # Immagine Shutterstock (loading spinner)
├── app/
│   ├── globals.css                 # Font Inter + stile galassia + glow effects
│   ├── layout.tsx                  # Layout root
│   ├── page.tsx                    # Welcome + Input view + routing
│   └── api/analyze/route.ts        # Server-side API (DataForSEO + Gemini)
├── components/
│   ├── WelcomeScreen.tsx           # Schermata benvenuto con spiegazione tool
│   ├── LoadingScreen.tsx           # Baby Yoda rotante + progress bar
│   └── Dashboard.tsx               # Risultati, grafici, tabelle, export CSV
├── lib/
│   └── analyzer.ts                 # Tipi TypeScript (AnalysisResult, etc.)
├── package.json                    # Dipendenze (next, react, tailwindcss)
├── tsconfig.json                   # Config TypeScript
├── tailwind.config.js              # Temi custom (slate, teal, amber)
├── next.config.js                  # Config Next.js
└── README.md                       # Questo file
```

---

## 🎨 Stile Yoda's Eye

### Colori
- **Background**: `#0f172a` (slate-900) + galassia stellata
- **Primary**: `#2dd4bf` (teal-400) — azioni, link, highlights
- **Secondary**: `#d97706` (amber-600) — API keys, accenti
- **Text**: `#e2e8f0` (slate-200) — testo principale

### Font
- **UI**: Inter (Google Fonts) — pesi 300-800
- **Code**: JetBrains Mono — keyword input, metrics

### Animazioni
- Baby Yoda bounce (2s)
- Glow effects (teal pulsante)
- Galassia twinkle (8s fade)
- Loading spinner slow-spin (4s)

---

## 📝 Changelog

### v1.0.0 (2026-02-15)
- ✅ Welcome screen con spiegazione tool
- ✅ Fix endpoint DataForSEO (Keywords Data API v3)
- ✅ Baby Yoda Shutterstock in header + loading
- ✅ Font Inter + JetBrains Mono (identico Yoda's Eye)
- ✅ Rimosse TUTTE le emoji (🌐🔑⚠️⏱️)
- ✅ Spiegazioni dettagliate per ogni campo
- ✅ Footer "Fatto con ❤️ per la SEO da Maria Paloschi"
- ✅ Background galassia stellata
- ✅ Glow effects + animazioni smooth
- ✅ Logging dettagliato API
- ✅ BYOK localStorage (DataForSEO + Gemini)
- ✅ Rate limiting 1 kw/sec
- ✅ Gestione errori con fallback

---

## 🤝 Supporto

- **DataForSEO Docs**: [docs.dataforseo.com](https://docs.dataforseo.com/v3/)
- **Gemini API Docs**: [ai.google.dev](https://ai.google.dev/gemini-api/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

## 📄 Licenza

Progetto proprietario — Fatto con ❤️ per la SEO da **Maria Paloschi**

---

## 🎯 Prossimi Passi Suggeriti

1. ✅ Testa con 5-10 keyword reali
2. ✅ Monitora saldo DataForSEO (Dashboard → API Access)
3. ⚠️ Considera Gemini quota Pro se superi 15 req/min
4. 📈 Implementa storico dati (opzionale, DB + Prisma)
5. 🔔 Aggiungi notifiche email con insights settimanali
6. 🌍 Estendi a più location (UK, US, DE) — già supportato API
7. 📊 Dashboard avanzata con trend temporali (keyword tracking)

---

**"Bilanciare paid e organic, la via del Maestro è."** — Yoda 🧙‍♂️

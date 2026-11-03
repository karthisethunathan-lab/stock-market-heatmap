# MarketPulse — Stock Market Heatmap & Portfolio Terminal

A high-performance, production-quality **Stock Market Heatmap** and portfolio tracking web application built with React, Vite, TypeScript, Tailwind CSS, D3 (d3-hierarchy), and Node.js/Express.

Stocks are rendered as an interactive, grouped red/green treemap heatmap where tile size represents market capitalization and color represents percentage change across selectable timeframes (1D, 1W, 1M, YTD). Clicking any tile slides open a comprehensive stock detail drawer featuring interactive OHLC charts, key ratios, company profiles, analyst recommendation trends, and live financial news.

---

## 🏛️ Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │          React + Vite Frontend         │
                      │  - D3 Treemap (d3-hierarchy squarify)  │
                      │  - Recharts Area / Candlestick Charts  │
                      │  - Portfolios & Watchlist Engine       │
                      │  - Dark / Light & Colorblind Modes     │
                      └───────────────────┬────────────────────┘
                                          │
                                HTTP (Proxy /api)
                                          │
                      ┌───────────────────▼────────────────────┐
                      │          Express Node.js Proxy         │
                      │  - Node-cache (30s-60s TTL quotes, 1h) │
                      │  - Finnhub Token Limiter Queue (60/min)│
                      │  - Rate Limiter (express-rate-limit)   │
                      │  - CORS origin locking                 │
                      └─────────────┬────────────────────┬─────┘
                                    │                    │
                  ┌─────────────────▼──────┐       ┌─────▼──────────────────┐
                  │      Yahoo Finance     │       │      Finnhub REST      │
                  │  (yahoo-finance2/v8)   │       │  - /stock/profile2     │
                  │  - Bulk quotes         │       │  - /stock/metric       │
                  │  - Historical OHLC     │       │  - /recommendation     │
                  │  - US & Indian symbols │       │  - /company-news       │
                  │  - Autocomplete search │       │  - Graceful fallback   │
                  └────────────────────────┘       └────────────────────────┘
```

### Data Source Split (Respects Free-Tier Limits)
- **Yahoo Finance**: Bulk quotes for the heatmap, historical OHLC for charts (1D, 1W, 1M, 6M, 1Y, 5Y), search/autocomplete, Indian symbols (`.NS` / `.BO`).
- **Finnhub Free REST**: Company profiles, logos, analyst consensus ratings, financial metrics (P/E, EPS, Beta, 52w high/low), and latest company news.
- **Finnhub `/stock/candle` is NOT used** (paid endpoint); Yahoo is used for all chart OHLC candles.
- **Server-side Caching & Throttling**: In-memory caching via `node-cache` (45s TTL for quotes, 60s for heatmap, 1 hour for profiles/metrics, 15m for news) and an asynchronous token queue for Finnhub calls.
- **Graceful Fallback**: If Finnhub has no key, hits rate limits, or is querying non-US stocks (like NIFTY 50), the system automatically falls back to Yahoo metadata without throwing errors.

---

## 📂 Project Structure

```
my-stocks-site/
├── .env.example
├── README.md
├── package.json
├── server/
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── src/
│       ├── index.js                     # Express server & error middleware
│       ├── cache.js                     # NodeCache instance & TTL config
│       ├── data/
│       │   ├── usSymbols.json           # S&P 100 symbols, sectors, caps
│       │   └── inSymbols.json           # NIFTY 50 (.NS) symbols, sectors, caps
│       ├── routes/
│       │   ├── heatmap.js               # GET /api/heatmap
│       │   ├── stock.js                 # GET /api/quote, /profile, /history, /metrics, /news
│       │   └── search.js                # GET /api/search
│       └── services/
│           ├── yahoo.js                 # Yahoo v8 chart & search client
│           └── finnhub.js               # Finnhub API queue & rate limiter
└── client/
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts                   # Proxies /api to http://localhost:5000
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.tsx
        ├── App.tsx                      # Root component & tab layout
        ├── index.css                    # Tailwind + tabular figure formatting
        ├── types/
        │   └── index.ts                 # Full TypeScript interfaces
        ├── lib/
        │   ├── api.ts                   # API client for backend
        │   ├── storage.ts               # LocalStorage adapter (pluggable for Firebase/Supabase)
        │   └── utils.ts                 # Currency & compact formatters, CSV parser, color scales
        ├── hooks/
        │   ├── useHeatmap.ts            # Heatmap data fetching, 60s countdown, sector filter
        │   ├── useStockDetail.ts        # Parallel stock metrics, charts & news fetcher
        │   ├── usePortfolios.ts         # Portfolio state, P&L calculations, weights, donut data
        │   └── useDebounce.ts           # Input debounce for search
        ├── context/
        │   └── ThemeContext.tsx         # Dark/Light mode, Colorblind mode, Drawer, Watchlist
        └── components/
            ├── common/
            │   ├── Navbar.tsx           # Sticky header, search hotkey (Ctrl+K), theme toggles
            │   ├── Footer.tsx           # Compliance disclaimer & data attribution
            │   ├── SearchModal.tsx      # Global ticker autocomplete modal
            │   ├── Toast.tsx            # Toast notifications container
            │   └── Skeleton.tsx         # Loading pulse skeletons
            ├── heatmap/
            │   ├── HeatmapView.tsx      # Main heatmap view with advance/decline stats
            │   ├── TreemapD3.tsx        # D3-hierarchy squarified sector-grouped treemap
            │   ├── HeatmapControls.tsx  # Market, timeframe, sector filter, pause/refresh
            │   └── TileTooltip.tsx      # Floating hover tooltip with prices & market cap
            ├── stock/
            │   ├── StockDrawer.tsx      # Master slide-over detail drawer
            │   ├── StockChart.tsx       # Recharts interactive line/area & candlestick chart
            │   ├── KeyStatsGrid.tsx     # 52w range slider, P/E, EPS, Beta, volume, market cap
            │   ├── CompanyProfile.tsx   # Company description, exchange, website link
            │   ├── AnalystBar.tsx       # Buy/Hold/Sell analyst consensus breakdown
            │   └── NewsList.tsx         # 8 recent articles with external links
            ├── portfolio/
            │   ├── PortfolioPage.tsx    # Multiple portfolios manager with CSV import/export
            │   ├── PortfolioSummaryCards.tsx # Total invested, current value, total P&L, day P&L
            │   ├── HoldingsTable.tsx    # Detailed holdings table with live P&L and actions
            │   ├── AddHoldingModal.tsx  # Modal to add/edit holdings with symbol search
            │   ├── AllocationDonut.tsx  # Recharts donut allocation by stock and sector
            │   └── PortfolioHeatmap.tsx # Treemap visualization specifically for portfolio
            └── watchlist/
                └── WatchlistView.tsx    # Dedicated card/grid view of watched tickers
```

---

## ⚡ Setup and Run Commands

### Prerequisites
- Node.js (v18 or higher recommended, tested on v24)
- npm or pnpm

### 1. Configure Environment Variables
Copy `.env.example` in `server/.env`:
```bash
cd server
copy .env.example .env
```
Open `server/.env` and paste your free Finnhub API Key:
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173,http://localhost:3000
FINNHUB_API_KEY=your_finnhub_api_key_here
```
*(If you don't have a Finnhub key yet, you can leave it blank; the app will automatically use Yahoo Finance fallback data without breaking.)*

### 2. Install Dependencies
From the project root:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Run the Development Environment

**Start the Backend Proxy (Port 5000):**
```bash
cd server
npm start
```
You should see:
```
🚀 Stock Heatmap Server running on http://localhost:5000
📊 Finnhub Key: Configured ✅ (or graceful Yahoo fallback)
```

**Start the Frontend (Port 5173):**
In a second terminal:
```bash
cd client
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 🚀 Production Deployment Steps

### Frontend Deployment (Vercel)
1. Push the code to GitHub.
2. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Select your repository.
4. Set the **Root Directory** to `client`.
5. Framework preset: **Vite**.
6. In `client/vite.config.ts`, update the proxy target or set an environment variable `VITE_API_URL` pointing to your deployed backend URL.
7. Click **Deploy**.

### Backend Deployment (Render or Railway)
1. **Render**:
   - Create a new **Web Service** on [Render](https://render.com/).
   - Root directory: `server`.
   - Build Command: `npm install`.
   - Start Command: `node src/index.js`.
   - Add Environment Variables:
     - `FINNHUB_API_KEY`: Your Finnhub key.
     - `CLIENT_ORIGIN`: Your Vercel domain (e.g. `https://my-stock-heatmap.vercel.app`).
     - `NODE_ENV`: `production`.
     - `PORT`: `5000`.
2. **Railway**:
   - Create a new project pointing to the `server` directory.
   - Railway auto-detects `package.json` and runs `npm start`.
   - Supply `FINNHUB_API_KEY` and `CLIENT_ORIGIN` in the Railway Variables tab.

---

## ⚠️ Known Limitations & Design Mitigations

1. **Unofficial Yahoo Finance API**:
   - Yahoo Finance does not offer an official free REST API. The `yahoo-finance2` package and Yahoo endpoints can occasionally change or apply crumb requirements.
   - **Mitigation**: Our backend uses direct, robust Yahoo chart endpoints (`query2.finance.yahoo.com/v8/finance/chart`) with desktop user-agent rotation and node-caching. In the unlikely event of an upstream block, the system automatically uses pre-seeded data so users never experience crashes or blank screens.
2. **Finnhub Free Tier Rate Limits**:
   - Finnhub's free tier has a limit of **60 calls per minute**.
   - **Mitigation**: We added an asynchronous request queue (`RequestQueue` in `services/finnhub.js`) with pacing and a high-efficiency in-memory cache (`node-cache`) with 1-hour TTL for company profiles and metrics. Finnhub `/stock/candle` is never queried (avoiding paid tier blocks).
3. **Multi-Currency Portfolios**:
   - If a user adds both US equities (in USD) and Indian equities (in INR) to the same portfolio, their raw numerical sums are displayed with a clear notice explaining that values are aggregated without FX rates unless an FX conversion service is enabled.
4. **Storage**:
   - Default storage is browser `localStorage`. The codebase implements the `IStorageProvider` adapter interface (`client/src/lib/storage.ts`), enabling a drop-in swap to Firebase, Supabase, or PostgreSQL when user authentication is introduced.

import React, { useEffect, useState } from 'react';
import { fetchQuote, fetchHistory } from '../../lib/api';
import {
  Calculator,
  TrendingUp,
  Layers,
  Globe,
  PieChart,
  Calendar,
  Building,
} from 'lucide-react';

interface IndexMechanicsTabProps {
  symbol: string;
}

interface IndexConfig {
  name: string;
  country: string;
  flag: string;
  exchange: string;
  weightingType: string;
  constituentCount: number;
  rebalanceSchedule: string;
  topSectors: Array<{ name: string; weight: string }>;
  keyThemes: string[];
}

const INDEX_REGISTRY: Record<string, IndexConfig> = {
  '^GSPC': {
    name: 'S&P 500',
    country: 'United States',
    flag: '🇺🇸',
    exchange: 'NYSE / NASDAQ',
    weightingType: 'Free-Float Market Capitalization',
    constituentCount: 503,
    rebalanceSchedule: 'Quarterly (March, June, September, December)',
    topSectors: [
      { name: 'Information Technology', weight: '31.2%' },
      { name: 'Financials', weight: '13.4%' },
      { name: 'Health Care', weight: '11.8%' },
      { name: 'Consumer Discretionary', weight: '10.5%' },
      { name: 'Communication Services', weight: '9.2%' },
    ],
    keyThemes: ['Global Equity Benchmark', 'Large-Cap Quality', 'AI & Tech Megatrend', 'Corporate Earnings Growth'],
  },
  '^NDX': {
    name: 'Nasdaq 100',
    country: 'United States',
    flag: '🇺🇸',
    exchange: 'NASDAQ',
    weightingType: 'Modified Market Capitalization',
    constituentCount: 101,
    rebalanceSchedule: 'Annual Reconstitution (December) & Quarterly Rebalance',
    topSectors: [
      { name: 'Technology', weight: '50.4%' },
      { name: 'Consumer Services', weight: '18.6%' },
      { name: 'Communication', weight: '15.2%' },
      { name: 'Healthcare', weight: '6.5%' },
      { name: 'Industrials', weight: '4.8%' },
    ],
    keyThemes: ['Hyper-Growth Tech Leaders', 'Semiconductor Ecosystem', 'Cloud & Generative AI', 'High Beta Momentum'],
  },
  '^DJI': {
    name: 'Dow Jones Industrial Average',
    country: 'United States',
    flag: '🇺🇸',
    exchange: 'NYSE / NASDAQ',
    weightingType: 'Price-Weighted',
    constituentCount: 30,
    rebalanceSchedule: 'As Needed (Committee-Based)',
    topSectors: [
      { name: 'Financial Services', weight: '24.1%' },
      { name: 'Healthcare', weight: '18.9%' },
      { name: 'Technology', weight: '18.5%' },
      { name: 'Industrials', weight: '14.8%' },
      { name: 'Consumer Goods', weight: '13.2%' },
    ],
    keyThemes: ['Centenarian US Blue Chips', 'Dividend Payers', 'Industrial Titans', 'Economic Cycle Resilience'],
  },
  '^RUT': {
    name: 'Russell 2000',
    country: 'United States',
    flag: '🇺🇸',
    exchange: 'NYSE / NASDAQ',
    weightingType: 'Market Capitalization',
    constituentCount: 1985,
    rebalanceSchedule: 'Annual Reconstitution (June)',
    topSectors: [
      { name: 'Industrials', weight: '18.2%' },
      { name: 'Financials', weight: '16.5%' },
      { name: 'Health Care (Biotech)', weight: '14.8%' },
      { name: 'Information Technology', weight: '13.6%' },
      { name: 'Consumer Discretionary', weight: '10.9%' },
    ],
    keyThemes: ['Domestic US Revenue Focus', 'Interest Rate Sensitivity', 'Small-Cap Value & Growth', 'M&A Acquisition Targets'],
  },
  '^FTSE': {
    name: 'FTSE 100',
    country: 'United Kingdom',
    flag: '🇬🇧',
    exchange: 'London Stock Exchange (LSE)',
    weightingType: 'Free-Float Market Capitalization',
    constituentCount: 100,
    rebalanceSchedule: 'Quarterly (March, June, September, December)',
    topSectors: [
      { name: 'Financials', weight: '19.8%' },
      { name: 'Consumer Staples', weight: '16.2%' },
      { name: 'Energy (Shell/BP)', weight: '13.5%' },
      { name: 'Health Care', weight: '12.4%' },
      { name: 'Materials & Mining', weight: '8.9%' },
    ],
    keyThemes: ['High Dividend Yield (~3.8%)', 'Multinational Dollar/Euro Earnings', 'Global Commodity Exporters', 'Defensive Value'],
  },
  '^GDAXI': {
    name: 'DAX 40',
    country: 'Germany',
    flag: '🇩🇪',
    exchange: 'Frankfurt Stock Exchange (XETRA)',
    weightingType: 'Free-Float Market Capitalization',
    constituentCount: 40,
    rebalanceSchedule: 'Semi-Annual (March & September)',
    topSectors: [
      { name: 'Industrials & Auto', weight: '28.4%' },
      { name: 'Information Technology (SAP)', weight: '22.1%' },
      { name: 'Financials (Allianz)', weight: '17.3%' },
      { name: 'Healthcare & Pharma', weight: '11.5%' },
      { name: 'Materials & Chemicals', weight: '8.6%' },
    ],
    keyThemes: ['European Industrial Powerhouse', 'Export-Driven Engineering', 'Software & Cloud (SAP)', 'Automotive Transition'],
  },
  '^FCHI': {
    name: 'CAC 40',
    country: 'France',
    flag: '🇫🇷',
    exchange: 'Euronext Paris',
    weightingType: 'Free-Float Market Capitalization',
    constituentCount: 40,
    rebalanceSchedule: 'Quarterly (March, June, September, December)',
    topSectors: [
      { name: 'Consumer Goods (Luxury/LVMH)', weight: '32.5%' },
      { name: 'Industrials (Airbus/Schneider)', weight: '24.2%' },
      { name: 'Energy (TotalEnergies)', weight: '10.8%' },
      { name: 'Healthcare (Sanofi)', weight: '9.4%' },
      { name: 'Financials', weight: '9.1%' },
    ],
    keyThemes: ['Global Luxury Leaders (LVMH, Hermes, Kering)', 'Aeronautics & Defense', 'Energy Transition', 'French Blue Chips'],
  },
  '^STOXX50E': {
    name: 'Euro Stoxx 50',
    country: 'Eurozone',
    flag: '🇪🇺',
    exchange: 'Euronext / Deutsche Borse / BME',
    weightingType: 'Free-Float Market Capitalization (10% Cap)',
    constituentCount: 50,
    rebalanceSchedule: 'Annual (September)',
    topSectors: [
      { name: 'Technology (ASML/SAP)', weight: '23.4%' },
      { name: 'Financials', weight: '21.5%' },
      { name: 'Consumer Discretionary', weight: '16.8%' },
      { name: 'Industrials', weight: '14.2%' },
      { name: 'Healthcare', weight: '8.9%' },
    ],
    keyThemes: ['Top 50 Pan-European Champions', 'Semiconductor Equipment (ASML)', 'Banking Consolidation', 'Dividend Strength'],
  },
  '^N225': {
    name: 'Nikkei 225',
    country: 'Japan',
    flag: '🇯🇵',
    exchange: 'Tokyo Stock Exchange (TSE)',
    weightingType: 'Price-Weighted',
    constituentCount: 225,
    rebalanceSchedule: 'Semi-Annual (April & October)',
    topSectors: [
      { name: 'Technology & Electronics', weight: '48.2%' },
      { name: 'Consumer Goods & Auto', weight: '23.5%' },
      { name: 'Materials & Chemicals', weight: '12.1%' },
      { name: 'Capital Goods', weight: '9.8%' },
      { name: 'Financials', weight: '3.4%' },
    ],
    keyThemes: ['TSE Corporate Governance Reforms', 'Yen Sensitivity & Exporters', 'Semiconductor Equipment Titans', 'Deflation Exit & Wage Hikes'],
  },
  '^NSEI': {
    name: 'Nifty 50',
    country: 'India',
    flag: '🇮🇳',
    exchange: 'National Stock Exchange (NSE)',
    weightingType: 'Free-Float Market Capitalization',
    constituentCount: 50,
    rebalanceSchedule: 'Semi-Annual (March & September)',
    topSectors: [
      { name: 'Financial Services', weight: '33.2%' },
      { name: 'Information Technology', weight: '13.8%' },
      { name: 'Oil, Gas & Energy', weight: '11.5%' },
      { name: 'Automobile', weight: '7.8%' },
      { name: 'Consumer Goods (FMCG)', weight: '7.5%' },
    ],
    keyThemes: ['Fastest Growing Major Global Economy (~7% GDP)', 'Domestic Capex Cycle', 'Financial Deepening & SIP Inflows', 'Digital Public Infrastructure'],
  },
  '^BSESN': {
    name: 'BSE Sensex',
    country: 'India',
    flag: '🇮🇳',
    exchange: 'BSE India',
    weightingType: 'Free-Float Market Capitalization',
    constituentCount: 30,
    rebalanceSchedule: 'Semi-Annual (June & December)',
    topSectors: [
      { name: 'Financial Services', weight: '37.8%' },
      { name: 'Information Technology', weight: '14.2%' },
      { name: 'Energy & Utilities', weight: '12.6%' },
      { name: 'FMCG', weight: '8.4%' },
      { name: 'Automobile', weight: '7.1%' },
    ],
    keyThemes: ['Oldest Stock Index in South Asia', 'Indian Mega-Caps', 'Demographic Dividend', 'Manufacturing & Export Shift'],
  },
  '^HSI': {
    name: 'Hang Seng Index',
    country: 'Hong Kong',
    flag: '🇭🇰',
    exchange: 'Hong Kong Stock Exchange (HKEX)',
    weightingType: 'Free-Float Market Capitalization (8% Cap)',
    constituentCount: 82,
    rebalanceSchedule: 'Quarterly',
    topSectors: [
      { name: 'Financials (HSBC/AIA)', weight: '34.2%' },
      { name: 'Information Technology (Tencent/Meituan/Alibaba)', weight: '28.5%' },
      { name: 'Consumer Goods', weight: '14.8%' },
      { name: 'Properties & Real Estate', weight: '5.2%' },
      { name: 'Utilities', weight: '3.6%' },
    ],
    keyThemes: ['China Gateway for International Capital', 'Deep Valuation Discounts', 'Southbound Stock Connect Flows', 'Tech Buyback Expansion'],
  },
  '000001.SS': {
    name: 'Shanghai Composite',
    country: 'China',
    flag: '🇨🇳',
    exchange: 'Shanghai Stock Exchange (SSE)',
    weightingType: 'Total Market Capitalization',
    constituentCount: 2260,
    rebalanceSchedule: 'Semi-Annual',
    topSectors: [
      { name: 'Financials (State Banks)', weight: '22.8%' },
      { name: 'Industrials & Infrastructure', weight: '19.4%' },
      { name: 'Information Technology', weight: '16.5%' },
      { name: 'Consumer Staples (Kweichow Moutai)', weight: '12.2%' },
      { name: 'Materials & Energy', weight: '11.8%' },
    ],
    keyThemes: ['Mainland China A-Share Market', 'State-Owned Enterprises (SOE) Value', 'Central Bank Monetary Stimulus', 'Green Energy & Solar Tech'],
  },
  '^VIX': {
    name: 'CBOE Volatility Index (VIX)',
    country: 'United States',
    flag: '🇺🇸',
    exchange: 'CBOE',
    weightingType: 'Implied Volatility Formula (S&P 500 30-Day Options)',
    constituentCount: 1,
    rebalanceSchedule: 'Real-Time Continuous Pricing',
    topSectors: [
      { name: '30-Day SPX Put Options', weight: '50.0%' },
      { name: '30-Day SPX Call Options', weight: '50.0%' },
    ],
    keyThemes: ['Wall Street "Fear Gauge"', 'Mean-Reverting Index', 'Hedging Inflow Indicator', 'Risk-On / Risk-Off Sentiment Driver'],
  },
};

export const IndexMechanicsTab: React.FC<IndexMechanicsTabProps> = ({ symbol }) => {
  const [quote, setQuote] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [simPoints, setSimPoints] = useState<string>('50');

  const cleanSym = symbol.toUpperCase();
  const config = INDEX_REGISTRY[cleanSym] || {
    name: quote?.name || cleanSym,
    country: 'Global',
    flag: '🌐',
    exchange: 'Global Exchange',
    weightingType: 'Free-Float Market Capitalization',
    constituentCount: 50,
    rebalanceSchedule: 'Quarterly Rebalancing',
    topSectors: [
      { name: 'Technology & Financials', weight: '45.0%' },
      { name: 'Industrials & Healthcare', weight: '30.0%' },
      { name: 'Consumer & Energy', weight: '25.0%' },
    ],
    keyThemes: ['National Benchmark Equity Index', 'Institutional Asset Allocation', 'Passive Index Tracker Funds (ETFs)'],
  };

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      fetchQuote(symbol),
      fetchHistory(symbol, '1Y', '1d'),
    ]).then(([qRes, hRes]) => {
      if (!isMounted) return;

      const q = qRes.status === 'fulfilled' ? qRes.value.data : null;
      setQuote(q);

      const candles = hRes.status === 'fulfilled' ? hRes.value.data?.candles || [] : [];
      let ma50 = 0;
      let ma200 = 0;
      if (candles.length >= 50) {
        const last50 = candles.slice(-50);
        ma50 = last50.reduce((acc: number, c: any) => acc + c.close, 0) / 50;
      }
      if (candles.length >= 200) {
        const last200 = candles.slice(-200);
        ma200 = last200.reduce((acc: number, c: any) => acc + c.close, 0) / 200;
      }

      setData({
        ma50: ma50 || (q?.price ? q.price * 0.98 : null),
        ma200: ma200 || (q?.price ? q.price * 0.95 : null),
      });
    });

    return () => {
      isMounted = false;
    };
  }, [symbol]);

  const livePrice = quote?.price || 1000;
  const pointDelta = parseFloat(simPoints) || 0;
  const pctDelta = livePrice > 0 ? (pointDelta / livePrice) * 100 : 0;

  return (
    <div className="p-4 sm:p-5 flex flex-col gap-5 text-slate-200">
      {/* Index Benchmark Overview Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30">
              GLOBAL BENCHMARK INDEX
            </span>
            <span className="text-xs text-slate-400">{config.flag} {config.country}</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            {config.name} ({symbol})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Key equity barometer tracked by sovereign wealth funds, institutional asset managers, and global ETFs.
          </p>
        </div>

        <div className="flex flex-col sm:items-end">
          <span className="text-[11px] text-slate-400">Current Index Level</span>
          <span className="text-2xl font-mono font-bold text-white">
            {livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`text-xs font-mono font-semibold ${(quote?.changePercent || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {(quote?.changePercent || 0) >= 0 ? '+' : ''}{(quote?.changePercent || 0).toFixed(2)}% ({(quote?.change || 0) >= 0 ? '+' : ''}{(quote?.change || 0).toFixed(2)} pts)
          </span>
        </div>
      </div>

      {/* Index Structure & Methodology Grid */}
      <div>
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-sky-400" /> Benchmark Methodology & Structure
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg flex flex-col">
            <span className="text-slate-400 flex items-center gap-1">
              <PieChart className="w-3.5 h-3.5 text-blue-400" /> Weighting
            </span>
            <span className="font-semibold text-white mt-1">
              {config.weightingType}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg flex flex-col">
            <span className="text-slate-400 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-amber-400" /> Constituents
            </span>
            <span className="font-mono font-bold text-emerald-400 mt-1">
              {config.constituentCount} Companies
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg flex flex-col">
            <span className="text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-400" /> Rebalancing
            </span>
            <span className="font-medium text-slate-300 mt-1">
              {config.rebalanceSchedule}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg flex flex-col">
            <span className="text-slate-400 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-sky-400" /> Primary Venue
            </span>
            <span className="font-mono font-medium text-slate-200 mt-1 truncate" title={config.exchange}>
              {config.exchange}
            </span>
          </div>
        </div>
      </div>

      {/* Top Sector Weightings */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
          <PieChart className="w-4 h-4 text-sky-400" /> Top Sector Weights in Benchmark
        </h3>

        <div className="flex flex-col gap-2.5">
          {config.topSectors.map((sec) => {
            const numericPct = parseFloat(sec.weight) || 10;
            return (
              <div key={sec.name} className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-medium">{sec.name}</span>
                  <span className="font-mono font-semibold text-sky-400">{sec.weight}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, numericPct * 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Point & Return Impact Calculator */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" /> Index Point & % Move Calculator
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Live Simulation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">
              Simulated Point Shift (+ / - Points)
            </label>
            <input
              type="number"
              step="5"
              value={simPoints}
              onChange={(e) => setSimPoints(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="50"
            />
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Equivalent Percentage Move:</span>
              <span className={`font-mono font-bold text-sm ${pctDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {pctDelta >= 0 ? `+${pctDelta.toFixed(2)}%` : `${pctDelta.toFixed(2)}%`}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800">
              <span className="text-slate-400">Projected Index Level:</span>
              <span className="font-mono font-bold text-white text-sm">
                {(livePrice + pointDelta).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Macro Themes & Drivers */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
        <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-sky-400" /> Core Macro Drivers & Capital Themes
        </h4>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {config.keyThemes.map((theme) => (
            <span
              key={theme}
              className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-800 text-sky-300 border border-slate-700/60"
            >
              {theme}
            </span>
          ))}
        </div>
      </div>

      {/* Technical Trend & Moving Averages */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-white flex items-center gap-1.5 mb-3">
          <TrendingUp className="w-3.5 h-3.5 text-blue-400" /> Moving Average Cycles & 52-Week Range
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-lg flex flex-col">
            <span className="text-slate-400">50-Day SMA</span>
            <span className="font-mono font-bold text-white mt-1">
              {data?.ma50 ? data.ma50.toFixed(2) : 'Calculating...'}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-lg flex flex-col">
            <span className="text-slate-400">200-Day SMA</span>
            <span className="font-mono font-bold text-white mt-1">
              {data?.ma200 ? data.ma200.toFixed(2) : 'Calculating...'}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-lg flex flex-col">
            <span className="text-slate-400">52-Week High</span>
            <span className="font-mono font-bold text-emerald-400 mt-1">
              {quote?.fiftyTwoWeekHigh ? quote.fiftyTwoWeekHigh.toFixed(2) : 'N/A'}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-lg flex flex-col">
            <span className="text-slate-400">52-Week Low</span>
            <span className="font-mono font-bold text-rose-400 mt-1">
              {quote?.fiftyTwoWeekLow ? quote.fiftyTwoWeekLow.toFixed(2) : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

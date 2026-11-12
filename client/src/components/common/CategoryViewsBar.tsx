import React from 'react';
import { GroupByOption, SizeMetric, ColorMetric, TimeframeType } from '../../types';
import { Layers, PieChart, Sliders } from 'lucide-react';

interface CategoryViewsBarProps {
  market: 'us' | 'in' | 'crypto' | 'forex';
  groupBy: GroupByOption;
  onGroupByChange: (val: GroupByOption) => void;
  sizeMetric: SizeMetric;
  onSizeMetricChange: (val: SizeMetric) => void;
  colorMetric: ColorMetric;
  onColorMetricChange: (val: ColorMetric) => void;
  timeframe: TimeframeType;
  onTimeframeChange: (val: TimeframeType) => void;
  selectedSector: string;
  onSectorChange: (val: string) => void;
  selectedIndex: string;
  onIndexChange: (val: string) => void;
  selectedCapBucket: string;
  onCapBucketChange: (val: string) => void;
  selectedPreset: string;
  onPresetChange: (val: string) => void;
}

export const CategoryViewsBar: React.FC<CategoryViewsBarProps> = ({
  market,
  groupBy,
  onGroupByChange,
  sizeMetric,
  onSizeMetricChange,
  colorMetric,
  onColorMetricChange,
  timeframe,
  onTimeframeChange,
  selectedSector,
  onSectorChange,
  selectedIndex,
  onIndexChange,
  selectedCapBucket,
  onCapBucketChange,
  selectedPreset,
  onPresetChange,
}) => {
  const isIndia = market === 'in';
  const isCrypto = market === 'crypto';
  const isForex = market === 'forex';

  const indices = isCrypto
    ? ['All', 'Top 10', 'Top 20', 'Layer 1', 'DeFi', 'Meme Coins', 'AI Cryptos', 'Layer 2']
    : isForex
      ? ['All', 'Majors', 'Minors', 'Emerging Markets', 'G10 Currencies', 'Yen Crosses', 'Asia FX']
      : isIndia
        ? [
            'All',
            'Nifty 50',
            'Next 50',
            'Midcap 150',
            'Smallcap 250',
            'Bank Nifty',
            'Nifty IT',
            'Nifty Pharma',
            'Nifty Auto',
            'Nifty FMCG',
            'Nifty Metal',
            'Nifty Realty',
            'Nifty Energy',
          ]
        : ['All', 'S&P 500', 'Nasdaq-100', 'Dow 30', 'Popular ETFs'];

  const sectors = isCrypto
    ? [
        'All',
        'Layer 1 / Store of Value',
        'Layer 1 / Smart Contracts',
        'Layer 1 / High Performance',
        'DeFi & Oracles',
        'Meme Coins',
        'AI & Decentralized Compute',
        'Layer 2 & Scaling',
        'Payment & Remittance',
        'Enterprise Infrastructure',
        'Metaverse & Gaming',
      ]
    : isForex
      ? ['All', 'Major Currencies', 'Minor Crosses', 'Emerging & Exotics']
      : isIndia
        ? [
            'All',
            'Financial Services',
            'IT',
            'Oil Gas & Energy',
            'Auto',
            'FMCG',
            'Healthcare',
            'Metals & Mining',
            'Capital Goods',
            'Realty',
            'Telecom',
            'Power',
            'Consumer Durables',
            'Chemicals',
          ]
        : [
            'All',
            'Technology',
            'Communication Services',
            'Consumer Discretionary',
            'Financials',
            'Healthcare',
            'Industrials',
            'Consumer Staples',
            'Energy',
            'Utilities',
            'Real Estate',
            'Basic Materials',
            'ETFs',
          ];

  const presets = isCrypto
    ? [
        { id: '', label: 'All Cryptos' },
        { id: 'gainers', label: '🔥 Top Gainers' },
        { id: 'losers', label: '❄️ Top Losers' },
        { id: 'active', label: '⚡ Highest Volume' },
        { id: 'near-52w-high', label: '🏔️ Near 52W High' },
        { id: 'mega-caps', label: '👑 Mega Caps' },
      ]
    : isForex
      ? [
          { id: '', label: 'All Pairs' },
          { id: 'gainers', label: '🔥 Strongest Currency' },
          { id: 'losers', label: '❄️ Weakest Currency' },
        ]
      : [
          { id: '', label: 'All Stocks' },
          { id: 'gainers', label: '🔥 Top Gainers' },
          { id: 'losers', label: '❄️ Top Losers' },
          { id: 'active', label: '⚡ Most Active' },
          { id: 'near-52w-high', label: '🏔️ Near 52W High' },
          { id: '52w-low', label: '📉 52W Lows' },
          { id: 'high-dividend', label: '💰 High Dividend' },
          { id: 'value', label: '💎 Low P/E (Value)' },
          { id: 'growth', label: '🚀 High Growth' },
        ];

  return (
    <div className="w-full bg-slate-900/60 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Category Grouping & Views */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-slate-400 font-medium flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-blue-400" /> Group:
        </span>
        <div className="inline-flex rounded-lg bg-slate-800/80 p-0.5 border border-slate-700/60">
          {(['sector', 'industry', 'index', 'capbucket'] as GroupByOption[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onGroupByChange(mode)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition capitalize ${
                groupBy === mode
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode === 'capbucket' ? 'Market Cap' : mode === 'sector' && isCrypto ? 'Category' : mode}
            </button>
          ))}
        </div>

        {/* Sector Selector Dropdown */}
        <div className="flex items-center gap-1.5 ml-2">
          <span className="text-slate-400">{isCrypto ? 'Category:' : 'Sector:'}</span>
          <select
            value={selectedSector}
            onChange={(e) => onSectorChange(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
          >
            {sectors.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>

        {/* Index Selector Dropdown */}
        <div className="flex items-center gap-1.5 ml-1">
          <span className="text-slate-400">{isCrypto ? 'Ecosystem:' : 'Index:'}</span>
          <select
            value={selectedIndex}
            onChange={(e) => onIndexChange(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
          >
            {indices.map((idx) => (
              <option key={idx} value={idx}>
                {idx}
              </option>
            ))}
          </select>
        </div>

        {/* Cap Bucket Filter (hide for forex) */}
        {!isForex && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Cap:</span>
            <select
              value={selectedCapBucket}
              onChange={(e) => onCapBucketChange(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="All">All Caps</option>
              <option value="Mega">Mega Cap</option>
              <option value="Large">Large Cap</option>
              <option value="Mid">Mid Cap</option>
              <option value="Small">Small Cap</option>
            </select>
          </div>
        )}

        {/* Presets Dropdown */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Preset:</span>
          <select
            value={selectedPreset}
            onChange={(e) => onPresetChange(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-amber-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none font-medium"
          >
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metric Selectors (Size & Color) */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Tile Size Metric */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 flex items-center gap-1">
            <PieChart className="w-3.5 h-3.5 text-slate-400" /> Size:
          </span>
          <select
            value={sizeMetric}
            onChange={(e) => onSizeMetricChange(e.target.value as SizeMetric)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
          >
            <option value="marketcap">Market Cap</option>
            <option value="volume">Trading Volume</option>
            <option value="equal">Equal Size</option>
          </select>
        </div>

        {/* Tile Color Metric */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-slate-400" /> Color:
          </span>
          <select
            value={colorMetric}
            onChange={(e) => onColorMetricChange(e.target.value as ColorMetric)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
          >
            <option value="change">% Change ({timeframe.toUpperCase()})</option>
            <option value="volume">Volume vs Avg</option>
            {!isCrypto && !isForex && <option value="pe">P/E Ratio</option>}
            <option value="dist52whigh">Distance from 52W High</option>
          </select>
        </div>

        {/* Timeframe selector (1D, 1W, 1M, 3M, 6M, YTD, 1Y) */}
        {colorMetric === 'change' && (
          <div className="inline-flex rounded-lg bg-slate-800/80 p-0.5 border border-slate-700/60">
            {(['1d', '1w', '1m', '3m', '6m', 'ytd', '1y'] as TimeframeType[]).map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase transition ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

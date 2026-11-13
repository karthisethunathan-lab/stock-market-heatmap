import React, { useState } from 'react';
import { GroupByOption, SizeMetric, ColorMetric, TimeframeType, HeatmapViewMode } from '../../types';
import { Layers, PieChart, Sliders, ChevronDown, ChevronUp, Filter, LayoutList, LayoutGrid } from 'lucide-react';

interface CategoryViewsBarProps {
  market: 'global' | 'us' | 'in' | 'crypto' | 'forex' | 'commodities';
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
  viewMode?: HeatmapViewMode;
  onViewModeChange?: (mode: HeatmapViewMode) => void;
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
  viewMode = 'stacked',
  onViewModeChange,
}) => {
  const isIndia = market === 'in';
  const isCrypto = market === 'crypto';
  const isForex = market === 'forex';
  const isCommodities = market === 'commodities';
  const isGlobal = market === 'global';

  const indices = isGlobal
    ? ['All', 'Americas', 'Europe', 'Asia-Pacific', 'Macro Benchmarks']
    : isCommodities
    ? ['All', 'Precious Metals', 'Energy', 'Industrial Metals', 'Agriculture', 'Livestock']
    : isCrypto
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

  const sectors = isGlobal
    ? ['All', 'Americas', 'Europe', 'Asia-Pacific', 'Macro & Volatility']
    : isCommodities
    ? [
        'All',
        'Precious Metals',
        'Energy',
        'Industrial Metals',
        'Agriculture & Grains',
        'Soft Commodities',
        'Livestock & Meat',
      ]
    : isCrypto
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

  const presets = isGlobal
    ? [
        { id: '', label: 'All Global Indices' },
        { id: 'gainers', label: '🔥 Top Gainers' },
        { id: 'losers', label: '❄️ Top Losers' },
        { id: 'americas', label: '🌎 Americas' },
        { id: 'europe', label: '🌍 Europe' },
        { id: 'asia', label: '🌏 Asia-Pacific' },
        { id: 'near-52w-high', label: '🏔️ Near 52W High' },
      ]
    : isCommodities
    ? [
        { id: '', label: 'All Commodities' },
        { id: 'gainers', label: '🔥 Top Gainers' },
        { id: 'losers', label: '❄️ Top Losers' },
        { id: 'active', label: '⚡ Highest Volume' },
        { id: 'energy', label: '🛢️ Energy Complex' },
        { id: 'metals', label: '🪙 Metals Complex' },
        { id: 'near-52w-high', label: '🏔️ Near 52W High' },
      ]
    : isCrypto
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

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const activeFilterCount =
    (selectedSector !== 'All' ? 1 : 0) +
    (selectedIndex !== 'All' ? 1 : 0) +
    (selectedCapBucket !== 'All' ? 1 : 0) +
    (selectedPreset ? 1 : 0);

  return (
    <div className="w-full bg-slate-900/60 border-b border-slate-800 text-xs">
      {/* Mobile Top Bar (Clean 1-row view) */}
      <div className="md:hidden flex items-center justify-between px-3 py-2 gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
              mobileFilterOpen || activeFilterCount > 0
                ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500 text-white font-mono">
                {activeFilterCount}
              </span>
            )}
            {mobileFilterOpen ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          {/* Quick View Mode Toggle on Mobile */}
          {onViewModeChange && (
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
              <button
                onClick={() => onViewModeChange('stacked')}
                className={`p-1.5 rounded transition ${
                  viewMode === 'stacked' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Sector Feed (Stacked)"
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onViewModeChange('unified')}
                className={`p-1.5 rounded transition ${
                  viewMode === 'unified' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Unified Treemap"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Timeframe quick buttons on mobile */}
        {colorMetric === 'change' && (
          <div className="inline-flex rounded-lg bg-slate-800/80 p-0.5 border border-slate-700/60">
            {(['1d', '1w', '1m', '1y'] as TimeframeType[]).map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase transition ${
                  timeframe === tf ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Collapsible Drawer */}
      {mobileFilterOpen && (
        <div className="md:hidden p-3 bg-slate-950/90 border-t border-slate-800 flex flex-col gap-2.5 animate-in slide-in-from-top-2 duration-150">
          {/* View Mode in Drawer */}
          {onViewModeChange && (
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                View Layout
              </span>
              <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
                <button
                  onClick={() => onViewModeChange('stacked')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 ${
                    viewMode === 'stacked' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
                  }`}
                >
                  <LayoutList className="w-3 h-3" /> Sector Feed
                </button>
                <button
                  onClick={() => onViewModeChange('unified')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 ${
                    viewMode === 'unified' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
                  }`}
                >
                  <LayoutGrid className="w-3 h-3" /> Unified Map
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-400" /> Grouping Mode
            </span>
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
              {(['sector', 'industry', 'index', 'capbucket'] as GroupByOption[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onGroupByChange(mode)}
                  className={`px-2 py-0.5 rounded text-[11px] capitalize ${
                    groupBy === mode ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
                  }`}
                >
                  {mode === 'capbucket' ? 'Cap' : mode}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">{isGlobal ? 'Region:' : isCrypto ? 'Category:' : 'Sector:'}</label>
              <select
                value={selectedSector}
                onChange={(e) => onSectorChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs"
              >
                {sectors.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">{isCrypto ? 'Ecosystem:' : 'Index:'}</label>
              <select
                value={selectedIndex}
                onChange={(e) => onIndexChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs"
              >
                {indices.map((idx) => (
                  <option key={idx} value={idx}>{idx}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Preset Screen:</label>
              <select
                value={selectedPreset}
                onChange={(e) => onPresetChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-amber-300 font-semibold rounded px-2 py-1 text-xs"
              >
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Tile Size Metric:</label>
              <select
                value={sizeMetric}
                onChange={(e) => onSizeMetricChange(e.target.value as SizeMetric)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs"
              >
                <option value="marketcap">Market Cap (Balanced)</option>
                <option value="volume">Trading Volume</option>
                <option value="equal">Equal Size</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Toolbar: Smooth Single-Row Layout */}
      <div className="hidden md:flex px-4 py-2.5 flex-wrap items-center justify-between gap-3">
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
            <span className="text-slate-400">{isGlobal ? 'Region:' : isCrypto ? 'Category:' : 'Sector:'}</span>
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

          {/* Cap Bucket Filter (hide for forex, commodities & global) */}
          {!isForex && !isCommodities && !isGlobal && (
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
              <option value="marketcap">Market Cap (Balanced)</option>
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
              {!isCrypto && !isForex && !isCommodities && !isGlobal && <option value="pe">P/E Ratio</option>}
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

          {/* View Mode Toggle (Sector Feed vs Unified Map) */}
          {onViewModeChange && (
            <div className="inline-flex rounded-lg bg-slate-800/90 p-0.5 border border-slate-700/60">
              <button
                onClick={() => onViewModeChange('stacked')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  viewMode === 'stacked'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Sector-by-sector stacked feed (Financials at top, best readability)"
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>Sector Feed</span>
              </button>
              <button
                onClick={() => onViewModeChange('unified')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  viewMode === 'unified'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Unified all-in-one treemap"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Unified Map</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

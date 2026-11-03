import React from 'react';
import { MarketType, TimeframeType } from '../../types';
import { Play, Pause, RefreshCw, Search, Filter, ShieldCheck, Clock } from 'lucide-react';

interface HeatmapControlsProps {
  market: MarketType;
  onMarketChange: (market: MarketType) => void;
  timeframe: TimeframeType;
  onTimeframeChange: (tf: TimeframeType) => void;
  sectorFilter: string;
  onSectorFilterChange: (sector: string) => void;
  sectorsList: string[];
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  refreshCountdown: number;
  onRefreshNow: () => void;
  dataSource?: string;
  lastUpdated?: string;
}

export const HeatmapControls: React.FC<HeatmapControlsProps> = ({
  market,
  onMarketChange,
  timeframe,
  onTimeframeChange,
  sectorFilter,
  onSectorFilterChange,
  sectorsList,
  searchQuery,
  onSearchQueryChange,
  autoRefresh,
  onToggleAutoRefresh,
  refreshCountdown,
  onRefreshNow,
  dataSource = 'yahoo',
  lastUpdated,
}) => {
  return (
    <div className="flex flex-col gap-3 p-4 bg-[#0d121f] rounded-xl border border-slate-800">
      
      {/* Top Row: Market toggles & Timeframe toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Market Toggle: US | India | Watchlist */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs font-medium">
          <button
            onClick={() => onMarketChange('us')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              market === 'us'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold shadow border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🇺🇸 US (S&P 100)
          </button>
          <button
            onClick={() => onMarketChange('in')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              market === 'in'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold shadow border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🇮🇳 India (NIFTY 50)
          </button>
          <button
            onClick={() => onMarketChange('watchlist')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              market === 'watchlist'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold shadow border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ★ Watchlist
          </button>
        </div>

        {/* Timeframe Toggle: 1D | 1W | 1M | YTD */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          {(['1d', '1w', '1m', 'ytd'] as TimeframeType[]).map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-2.5 py-1 rounded-md uppercase font-semibold transition-all ${
                timeframe === tf
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Auto-refresh & Data status */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Refresh:</span>
            <span className="text-emerald-400 font-bold w-4 text-center">
              {autoRefresh ? refreshCountdown : '--'}
            </span>
            <button
              onClick={onToggleAutoRefresh}
              title={autoRefresh ? 'Pause auto-refresh' : 'Resume auto-refresh'}
              className="p-1 hover:text-white transition-colors ml-1"
            >
              {autoRefresh ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-400" />}
            </button>
            <button
              onClick={onRefreshNow}
              title="Refresh now"
              className="p-1 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3 h-3 hover:rotate-180 transition-transform duration-300" />
            </button>
          </div>

          {/* Data Source badge */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="capitalize">{dataSource}</span>
            <span className="text-[10px] text-slate-500 font-mono">
              {lastUpdated ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Sector filter & Heatmap Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
        
        {/* Sector filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Sector:</span>
          <select
            value={sectorFilter}
            onChange={(e) => onSectorFilterChange(e.target.value)}
            className="bg-slate-900 text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500/60 font-sans cursor-pointer"
          >
            {sectorsList.map((sec) => (
              <option key={sec} value={sec}>
                {sec === 'all' ? 'All Sectors' : sec}
              </option>
            ))}
          </select>
        </div>

        {/* In-Heatmap Filter Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Filter heatmap stocks..."
            className="w-full bg-slate-900 text-slate-200 placeholder-slate-500 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs focus:outline-none focus:border-emerald-500/60"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchQueryChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

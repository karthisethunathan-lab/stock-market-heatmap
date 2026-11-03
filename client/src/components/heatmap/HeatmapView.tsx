import React, { useMemo } from 'react';
import { useHeatmap } from '../../hooks/useHeatmap';
import { useApp } from '../../context/ThemeContext';
import { TreemapD3 } from './TreemapD3';
import { HeatmapControls } from './HeatmapControls';
import { Skeleton } from '../common/Skeleton';
import { AlertTriangle, RefreshCw, BookmarkPlus } from 'lucide-react';

export const HeatmapView: React.FC = () => {
  const { openStock, colorMode, watchlist } = useApp();
  const {
    market,
    setMarket,
    timeframe,
    setTimeframe,
    sectorFilter,
    setSectorFilter,
    searchQuery,
    setSearchQuery,
    sectors,
    allSectorsList,
    loading,
    error,
    dataSource,
    lastUpdated,
    autoRefresh,
    toggleAutoRefresh,
    refreshCountdown,
    refreshNow,
  } = useHeatmap();

  // Compute market advance / decline statistics
  const marketStats = useMemo(() => {
    let advances = 0;
    let declines = 0;
    let unchanged = 0;
    let totalCap = 0;

    sectors.forEach((sec) => {
      sec.stocks.forEach((st) => {
        totalCap += st.marketCap;
        if (st.changePercent > 0.05) advances++;
        else if (st.changePercent < -0.05) declines++;
        else unchanged++;
      });
    });

    return { advances, declines, unchanged, totalStocks: advances + declines + unchanged, totalCap };
  }, [sectors]);

  return (
    <div className="flex flex-col gap-4 w-full">
      
      {/* Controls Bar */}
      <HeatmapControls
        market={market}
        onMarketChange={setMarket}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        sectorFilter={sectorFilter}
        onSectorFilterChange={setSectorFilter}
        sectorsList={allSectorsList}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={toggleAutoRefresh}
        refreshCountdown={refreshCountdown}
        onRefreshNow={refreshNow}
        dataSource={dataSource}
        lastUpdated={lastUpdated}
      />

      {/* Market Breadth & Advance/Decline Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 bg-slate-900/60 border border-slate-800/80 rounded-lg text-xs font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
            <span className="text-slate-400">Advances:</span>
            <span className="font-bold text-emerald-400">{marketStats.advances}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
            <span className="text-slate-400">Declines:</span>
            <span className="font-bold text-rose-400">{marketStats.declines}</span>
          </div>
          <div className="flex items-center gap-1.5 hidden sm:flex">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-600"></span>
            <span className="text-slate-400">Unchanged:</span>
            <span className="font-bold text-slate-300">{marketStats.unchanged}</span>
          </div>
        </div>

        <div className="text-slate-400 text-[11px]">
          Showing <span className="text-slate-200 font-bold">{marketStats.totalStocks}</span> tickers • Tile size = Market Cap
        </div>
      </div>

      {/* Main Heatmap Area */}
      {loading && sectors.length === 0 ? (
        <div className="w-full h-[650px] rounded-xl border border-slate-800 p-4 flex flex-col gap-3">
          <Skeleton className="w-full h-8" />
          <div className="grid grid-cols-4 gap-3 h-full">
            <Skeleton className="col-span-2 row-span-2 h-full" />
            <Skeleton className="col-span-1 h-full" />
            <Skeleton className="col-span-1 h-full" />
            <Skeleton className="col-span-1 h-full" />
            <Skeleton className="col-span-1 h-full" />
          </div>
        </div>
      ) : error && sectors.length === 0 ? (
        <div className="w-full h-[500px] rounded-xl border border-rose-900/40 bg-rose-950/10 flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-rose-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-100 mb-1">Failed to Load Heatmap</h3>
          <p className="text-sm text-slate-400 max-w-md mb-4">{error}</p>
          <button
            onClick={refreshNow}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      ) : market === 'watchlist' && watchlist.length === 0 ? (
        <div className="w-full h-[500px] rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col items-center justify-center p-6 text-center">
          <BookmarkPlus className="w-12 h-12 text-slate-500 mb-3" />
          <h3 className="text-lg font-bold text-slate-200 mb-1">Your Watchlist is Empty</h3>
          <p className="text-sm text-slate-400 max-w-md mb-4">
            Click on any stock tile or search for symbols to add them to your watchlist and track your favorite companies in one custom heatmap.
          </p>
          <button
            onClick={() => setMarket('us')}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-sm font-semibold transition-colors"
          >
            Explore US Market Heatmap
          </button>
        </div>
      ) : (
        <TreemapD3
          sectors={sectors}
          onSelectStock={openStock}
          colorMode={colorMode}
        />
      )}
    </div>
  );
};

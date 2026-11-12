import React, { useMemo } from 'react';
import { useHeatmap } from '../../hooks/useHeatmap';
import { useApp } from '../../context/ThemeContext';
import { TreemapD3 } from './TreemapD3';
import { CategoryViewsBar } from '../common/CategoryViewsBar';
import { SectorPerformanceBar } from './SectorPerformanceBar';
import { GainersLosersPanel } from './GainersLosersPanel';
import { Skeleton } from '../common/Skeleton';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface HeatmapViewProps {
  market: 'global' | 'us' | 'in' | 'crypto' | 'forex' | 'commodities';
}

export const HeatmapView: React.FC<HeatmapViewProps> = ({ market }) => {
  const { openStock, colorMode } = useApp();
  const {
    timeframe,
    setTimeframe,
    groupBy,
    setGroupBy,
    sizeMetric,
    setSizeMetric,
    colorMetric,
    setColorMetric,
    selectedSector,
    setSelectedSector,
    selectedIndex,
    setSelectedIndex,
    selectedCapBucket,
    setSelectedCapBucket,
    selectedPreset,
    setSelectedPreset,
    sectors,
    allStocks,
    loading,
    error,
    refreshNow,
    refreshCountdown,
    marketStatus,
    priceFlashes,
  } = useHeatmap(market);

  // Compute market breadth (Advances / Declines)
  const marketStats = useMemo(() => {
    let advances = 0;
    let declines = 0;
    let unchanged = 0;

    allStocks.forEach((st) => {
      const chg = st.changePercent ?? 0;
      if (chg > 0.05) advances++;
      else if (chg < -0.05) declines++;
      else unchanged++;
    });

    return {
      advances,
      declines,
      unchanged,
      totalStocks: allStocks.length,
    };
  }, [allStocks]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Category Views Chip Bar */}
      <CategoryViewsBar
        market={market}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        sizeMetric={sizeMetric}
        onSizeMetricChange={setSizeMetric}
        colorMetric={colorMetric}
        onColorMetricChange={setColorMetric}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        selectedSector={selectedSector}
        onSectorChange={setSelectedSector}
        selectedIndex={selectedIndex}
        onIndexChange={setSelectedIndex}
        selectedCapBucket={selectedCapBucket}
        onCapBucketChange={setSelectedCapBucket}
        selectedPreset={selectedPreset}
        onPresetChange={setSelectedPreset}
      />

      {/* Market Breadth & Advance/Decline Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shadow-sm" />
            <span className="text-slate-400">Advances:</span>
            <span className="font-bold text-emerald-400">{marketStats.advances}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shadow-sm" />
            <span className="text-slate-400">Declines:</span>
            <span className="font-bold text-rose-400">{marketStats.declines}</span>
          </div>
          <div className="flex items-center gap-1.5 hidden sm:flex">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-600" />
            <span className="text-slate-400">Unchanged:</span>
            <span className="font-bold text-slate-300">{marketStats.unchanged}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-400 text-[11px]">
          {/* Live Market Badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700/60">
            <span
              className={`w-2 h-2 rounded-full ${
                marketStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className={marketStatus.isOpen ? 'text-emerald-300 font-semibold' : 'text-amber-300'}>
              {marketStatus.isOpen ? 'Live Market' : 'Market Closed'}
            </span>
            <span className="text-slate-500 text-[10px]">({marketStatus.desc})</span>
          </div>

          {error && sectors.length > 0 && (
            <span className="text-amber-400 text-[11px] font-medium flex items-center gap-1" title={error}>
              ⚠️ Feed error (showing cached data)
            </span>
          )}

          <span>
            Universe: <strong className="text-slate-200">{marketStats.totalStocks}</strong> tiles
          </span>
          <span className="hidden sm:inline">
            Update: <strong className="text-slate-200">{refreshCountdown}s</strong>
          </span>
          <button
            onClick={refreshNow}
            title="Refresh Quotes"
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Full-Width Treemap Container */}
      <div className="w-full">
        {loading && sectors.length === 0 ? (
          <div className="w-full h-[700px] rounded-xl border border-slate-800 p-4 flex flex-col gap-3">
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
          <div className="w-full h-[550px] rounded-xl border border-rose-900/40 bg-rose-950/10 flex flex-col items-center justify-center p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-rose-400 mb-3" />
            <h3 className="text-lg font-bold text-slate-100 mb-1">Failed to Load Heatmap</h3>
            <p className="text-sm text-slate-400 max-w-md mb-4">{error}</p>
            <button
              onClick={refreshNow}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        ) : (
          <TreemapD3
            sectors={sectors}
            onSelectStock={openStock}
            colorMode={colorMode}
            colorMetric={colorMetric}
            priceFlashes={priceFlashes}
          />
        )}
      </div>

      {/* Bottom Analytics Panels: Sector Performance & Top Gainers/Losers side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        <SectorPerformanceBar
          sectors={sectors}
          selectedSector={selectedSector}
          onSelectSector={(sec) => setSelectedSector(selectedSector === sec ? 'All' : sec)}
        />

        <GainersLosersPanel allStocks={allStocks} onSelectStock={openStock} />
      </div>
    </div>
  );
};

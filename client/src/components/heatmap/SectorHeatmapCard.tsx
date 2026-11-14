import React, { useState, useMemo } from 'react';
import { SectorGroup, ColorMode, ColorMetric } from '../../types';
import { TreemapD3 } from './TreemapD3';
import { formatPercent, formatCompactNumber } from '../../lib/utils';
import {
  Landmark,
  Cpu,
  HeartPulse,
  ShoppingBag,
  Factory,
  Radio,
  ShoppingCart,
  Zap,
  Lightbulb,
  Building2,
  Hammer,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Globe2,
  Package,
  Coins,
  DollarSign,
  Wheat,
  Sparkles,
  Layers,
} from 'lucide-react';

interface SectorHeatmapCardProps {
  sector: SectorGroup;
  onSelectStock: (symbol: string) => void;
  onFocusSector?: (sectorName: string) => void;
  onExitFocus?: () => void;
  isFocused?: boolean;
  colorMode: ColorMode;
  colorMetric: ColorMetric;
  priceFlashes?: Record<string, 'up' | 'down'>;
  defaultExpanded?: boolean;
}

// Map sector name to icon with full coverage for Stocks, Crypto, Forex, Commodities & Global
function getSectorIcon(name: string) {
  const lower = name.toLowerCase();
  // Crypto
  if (lower.includes('crypto') || lower.includes('token') || lower.includes('coin') || lower.includes('meme')) return <Coins className="w-4 h-4 text-amber-400" />;
  if (lower.includes('defi') || lower.includes('smart contract') || lower.includes('oracle') || lower.includes('layer')) return <Layers className="w-4 h-4 text-cyan-400" />;
  if (lower.includes('compute') || lower.includes('ai &')) return <Sparkles className="w-4 h-4 text-purple-400" />;
  // Forex
  if (lower.includes('currenc') || lower.includes('forex') || lower.includes('fx') || lower.includes('major') || lower.includes('minor') || lower.includes('exotic')) return <DollarSign className="w-4 h-4 text-emerald-400" />;
  // Commodities
  if (lower.includes('precious metal') || lower.includes('gold') || lower.includes('silver')) return <Coins className="w-4 h-4 text-yellow-400" />;
  if (lower.includes('agricultur') || lower.includes('grain') || lower.includes('soft') || lower.includes('wheat')) return <Wheat className="w-4 h-4 text-lime-400" />;
  if (lower.includes('livestock') || lower.includes('meat')) return <Package className="w-4 h-4 text-amber-500" />;
  // Stocks & Equities
  if (lower.includes('finan') || lower.includes('bank')) return <Landmark className="w-4 h-4 text-emerald-400" />;
  if (lower.includes('tech') || lower.includes('it') || lower.includes('software')) return <Cpu className="w-4 h-4 text-blue-400" />;
  if (lower.includes('health') || lower.includes('pharma') || lower.includes('bio')) return <HeartPulse className="w-4 h-4 text-rose-400" />;
  if (lower.includes('cyclical') || lower.includes('discretionary') || lower.includes('consumer goods') || lower.includes('auto')) return <ShoppingBag className="w-4 h-4 text-purple-400" />;
  if (lower.includes('industr') || lower.includes('capital') || lower.includes('manufacturing')) return <Factory className="w-4 h-4 text-amber-400" />;
  if (lower.includes('comm') || lower.includes('telecom') || lower.includes('media')) return <Radio className="w-4 h-4 text-indigo-400" />;
  if (lower.includes('defensive') || lower.includes('staple') || lower.includes('fmcg')) return <ShoppingCart className="w-4 h-4 text-teal-400" />;
  if (lower.includes('energy') || lower.includes('oil') || lower.includes('gas')) return <Zap className="w-4 h-4 text-orange-400" />;
  if (lower.includes('utilit') || lower.includes('power')) return <Lightbulb className="w-4 h-4 text-yellow-400" />;
  if (lower.includes('estate') || lower.includes('reit')) return <Building2 className="w-4 h-4 text-cyan-400" />;
  if (lower.includes('material') || lower.includes('metal') || lower.includes('mining') || lower.includes('chemical')) return <Hammer className="w-4 h-4 text-stone-400" />;
  if (lower.includes('global') || lower.includes('americas') || lower.includes('europe') || lower.includes('asia')) return <Globe2 className="w-4 h-4 text-sky-400" />;
  return <Package className="w-4 h-4 text-slate-400" />;
}

export const SectorHeatmapCard: React.FC<SectorHeatmapCardProps> = ({
  sector,
  onSelectStock,
  onFocusSector,
  onExitFocus,
  isFocused = false,
  colorMode,
  colorMetric,
  priceFlashes = {},
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [isEnlarged, setIsEnlarged] = useState<boolean>(false);

  // Compute sector aggregate stats
  const stats = useMemo(() => {
    const stocks = sector.stocks || [];
    let totalCap = 0;
    let weightedChangeSum = 0;
    let advances = 0;
    let declines = 0;

    stocks.forEach((s) => {
      const cap = s.marketCap || 1;
      const chg = s.changePercent ?? 0;
      totalCap += cap;
      weightedChangeSum += chg * cap;
      if (chg > 0.05) advances++;
      else if (chg < -0.05) declines++;
    });

    const avgChange = totalCap > 0 ? weightedChangeSum / totalCap : 0;
    return {
      stocksCount: stocks.length,
      totalCap,
      avgChange,
      advances,
      declines,
      isPositive: avgChange >= 0,
    };
  }, [sector]);

  // Dynamic height class based on stock count, or expanded if focused/enlarged
  const heightClass = useMemo(() => {
    if (isFocused || isEnlarged) {
      return 'h-[540px] sm:h-[640px] lg:h-[720px]';
    }
    const count = sector.stocks?.length || 0;
    if (count >= 50) return 'h-[380px] sm:h-[440px] lg:h-[480px]';
    if (count >= 25) return 'h-[320px] sm:h-[360px] lg:h-[400px]';
    if (count >= 12) return 'h-[260px] sm:h-[300px] lg:h-[330px]';
    if (count >= 6) return 'h-[210px] sm:h-[240px] lg:h-[260px]';
    return 'h-[180px] sm:h-[200px] lg:h-[220px]';
  }, [sector.stocks?.length, isFocused, isEnlarged]);

  const handleToggleExpandFocus = () => {
    if (isFocused && onExitFocus) {
      onExitFocus();
    } else if (onFocusSector) {
      onFocusSector(sector.name);
    } else {
      setIsEnlarged((prev) => !prev);
    }
  };

  return (
    <div
      className={`w-full bg-[#080d1a] border rounded-xl overflow-hidden shadow-md transition-all ${
        isFocused
          ? 'border-blue-600/60 ring-1 ring-blue-500/30'
          : 'border-slate-800/90 hover:border-slate-700/80'
      }`}
    >
      {/* Sector Header Bar */}
      <div className="px-3.5 sm:px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        {/* Left: Sector Icon, Name & Stock Count */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-slate-800/90 border border-slate-700/60 shrink-0">
            {getSectorIcon(sector.name)}
          </div>
          <div className="flex items-baseline gap-2 truncate">
            <h3 className="font-semibold text-slate-100 text-sm tracking-tight truncate">
              {sector.name}
            </h3>
            <span className="text-[11px] font-mono text-slate-400 shrink-0">
              {stats.stocksCount} {stats.stocksCount === 1 ? 'stock' : 'stocks'}
            </span>
            {isFocused && (
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold text-[10px] uppercase tracking-wider">
                Expanded View
              </span>
            )}
          </div>
        </div>

        {/* Right: Stats, Performance Pill & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Market Cap (Desktop) */}
          {stats.totalCap > 0 && (
            <span className="hidden md:inline font-mono text-[11px] text-slate-400">
              {formatCompactNumber(stats.totalCap, 'USD')}
            </span>
          )}

          {/* Advances / Declines Pill (Tablet & Desktop) */}
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
            <span className="text-emerald-400 font-bold">{stats.advances}▲</span>
            <span className="text-slate-600">/</span>
            <span className="text-rose-400 font-bold">{stats.declines}▼</span>
          </div>

          {/* Average % Change Badge */}
          <div
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md font-mono font-bold text-xs ${
              stats.isPositive
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
            }`}
          >
            {stats.isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>{formatPercent(stats.avgChange)}</span>
          </div>

          {/* Expand / Minimize Sector Button */}
          <button
            onClick={handleToggleExpandFocus}
            className={`flex items-center gap-1 px-2 py-1 rounded transition text-xs font-medium ${
              isFocused || isEnlarged
                ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
            title={
              isFocused || isEnlarged
                ? 'Exit expanded view (back to all sectors)'
                : `Expand ${sector.name} stocks heatmap into large view`
            }
          >
            {isFocused || isEnlarged ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Minimize</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Expand</span>
              </>
            )}
          </button>

          {/* Collapse/Expand Accordion Toggle */}
          {!isFocused && (
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title={isExpanded ? 'Collapse Sector Heatmap' : 'Expand Sector Heatmap'}
            >
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Sector Treemap Canvas */}
      {isExpanded ? (
        <div className="w-full">
          <TreemapD3
            sectors={[sector]}
            onSelectStock={onSelectStock}
            colorMode={colorMode}
            colorMetric={colorMetric}
            priceFlashes={priceFlashes}
            heightClass={heightClass}
            hideToolbar={!(isFocused || isEnlarged)}
            hideSectorHeader={true}
          />
        </div>
      ) : (
        <div
          onClick={() => setIsExpanded(true)}
          className="px-4 py-3 bg-[#070b14] text-center text-xs text-slate-400 hover:text-slate-200 cursor-pointer flex items-center justify-center gap-2 transition"
        >
          <span>Heatmap collapsed. Click to expand {sector.name} ({stats.stocksCount} stocks)</span>
          <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
        </div>
      )}
    </div>
  );
};

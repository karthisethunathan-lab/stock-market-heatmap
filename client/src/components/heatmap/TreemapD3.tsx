import React, { useRef, useState, useEffect, useMemo } from 'react';
import * as d3 from 'd3-hierarchy';
import { SectorGroup, StockTile, ColorMode, ColorMetric } from '../../types';
import { getTreemapColor, formatCurrency, formatPercent } from '../../lib/utils';
import { TileTooltip } from './TileTooltip';
import { Maximize2, Minimize2, Camera, ChevronRight, Home } from 'lucide-react';
import { toPng } from 'html-to-image';

interface TreemapD3Props {
  sectors: SectorGroup[];
  onSelectStock: (symbol: string) => void;
  colorMode?: ColorMode;
  colorMetric?: ColorMetric;
  priceFlashes?: Record<string, 'up' | 'down'>;
  heightClass?: string;
  hideToolbar?: boolean;
  hideSectorHeader?: boolean;
}

interface HierarchyLeaf {
  data: StockTile;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  parent?: d3.HierarchyNode<any>;
}

interface SectorNode {
  name: string;
  marketCap: number;
  stocksCount: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export const TreemapD3: React.FC<TreemapD3Props> = ({
  sectors,
  onSelectStock,
  colorMode = 'standard',
  colorMetric = 'change',
  priceFlashes = {},
  heightClass = 'h-[520px] sm:h-[620px] lg:h-[720px]',
  hideToolbar = false,
  hideSectorHeader = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapElementRef = useRef<HTMLDivElement>(null);

  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 1200,
    height: 720,
  });

  const [hoveredStock, setHoveredStock] = useState<StockTile | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [zoomedSector, setZoomedSector] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // ResizeObserver for responsive auto-sizing
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        if (width > 200 && height > 200) {
          setDimensions({
            width: Math.floor(width),
            height: Math.floor(height),
          });
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isFullscreen]);

  // Handle Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Export as PNG image
  const handleExportPNG = async () => {
    if (!mapElementRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(mapElementRef.current, {
        cacheBust: true,
        backgroundColor: '#090d16',
      });
      const link = document.createElement('a');
      link.download = `stock-market-heatmap-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export PNG:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Filter sectors if zoomed into a single sector
  const activeSectors = useMemo(() => {
    if (!sectors) return [];
    if (!zoomedSector) return sectors;
    return sectors.filter((s) => s.name === zoomedSector);
  }, [sectors, zoomedSector]);

  // Compute D3 Treemap layout with squarify
  const { leaves, sectorHeaders } = useMemo(() => {
    if (!activeSectors || activeSectors.length === 0) {
      return { leaves: [], sectorHeaders: [] };
    }

    const rootData = {
      name: zoomedSector || 'Market',
      children: activeSectors.map((sec) => ({
        name: sec.name,
        children: sec.stocks,
      })),
    };

    const root = d3
      .hierarchy<any>(rootData)
      .sum((d: any) => {
        const raw = d.tileValue && d.tileValue > 0 ? d.tileValue : d.marketCap && d.marketCap > 0 ? d.marketCap : 1;
        // Sublinear power-damped scaling (0.58) so mid and small caps receive sufficient area to be visible and readable
        return raw > 1e4 ? Math.pow(raw, 0.58) : raw;
      })
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const headerOffset = hideToolbar ? 0 : zoomedSector ? 40 : 45;
    const treemapLayout = d3
      .treemap<any>()
      .size([dimensions.width, Math.max(120, dimensions.height - headerOffset)])
      .tile(d3.treemapSquarify.ratio(1.3))
      .paddingTop(hideSectorHeader ? 2 : 22)
      .paddingInner(2)
      .paddingOuter(3)
      .round(true);

    treemapLayout(root);

    const sectorHeaders: SectorNode[] = [];
    if (root.children) {
      root.children.forEach((node) => {
        const secNode = node as d3.HierarchyRectangularNode<any>;
        if (secNode.x1 - secNode.x0 > 35 && secNode.y1 - secNode.y0 > 24) {
          sectorHeaders.push({
            name: secNode.data.name,
            marketCap: secNode.value || 0,
            stocksCount: secNode.data.children?.length || 0,
            x0: secNode.x0,
            y0: secNode.y0,
            x1: secNode.x1,
            y1: secNode.y1,
          });
        }
      });
    }

    const leaves: HierarchyLeaf[] = root.leaves().map((leaf: any) => ({
      data: leaf.data as StockTile,
      x0: leaf.x0,
      y0: leaf.y0,
      x1: leaf.x1,
      y1: leaf.y1,
      parent: leaf.parent,
    }));

    return { leaves, sectorHeaders };
  }, [activeSectors, dimensions, zoomedSector]);

  const handleMouseMove = (e: React.MouseEvent, stock: StockTile) => {
    setHoveredStock(stock);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredStock(null);
    setMousePos(null);
  };

  // Determine display metric on tile based on colorMetric
  const getTileMetricLabel = (stock: StockTile) => {
    if (colorMetric === 'pe') {
      return stock.pe ? `P/E ${stock.pe}` : 'N/A';
    }
    if (colorMetric === 'dist52whigh') {
      return stock.dist52wHigh !== undefined ? `${stock.dist52wHigh > 0 ? '+' : ''}${stock.dist52wHigh}%` : '52W High';
    }
    if (colorMetric === 'volume') {
      const volChange = stock.colorValue ?? 0;
      return `${volChange > 0 ? '+' : ''}${volChange}% Vol`;
    }
    return formatPercent(stock.changePercent);
  };

  const getTileMetricColor = (stock: StockTile) => {
    if (colorMetric === 'pe') {
      // Color lower P/E green, higher red
      const pe = stock.pe || 25;
      if (pe < 15) return '#059669';
      if (pe < 25) return '#10b981';
      if (pe < 40) return '#f59e0b';
      return '#dc2626';
    }
    if (colorMetric === 'dist52whigh') {
      const d = stock.dist52wHigh ?? -10;
      if (d >= -3) return '#047857';
      if (d >= -10) return '#10b981';
      if (d >= -20) return '#ea580c';
      return '#dc2626';
    }
    return getTreemapColor(stock.colorValue ?? stock.changePercent, colorMode);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${
        isFullscreen ? 'h-screen p-4' : heightClass
      } bg-[#080d1a] rounded-xl border border-slate-800/80 overflow-hidden select-none flex flex-col`}
    >
      {/* Top Header Strip with Zoom Breadcrumbs & Action Controls */}
      {!hideToolbar && (
        <div className="h-10 px-3 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between text-xs z-20 gap-2">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1 font-medium truncate min-w-0">
            <button
              onClick={() => setZoomedSector(null)}
              className={`flex items-center gap-1 px-2 py-1 rounded transition shrink-0 ${
                !zoomedSector
                  ? 'bg-blue-600/30 text-blue-400 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Home className="w-3.5 h-3.5" /> <span className="hidden sm:inline">All Sectors</span>
            </button>

            {zoomedSector && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-semibold truncate text-[11px] sm:text-xs">
                  {zoomedSector}
                </span>
                <button
                  onClick={() => setZoomedSector(null)}
                  className="text-[11px] text-blue-400 hover:underline ml-1 shrink-0 hidden sm:inline"
                >
                  (Zoom Out)
                </button>
              </>
            )}
          </div>

          {/* Action Controls: Export PNG & Fullscreen */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleExportPNG}
              disabled={isExporting}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition disabled:opacity-50 text-[11px] sm:text-xs"
              title="Export heatmap as PNG image"
            >
              <Camera className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{isExporting ? 'Saving...' : 'Export PNG'}</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-[11px] sm:text-xs"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Heatmap'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Treemap Area */}
      <div ref={mapElementRef} className="relative flex-1 w-full overflow-hidden bg-[#070b14]">
        {/* Sector Category Headers (Clickable to Zoom) */}
        {!hideSectorHeader &&
          sectorHeaders.map((sec) => {
            const secWidth = sec.x1 - sec.x0;
            return (
              <div
                key={sec.name}
                style={{
                  left: `${sec.x0 + 4}px`,
                  top: `${sec.y0 + 2}px`,
                  maxWidth: `${secWidth - 8}px`,
                }}
                onClick={() => setZoomedSector(zoomedSector === sec.name ? null : sec.name)}
                className="absolute z-10 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-300 hover:text-blue-400 bg-slate-900/70 hover:bg-slate-800 px-1.5 py-0.5 rounded cursor-pointer truncate transition flex items-center gap-1"
                title={`Click to zoom into ${sec.name} (${sec.stocksCount} stocks)`}
              >
                <span>{sec.name}</span>
                <span className="text-[10px] text-slate-500">({sec.stocksCount})</span>
              </div>
            );
          })}

        {/* Stock Tiles */}
        {leaves.map((leaf) => {
          const tileWidth = Math.max(0, leaf.x1 - leaf.x0);
          const tileHeight = Math.max(0, leaf.y1 - leaf.y0);
          const stock = leaf.data;
          const color = getTileMetricColor(stock);
          const flash = priceFlashes[stock.symbol];

          const showSymbol = tileWidth >= 22 && tileHeight >= 14;
          const showChange = tileWidth >= 32 && tileHeight >= 22;
          const showPrice = tileWidth >= 52 && tileHeight >= 36;
          const showFullName = tileWidth >= 95 && tileHeight >= 55;

          const flashClass = flash === 'up'
            ? 'ring-2 ring-emerald-400 brightness-130 scale-[1.02] z-30 shadow-lg shadow-emerald-500/40 animate-pulse'
            : flash === 'down'
              ? 'ring-2 ring-rose-400 brightness-130 scale-[1.02] z-30 shadow-lg shadow-rose-500/40 animate-pulse'
              : '';

          return (
            <div
              key={stock.symbol}
              role="button"
              tabIndex={0}
              aria-label={`${stock.symbol}: ${stock.name}, ${formatCurrency(stock.price, stock.currency)}, ${formatPercent(stock.changePercent)}`}
              style={{
                left: `${leaf.x0}px`,
                top: `${leaf.y0}px`,
                width: `${tileWidth}px`,
                height: `${tileHeight}px`,
                backgroundColor: color,
              }}
              onClick={() => onSelectStock(stock.symbol)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectStock(stock.symbol);
                }
              }}
              onMouseMove={(e) => handleMouseMove(e, stock)}
              onMouseLeave={handleMouseLeave}
              className={`absolute flex flex-col items-center justify-center p-0.5 cursor-pointer transition-all duration-200 border border-black/40 hover:brightness-125 hover:z-20 hover:scale-[1.015] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/80 ${flashClass}`}
            >
              {showSymbol && (
                <div
                  className={`font-mono font-bold tracking-tight text-white leading-none ${
                    tileWidth < 36 || tileHeight < 20
                      ? 'text-[9px]'
                      : tileWidth < 55
                        ? 'text-[10px]'
                        : tileWidth < 80
                          ? 'text-xs'
                          : 'text-sm'
                  }`}
                >
                  {stock.symbol.includes('=X')
                    ? stock.symbol.replace('=X', '').replace(/([A-Z]{3})([A-Z]{3})/, '$1/$2')
                    : stock.symbol.replace('.NS', '').replace('-USD', '').replace('=F', '').replace('^', '')}
                </div>
              )}

              {showFullName && (
                <div className="text-[10px] text-white/85 truncate max-w-[90%] text-center leading-tight mt-0.5">
                  {stock.name}
                </div>
              )}

              {showChange && (
                <div
                  className={`font-mono font-medium leading-none mt-0.5 ${
                    tileWidth < 38 || tileHeight < 26 ? 'text-[9px]' : tileWidth < 55 ? 'text-[10px]' : 'text-xs'
                  } text-white/95`}
                >
                  {getTileMetricLabel(stock)}
                </div>
              )}

              {showPrice && (
                <div className="text-[10px] font-mono text-white/75 mt-0.5 leading-none">
                  {formatCurrency(stock.price, stock.currency)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Hover Tooltip */}
      <TileTooltip stock={hoveredStock} position={mousePos} />
    </div>
  );
};

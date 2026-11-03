import React, { useRef, useState, useEffect, useMemo } from 'react';
import * as d3 from 'd3-hierarchy';
import { SectorGroup, StockTile, ColorMode } from '../../types';
import { getTreemapColor, formatCurrency, formatPercent } from '../../lib/utils';
import { TileTooltip } from './TileTooltip';

interface TreemapD3Props {
  sectors: SectorGroup[];
  onSelectStock: (symbol: string) => void;
  colorMode?: ColorMode;
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
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export const TreemapD3: React.FC<TreemapD3Props> = ({
  sectors,
  onSelectStock,
  colorMode = 'standard',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 1000,
    height: 650,
  });

  const [hoveredStock, setHoveredStock] = useState<StockTile | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

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
  }, []);

  // Compute D3 Treemap layout
  const { leaves, sectorHeaders } = useMemo(() => {
    if (!sectors || sectors.length === 0) {
      return { leaves: [], sectorHeaders: [] };
    }

    // Build hierarchy root
    const rootData = {
      name: 'Market',
      children: sectors.map((sec) => ({
        name: sec.name,
        children: sec.stocks,
      })),
    };

    const root = d3
      .hierarchy<any>(rootData)
      .sum((d: any) => (d.marketCap && d.marketCap > 0 ? d.marketCap : 1))
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemapLayout = d3
      .treemap<any>()
      .size([dimensions.width, dimensions.height])
      .paddingTop(20) // Header space for sector label
      .paddingInner(2)
      .paddingOuter(3)
      .round(true);

    treemapLayout(root);

    // Extract sector boundary headers
    const sectorHeaders: SectorNode[] = [];
    if (root.children) {
      root.children.forEach((node) => {
        const secNode = node as d3.HierarchyRectangularNode<any>;
        if (secNode.x1 - secNode.x0 > 30 && secNode.y1 - secNode.y0 > 25) {
          sectorHeaders.push({
            name: secNode.data.name,
            x0: secNode.x0,
            y0: secNode.y0,
            x1: secNode.x1,
            y1: secNode.y1,
          });
        }
      });
    }

    // Extract leaf stock tiles
    const leaves: HierarchyLeaf[] = root.leaves().map((leaf: any) => ({
      data: leaf.data as StockTile,
      x0: leaf.x0,
      y0: leaf.y0,
      x1: leaf.x1,
      y1: leaf.y1,
      parent: leaf.parent,
    }));

    return { leaves, sectorHeaders };
  }, [sectors, dimensions]);

  const handleMouseMove = (e: React.MouseEvent, stock: StockTile) => {
    setHoveredStock(stock);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredStock(null);
    setMousePos(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[650px] min-h-[500px] bg-[#0c1019] rounded-xl border border-slate-800/80 overflow-hidden select-none"
    >
      {/* Sector Category Header Badges */}
      {sectorHeaders.map((sec) => {
        const secWidth = sec.x1 - sec.x0;
        return (
          <div
            key={sec.name}
            style={{
              left: `${sec.x0 + 4}px`,
              top: `${sec.y0 + 2}px`,
              maxWidth: `${secWidth - 8}px`,
            }}
            className="absolute z-10 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 truncate pointer-events-none"
          >
            {sec.name}
          </div>
        );
      })}

      {/* Stock Tiles */}
      {leaves.map((leaf) => {
        const tileWidth = Math.max(0, leaf.x1 - leaf.x0);
        const tileHeight = Math.max(0, leaf.y1 - leaf.y0);
        const stock = leaf.data;
        const color = getTreemapColor(stock.changePercent, colorMode);

        const showSymbol = tileWidth >= 34 && tileHeight >= 22;
        const showChange = tileWidth >= 46 && tileHeight >= 36;
        const showPrice = tileWidth >= 70 && tileHeight >= 55;
        const showFullName = tileWidth >= 120 && tileHeight >= 80;

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
            className="absolute flex flex-col items-center justify-center p-1 cursor-pointer transition-all duration-150 border border-black/30 hover:brightness-125 hover:z-20 hover:scale-[1.01] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/80"
          >
            {showSymbol && (
              <div
                className={`font-mono font-bold tracking-tight text-white leading-none ${
                  tileWidth < 55 ? 'text-xs' : tileWidth < 90 ? 'text-sm' : 'text-base'
                }`}
              >
                {stock.symbol.replace('.NS', '')}
              </div>
            )}

            {showFullName && (
              <div className="text-[10px] text-white/80 truncate max-w-[90%] text-center leading-tight mt-0.5">
                {stock.name}
              </div>
            )}

            {showChange && (
              <div
                className={`font-mono font-medium leading-none mt-1 ${
                  tileWidth < 55 ? 'text-[10px]' : 'text-xs'
                } text-white/95`}
              >
                {formatPercent(stock.changePercent)}
              </div>
            )}

            {showPrice && (
              <div className="text-[11px] font-mono text-white/75 mt-0.5 leading-none">
                {formatCurrency(stock.price, stock.currency)}
              </div>
            )}
          </div>
        );
      })}

      {/* Floating Hover Tooltip */}
      <TileTooltip stock={hoveredStock} position={mousePos} />
    </div>
  );
};

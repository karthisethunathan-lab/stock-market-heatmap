import React from 'react';
import { StockTile } from '../../types';
import { formatCurrency, formatCompactNumber, formatPercent } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TileTooltipProps {
  stock: StockTile | null;
  position: { x: number; y: number } | null;
}

export const TileTooltip: React.FC<TileTooltipProps> = ({ stock, position }) => {
  if (!stock || !position) return null;

  const isUp = (stock.changePercent || 0) >= 0;

  // Keep tooltip on screen
  const left = Math.min(position.x + 15, window.innerWidth - 260);
  const top = Math.min(position.y + 15, window.innerHeight - 200);

  return (
    <div
      style={{ left: `${left}px`, top: `${top}px` }}
      className="fixed z-50 pointer-events-none w-64 bg-slate-900/95 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-white animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
        <div>
          <div className="font-mono font-bold text-base tracking-wide flex items-center gap-1.5">
            {stock.symbol}
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-sans font-normal">
              {stock.sector}
            </span>
          </div>
          <div className="text-xs text-slate-400 truncate max-w-[170px]">{stock.name}</div>
        </div>

        <div className={`flex items-center gap-0.5 text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${
          isUp ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60' : 'text-rose-400 bg-rose-950/60 border border-rose-800/60'
        }`}>
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {formatPercent(stock.changePercent)}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase">Price</span>
          <span className="text-sm font-bold text-slate-100">
            {formatCurrency(stock.price, stock.currency)}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block uppercase">Market Cap</span>
          <span className="text-sm font-semibold text-slate-200">
            {formatCompactNumber(stock.marketCap, stock.currency)}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block uppercase">Volume</span>
          <span className="text-xs text-slate-300">
            {formatCompactNumber(stock.volume)}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block uppercase">Currency</span>
          <span className="text-xs text-slate-300">{stock.currency}</span>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Click tile for full charts & news</span>
        <span className="text-emerald-400 font-bold">↵</span>
      </div>
    </div>
  );
};

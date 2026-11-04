import React from 'react';
import { StockTile } from '../../types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface GainersLosersPanelProps {
  allStocks: StockTile[];
  onSelectStock: (symbol: string) => void;
}

export const GainersLosersPanel: React.FC<GainersLosersPanelProps> = ({
  allStocks,
  onSelectStock,
}) => {
  if (!allStocks || allStocks.length === 0) return null;

  const valid = allStocks.filter(
    (s) => s.changePercent !== undefined && s.changePercent !== null && !isNaN(s.changePercent)
  );

  const gainers = [...valid].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const losers = [...valid].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3 shadow-sm">
      {/* Top 5 Gainers */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-2">
          <TrendingUp className="w-3.5 h-3.5" /> Top 5 Gainers
        </div>
        <div className="flex flex-col gap-1">
          {gainers.map((s) => (
            <div
              key={s.symbol}
              onClick={() => onSelectStock(s.symbol)}
              className="flex items-center justify-between text-xs px-2 py-1 rounded hover:bg-slate-800/60 cursor-pointer transition"
            >
              <div className="flex flex-col">
                <span className="font-bold text-slate-200">{s.symbol}</span>
                <span className="text-[10px] text-slate-500 truncate max-w-[80px]">{s.name}</span>
              </div>
              <div className="text-right">
                <div className="font-mono text-slate-300 font-medium">
                  {formatCurrency(s.price, s.currency)}
                </div>
                <div className="font-mono text-[11px] font-semibold text-emerald-400">
                  +{s.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-800/80 my-0.5" />

      {/* Top 5 Losers */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 mb-2">
          <TrendingDown className="w-3.5 h-3.5" /> Top 5 Losers
        </div>
        <div className="flex flex-col gap-1">
          {losers.map((s) => (
            <div
              key={s.symbol}
              onClick={() => onSelectStock(s.symbol)}
              className="flex items-center justify-between text-xs px-2 py-1 rounded hover:bg-slate-800/60 cursor-pointer transition"
            >
              <div className="flex flex-col">
                <span className="font-bold text-slate-200">{s.symbol}</span>
                <span className="text-[10px] text-slate-500 truncate max-w-[80px]">{s.name}</span>
              </div>
              <div className="text-right">
                <div className="font-mono text-slate-300 font-medium">
                  {formatCurrency(s.price, s.currency)}
                </div>
                <div className="font-mono text-[11px] font-semibold text-rose-400">
                  {s.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

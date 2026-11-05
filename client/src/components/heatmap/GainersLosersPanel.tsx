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

  const gainers = [...valid].sort((a, b) => b.changePercent - a.changePercent).slice(0, 6);
  const losers = [...valid].sort((a, b) => a.changePercent - b.changePercent).slice(0, 6);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3 shadow-sm h-full">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
          Market Movers
        </h3>
        <span className="text-[10px] text-slate-500">Top Gainers & Losers</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Top Gainers */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 px-1">
            <TrendingUp className="w-3.5 h-3.5" /> Top Gainers
          </div>
          <div className="flex flex-col gap-1">
            {gainers.map((s) => (
              <div
                key={s.symbol}
                onClick={() => onSelectStock(s.symbol)}
                className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-800/70 border border-transparent hover:border-slate-700/60 cursor-pointer transition"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="font-bold text-slate-200 truncate">{s.symbol.replace('.NS', '')}</span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[140px]">{s.name}</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-mono text-slate-300 font-medium text-[11px]">
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

        {/* Top Losers */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 px-1">
            <TrendingDown className="w-3.5 h-3.5" /> Top Losers
          </div>
          <div className="flex flex-col gap-1">
            {losers.map((s) => (
              <div
                key={s.symbol}
                onClick={() => onSelectStock(s.symbol)}
                className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-800/70 border border-transparent hover:border-slate-700/60 cursor-pointer transition"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="font-bold text-slate-200 truncate">{s.symbol.replace('.NS', '')}</span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[140px]">{s.name}</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-mono text-slate-300 font-medium text-[11px]">
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
    </div>
  );
};

import React, { useState } from 'react';
import { HoldingCalculated, PortfolioHolding } from '../../types';
import { formatCurrency, formatPercent } from '../../lib/utils';
import { useApp } from '../../context/ThemeContext';
import { Edit2, Trash2, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { AddHoldingModal } from './AddHoldingModal';

interface HoldingsTableProps {
  holdings: HoldingCalculated[];
  portfolioId: string;
  onDeleteHolding: (portfolioId: string, holdingId: string) => void;
}

export const HoldingsTable: React.FC<HoldingsTableProps> = ({
  holdings,
  portfolioId,
  onDeleteHolding,
}) => {
  const { openStock } = useApp();
  const [editingHolding, setEditingHolding] = useState<PortfolioHolding | null>(null);

  if (holdings.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400 font-mono text-xs">
        No holdings in this portfolio yet. Click "Add Holding" to start building your portfolio.
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Symbol / Name</th>
              <th className="py-3 px-3 text-right">Qty</th>
              <th className="py-3 px-3 text-right">Avg Cost</th>
              <th className="py-3 px-3 text-right">Price</th>
              <th className="py-3 px-3 text-right">Day Chg</th>
              <th className="py-3 px-3 text-right">Invested</th>
              <th className="py-3 px-3 text-right">Value</th>
              <th className="py-3 px-3 text-right">Total P&L</th>
              <th className="py-3 px-3 text-right">Weight</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60">
            {holdings.map((h) => {
              const isPnlPositive = h.pnl >= 0;
              const isDayPositive = h.dayChangePercent >= 0;

              return (
                <tr
                  key={h.id}
                  className="hover:bg-slate-850/50 transition-colors group"
                >
                  {/* Symbol & Name */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => openStock(h.symbol)}
                      className="flex items-center gap-2 text-left group-hover:text-emerald-400 transition-colors"
                    >
                      <div>
                        <div className="font-bold text-white group-hover:text-emerald-400 flex items-center gap-1">
                          {h.symbol}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans truncate max-w-[130px]">
                          {h.name}
                        </div>
                      </div>
                    </button>
                  </td>

                  {/* Quantity */}
                  <td className="py-3 px-3 text-right font-medium text-slate-200">
                    {h.quantity}
                  </td>

                  {/* Avg Cost */}
                  <td className="py-3 px-3 text-right text-slate-300">
                    {formatCurrency(h.buyPrice, h.currency)}
                  </td>

                  {/* Current Price */}
                  <td className="py-3 px-3 text-right font-bold text-white">
                    {formatCurrency(h.currentPrice, h.currency)}
                  </td>

                  {/* Day Change */}
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`inline-flex items-center gap-0.5 font-semibold ${
                        isDayPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isDayPositive ? '+' : ''}
                      {formatPercent(h.dayChangePercent)}
                    </span>
                  </td>

                  {/* Invested */}
                  <td className="py-3 px-3 text-right text-slate-300">
                    {formatCurrency(h.investedValue, h.currency)}
                  </td>

                  {/* Current Value */}
                  <td className="py-3 px-3 text-right font-bold text-white">
                    {formatCurrency(h.currentValue, h.currency)}
                  </td>

                  {/* Total P&L */}
                  <td className="py-3 px-3 text-right">
                    <div
                      className={`font-bold flex items-center justify-end gap-1 ${
                        isPnlPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPnlPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{isPnlPositive ? `+${formatCurrency(h.pnl, h.currency)}` : formatCurrency(h.pnl, h.currency)}</span>
                    </div>
                    <div className={`text-[10px] ${isPnlPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {formatPercent(h.pnlPercent)}
                    </div>
                  </td>

                  {/* Weight */}
                  <td className="py-3 px-3 text-right text-slate-400">
                    {h.weight.toFixed(1)}%
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setEditingHolding(h)}
                        title="Edit holding"
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteHolding(portfolioId, h.id)}
                        title="Delete holding"
                        className="p-1.5 rounded hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingHolding && (
        <AddHoldingModal
          isOpen={Boolean(editingHolding)}
          onClose={() => setEditingHolding(null)}
          holdingToEdit={editingHolding}
        />
      )}
    </>
  );
};

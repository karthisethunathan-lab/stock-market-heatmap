import React from 'react';
import { formatCurrency, formatPercent } from '../../lib/utils';
import { TrendingUp, TrendingDown, DollarSign, Wallet, PiggyBank, Calendar } from 'lucide-react';

interface PortfolioSummaryCardsProps {
  totalInvested: number;
  totalCurrentValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  dayPnl: number;
  dayPnlPercent: number;
  currency: string;
  hasMixedCurrencies: boolean;
}

export const PortfolioSummaryCards: React.FC<PortfolioSummaryCardsProps> = ({
  totalInvested,
  totalCurrentValue,
  totalPnl,
  totalPnlPercent,
  dayPnl,
  dayPnlPercent,
  currency = 'USD',
  hasMixedCurrencies = false,
}) => {
  const isTotalUp = totalPnl >= 0;
  const isDayUp = dayPnl >= 0;

  return (
    <div className="flex flex-col gap-2">
      {hasMixedCurrencies && (
        <div className="text-[11px] font-mono px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300">
          ⚠️ <strong>Notice:</strong> This portfolio contains multiple currencies (USD and INR). Values are aggregated numerically based on holding currencies without FX conversion.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Total Current Value */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Current Value</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-mono font-extrabold text-white">
              {formatCurrency(totalCurrentValue, currency)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1">
              Live market value
            </div>
          </div>
        </div>

        {/* Total Invested */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Total Invested</span>
            <PiggyBank className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="text-2xl font-mono font-extrabold text-slate-200">
              {formatCurrency(totalInvested, currency)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1">
              Cost basis across holdings
            </div>
          </div>
        </div>

        {/* Total Return P&L */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Total Return (P&L)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className={`text-2xl font-mono font-extrabold ${isTotalUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isTotalUp ? `+${formatCurrency(totalPnl, currency)}` : formatCurrency(totalPnl, currency)}
            </div>
            <div className={`flex items-center gap-1 text-xs font-mono font-semibold mt-1 ${isTotalUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isTotalUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{formatPercent(totalPnlPercent)}</span>
              <span className="text-slate-500 font-normal">All time</span>
            </div>
          </div>
        </div>

        {/* Today's Return */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Day's P&L</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className={`text-2xl font-mono font-extrabold ${isDayUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isDayUp ? `+${formatCurrency(dayPnl, currency)}` : formatCurrency(dayPnl, currency)}
            </div>
            <div className={`flex items-center gap-1 text-xs font-mono font-semibold mt-1 ${isDayUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isDayUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{formatPercent(dayPnlPercent)}</span>
              <span className="text-slate-500 font-normal">Today</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

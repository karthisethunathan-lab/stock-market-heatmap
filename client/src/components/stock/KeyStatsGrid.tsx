import React from 'react';
import { StockQuote, KeyMetrics } from '../../types';
import { formatCurrency, formatCompactNumber } from '../../lib/utils';

interface KeyStatsGridProps {
  quote: StockQuote | null;
  metrics: KeyMetrics | null;
}

export const KeyStatsGrid: React.FC<KeyStatsGridProps> = ({ quote, metrics }) => {
  if (!quote) return null;

  const isCrypto = quote.symbol?.includes('-USD');
  const isForex = quote.symbol?.includes('=X');
  const currency = isForex ? 'FX' : quote.currency || 'USD';
  const high52 = metrics?.fiftyTwoWeekHigh || quote.fiftyTwoWeekHigh;
  const low52 = metrics?.fiftyTwoWeekLow || quote.fiftyTwoWeekLow;

  // Compute 52-week range percentage
  let rangePercent = 50;
  if (high52 && low52 && high52 > low52 && quote.price) {
    rangePercent = Math.min(100, Math.max(0, ((quote.price - low52) / (high52 - low52)) * 100));
  }

  const stats = isCrypto
    ? [
        { label: 'Open', value: formatCurrency(quote.open, currency) },
        { label: '24h High', value: formatCurrency(quote.dayHigh, currency) },
        { label: '24h Low', value: formatCurrency(quote.dayLow, currency) },
        { label: 'Prev Close', value: formatCurrency(quote.previousClose, currency) },
        { label: '24h Volume', value: formatCompactNumber(quote.volume, 'USD') },
        { label: '52W High', value: high52 ? formatCurrency(high52, currency) : '--' },
        { label: '52W Low', value: low52 ? formatCurrency(low52, currency) : '--' },
        { label: 'Asset Class', value: 'Cryptocurrency' },
        { label: 'Settlement', value: 'Continuous' },
        { label: 'Trading Hours', value: '24/7 Live' },
      ]
    : isForex
      ? [
          { label: 'Open Rate', value: formatCurrency(quote.open, 'FX') },
          { label: 'Day High', value: formatCurrency(quote.dayHigh, 'FX') },
          { label: 'Day Low', value: formatCurrency(quote.dayLow, 'FX') },
          { label: 'Prev Close', value: formatCurrency(quote.previousClose, 'FX') },
          { label: '52W High', value: high52 ? formatCurrency(high52, 'FX') : '--' },
          { label: '52W Low', value: low52 ? formatCurrency(low52, 'FX') : '--' },
          { label: 'Asset Class', value: 'Foreign Exchange' },
          { label: 'Spread Type', value: 'Floating' },
          { label: 'Market Window', value: '24/5 Global' },
          { label: 'Exchange', value: 'Interbank' },
        ]
      : [
          { label: 'Open', value: formatCurrency(quote.open, currency) },
          { label: 'Day High', value: formatCurrency(quote.dayHigh, currency) },
          { label: 'Day Low', value: formatCurrency(quote.dayLow, currency) },
          { label: 'Prev Close', value: formatCurrency(quote.previousClose, currency) },
          { label: 'Volume', value: formatCompactNumber(quote.volume) },
          { label: 'Market Cap', value: metrics?.marketCap ? formatCompactNumber(metrics.marketCap, currency) : 'N/A' },
          { label: 'P/E Ratio', value: metrics?.peRatio ? metrics.peRatio.toFixed(2) : 'N/A' },
          { label: 'EPS (TTM)', value: metrics?.eps ? formatCurrency(metrics.eps, currency) : 'N/A' },
          { label: 'Dividend Yield', value: metrics?.dividendYield ? `${metrics.dividendYield.toFixed(2)}%` : 'N/A' },
          { label: 'Beta', value: metrics?.beta ? metrics.beta.toFixed(2) : 'N/A' },
        ];

  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
        Key Statistics & Metrics
      </h4>

      {/* 52-Week Range Bar */}
      {high52 && low52 && (
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span>52W Low: <strong className="text-white">{formatCurrency(low52, currency)}</strong></span>
            <span>Current: <strong className="text-emerald-400">{formatCurrency(quote.price, currency)}</strong></span>
            <span>52W High: <strong className="text-white">{formatCurrency(high52, currency)}</strong></span>
          </div>
          <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${rangePercent}%` }}
              className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full"
            />
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block font-mono uppercase tracking-tight">
              {s.label}
            </span>
            <span className="text-sm font-mono font-bold text-slate-100">
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

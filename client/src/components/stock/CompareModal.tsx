import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { fetchQuote, fetchHistory, fetchFundamentals } from '../../lib/api';
import { formatCurrency, formatPercent } from '../../lib/utils';

interface CompareModalProps {
  initialSymbol?: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectStock?: (symbol: string) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  initialSymbol = 'AAPL',
  isOpen,
  onClose,
  onSelectStock,
}) => {
  const [symbols, setSymbols] = useState<string[]>([initialSymbol, 'MSFT', 'NVDA']);
  const [newSymbolInput, setNewSymbolInput] = useState('');
  const [stockData, setStockData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialSymbol && !symbols.includes(initialSymbol)) {
      setSymbols((prev) => [initialSymbol, ...prev.slice(0, 3)]);
    }
  }, [initialSymbol]);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      const results: Record<string, any> = {};

      for (const sym of symbols) {
        try {
          const [q, f, h] = await Promise.all([
            fetchQuote(sym),
            fetchFundamentals(sym),
            fetchHistory(sym, '6M', '1d'),
          ]);
          results[sym] = {
            quote: q.data,
            fundamentals: f,
            history: h.data,
          };
        } catch {
          // Soft fail
        }
      }

      if (isMounted) {
        setStockData(results);
        setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [symbols, isOpen]);

  if (!isOpen) return null;

  const handleAddSymbol = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newSymbolInput.trim().toUpperCase();
    if (clean && !symbols.includes(clean) && symbols.length < 4) {
      setSymbols([...symbols, clean]);
      setNewSymbolInput('');
    }
  };

  const handleRemoveSymbol = (sym: string) => {
    if (symbols.length > 1) {
      setSymbols(symbols.filter((s) => s !== sym));
    }
  };

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

  // Normalized chart (rebased to 100)
  const renderNormalizedChart = () => {
    const validSeries = symbols
      .map((sym, idx) => {
        const hist = stockData[sym]?.history?.candles;
        if (!hist || hist.length < 2) return null;
        const base = hist[0].close || 1;
        const normalized = hist.map((c: any) => ({
          label: c.label,
          val: Number(((c.close / base) * 100).toFixed(2)),
        }));
        return { symbol: sym, color: colors[idx % colors.length], points: normalized };
      })
      .filter(Boolean);

    if (validSeries.length === 0) {
      return (
        <div className="h-44 flex items-center justify-center text-slate-500 text-xs">
          Loading normalized overlay charts (base 100)...
        </div>
      );
    }

    const allVals = validSeries.flatMap((s) => s!.points.map((p: { val: number }) => p.val));
    const minVal = Math.min(80, ...allVals);
    const maxVal = Math.max(120, ...allVals);
    const range = maxVal - minVal || 1;

    const width = 640;
    const height = 160;

    return (
      <div className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">
            6-Month Normalized Performance (Base = 100)
          </span>
          <div className="flex items-center gap-3">
            {validSeries.map((s) => (
              <span key={s!.symbol} className="flex items-center gap-1 font-mono text-[11px]" style={{ color: s!.color }}>
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: s!.color }} />
                {s!.symbol}
              </span>
            ))}
          </div>
        </div>

        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible pt-2">
          {/* Baseline at 100 */}
          {(() => {
            const y100 = height - ((100 - minVal) / range) * (height - 20) - 10;
            return (
              <>
                <line x1="0" y1={y100} x2={width} y2={y100} stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
                <text x="5" y={y100 - 3} fill="#64748b" fontSize="9" fontFamily="monospace">Base: 100</text>
              </>
            );
          })()}

          {validSeries.map((series) => {
            const points = series!.points;
            const pathData = points
              .map((p: { val: number }, idx: number) => {
                const x = (idx / (points.length - 1)) * width;
                const y = height - ((p.val - minVal) / range) * (height - 20) - 10;
                return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
              })
              .join(' ');

            return (
              <path
                key={series!.symbol}
                d={pathData}
                fill="none"
                stroke={series!.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#0b101c] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              ⚖️ Compare Stocks (Up to 4)
            </h3>
            <p className="text-xs text-slate-400">
              Normalized relative price action & side-by-side fundamentals table
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Symbol Selector Bar */}
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {symbols.map((sym, idx) => (
              <span
                key={sym}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-slate-800 text-white border border-slate-700"
                style={{ borderLeftColor: colors[idx % colors.length], borderLeftWidth: '4px' }}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectStock?.(sym);
                    onClose();
                  }}
                  className="hover:underline"
                  title="Click to view details"
                >
                  {sym}
                </button>
                {symbols.length > 1 && (
                  <button onClick={() => handleRemoveSymbol(sym)} className="text-slate-400 hover:text-rose-400">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
            {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-400 ml-1" />}
          </div>

          {symbols.length < 4 && (
            <form onSubmit={handleAddSymbol} className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Add ticker..."
                value={newSymbolInput}
                onChange={(e) => setNewSymbolInput(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white uppercase outline-none focus:ring-1 focus:ring-blue-500 w-28"
              />
              <button type="submit" className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex flex-col gap-4 scrollbar-thin">
          {/* Overlay Chart */}
          {renderNormalizedChart()}

          {/* Side-by-Side Fundamentals Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800/60 text-slate-300 border-b border-slate-800 font-semibold">
                  <th className="py-2.5 px-3">Metric</th>
                  {symbols.map((sym) => (
                    <th key={sym} className="py-2.5 px-3 font-mono text-right">
                      {sym}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                <tr>
                  <td className="py-2 px-3 text-slate-400 font-sans">Price</td>
                  {symbols.map((sym) => (
                    <td key={sym} className="py-2 px-3 text-right text-white font-bold">
                      {stockData[sym]?.quote?.price ? formatCurrency(stockData[sym].quote.price, stockData[sym].quote.currency) : '--'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-400 font-sans">1-Day % Change</td>
                  {symbols.map((sym) => {
                    const chg = stockData[sym]?.quote?.changePercent;
                    return (
                      <td key={sym} className={`py-2 px-3 text-right font-bold ${chg >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {chg !== undefined ? formatPercent(chg) : '--'}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-400 font-sans">P/E Ratio (TTM)</td>
                  {symbols.map((sym) => (
                    <td key={sym} className="py-2 px-3 text-right text-slate-200">
                      {stockData[sym]?.fundamentals?.valuation?.peRatioTTM?.toFixed(1) || '--'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-400 font-sans">Price / Book (P/B)</td>
                  {symbols.map((sym) => (
                    <td key={sym} className="py-2 px-3 text-right text-slate-200">
                      {stockData[sym]?.fundamentals?.valuation?.priceToBook?.toFixed(1) || '--'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-400 font-sans">Operating Margin</td>
                  {symbols.map((sym) => (
                    <td key={sym} className="py-2 px-3 text-right text-slate-200">
                      {stockData[sym]?.fundamentals?.profitability?.operatingMargin ? `${stockData[sym].fundamentals.profitability.operatingMargin}%` : '--'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-400 font-sans">Return on Equity (ROE)</td>
                  {symbols.map((sym) => (
                    <td key={sym} className="py-2 px-3 text-right text-slate-200">
                      {stockData[sym]?.fundamentals?.profitability?.roe ? `${stockData[sym].fundamentals.profitability.roe}%` : '--'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-400 font-sans">Debt / Equity</td>
                  {symbols.map((sym) => (
                    <td key={sym} className="py-2 px-3 text-right text-slate-200">
                      {stockData[sym]?.fundamentals?.financialHealth?.debtToEquity?.toFixed(2) || '--'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-400 font-sans">Dividend Yield</td>
                  {symbols.map((sym) => (
                    <td key={sym} className="py-2 px-3 text-right text-slate-200">
                      {stockData[sym]?.fundamentals?.dividends?.yield ? `${stockData[sym].fundamentals.dividends.yield}%` : '0.00%'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/ThemeContext';
import { formatPercent } from '../../lib/utils';
import { ArrowLeftRight, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';

interface ForexCrossRatesTabProps {
  symbol: string;
}

export const ForexCrossRatesTab: React.FC<ForexCrossRatesTabProps> = ({ symbol }) => {
  const { openStock } = useApp();
  const [crossRates, setCrossRates] = useState<any[]>([]);

  // Cross pairs to compare against
  const crossPairs = [
    { pair: 'EURUSD=X', name: 'EUR / USD', desc: 'Euro vs US Dollar' },
    { pair: 'GBPUSD=X', name: 'GBP / USD', desc: 'British Pound vs US Dollar' },
    { pair: 'USDJPY=X', name: 'USD / JPY', desc: 'US Dollar vs Japanese Yen' },
    { pair: 'USDINR=X', name: 'USD / INR', desc: 'US Dollar vs Indian Rupee' },
    { pair: 'EURINR=X', name: 'EUR / INR', desc: 'Euro vs Indian Rupee' },
    { pair: 'GBPINR=X', name: 'GBP / INR', desc: 'British Pound vs Indian Rupee' },
    { pair: 'USDCHF=X', name: 'USD / CHF', desc: 'US Dollar vs Swiss Franc' },
    { pair: 'AUDUSD=X', name: 'AUD / USD', desc: 'Australian Dollar vs US Dollar' },
    { pair: 'USDCAD=X', name: 'USD / CAD', desc: 'US Dollar vs Canadian Dollar' },
    { pair: 'EURGBP=X', name: 'EUR / GBP', desc: 'Euro vs British Pound' },
    { pair: 'EURJPY=X', name: 'EUR / JPY', desc: 'Euro vs Japanese Yen' },
    { pair: 'GBPJPY=X', name: 'GBP / JPY', desc: 'British Pound vs Japanese Yen' },
  ];

  useEffect(() => {
    let isMounted = true;

    const symbols = crossPairs.map((p) => p.pair);
    const fetchPromises = symbols.map(async (sym) => {
      try {
        const res = await fetch(`/api/quote.js?symbol=${encodeURIComponent(sym)}`);
        const json = await res.json();
        return json.data || null;
      } catch {
        return null;
      }
    });

    Promise.allSettled(fetchPromises).then((results) => {
      if (!isMounted) return;
      const map: Record<string, any> = {};
      results.forEach((r, idx) => {
        if (r.status === 'fulfilled' && r.value) {
          map[symbols[idx]] = r.value;
        }
      });

      const list = crossPairs.map((item) => {
        const q = map[item.pair];
        return {
          ...item,
          price: q?.price || 0,
          change: q?.change || 0,
          changePercent: q?.changePercent || 0,
          high: q?.dayHigh || 0,
          low: q?.dayLow || 0,
        };
      });

      setCrossRates(list);
    });

    return () => {
      isMounted = false;
    };
  }, [symbol]);

  return (
    <div className="p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-160px)] scrollbar-thin">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">Global Cross Rates Matrix</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live interbank exchange rates across major reserve currencies & emerging market pairs
            </p>
          </div>
        </div>
      </div>

      {/* Cross Rates Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 font-semibold border-b border-slate-800">
                <th className="py-2.5 px-4">Currency Pair</th>
                <th className="py-2.5 px-4">Description</th>
                <th className="py-2.5 px-4 text-right">Live Rate</th>
                <th className="py-2.5 px-4 text-right">24h Change</th>
                <th className="py-2.5 px-4 text-right">Day Range</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 font-mono">
              {crossRates.map((item) => {
                const isCurrent = item.pair === symbol;
                const isUp = item.changePercent >= 0;
                const isJPY = item.pair.includes('JPY');
                const decimals = isJPY ? 2 : 4;

                return (
                  <tr
                    key={item.pair}
                    onClick={() => openStock(item.pair)}
                    className={`hover:bg-slate-800/60 cursor-pointer transition ${
                      isCurrent ? 'bg-blue-950/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <span className={isCurrent ? 'text-blue-400' : ''}>{item.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-sans border border-blue-500/40">
                          Viewing
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-sans text-xs">
                      {item.desc}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-100">
                      {item.price ? item.price.toFixed(decimals) : '--'}
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      <span className="inline-flex items-center gap-0.5">
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {formatPercent(item.changePercent)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                      {item.low ? item.low.toFixed(decimals) : '--'} - {item.high ? item.high.toFixed(decimals) : '--'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openStock(item.pair);
                        }}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title={`View ${item.name}`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

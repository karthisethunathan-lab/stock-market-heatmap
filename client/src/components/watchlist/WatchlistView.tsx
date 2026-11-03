import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/ThemeContext';
import { fetchQuote } from '../../lib/api';
import { StockQuote } from '../../types';
import { formatCurrency, formatPercent } from '../../lib/utils';
import { Bookmark, Trash2, TrendingUp, TrendingDown, ExternalLink, Activity } from 'lucide-react';
import { Skeleton } from '../common/Skeleton';

export const WatchlistView: React.FC = () => {
  const { watchlist, toggleWatchlist, openStock, setActiveTab } = useApp();
  const [quotes, setQuotes] = useState<Map<string, StockQuote>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (watchlist.length === 0) {
      setQuotes(new Map());
      setLoading(false);
      return;
    }

    let isCurrent = true;
    setLoading(true);

    Promise.allSettled(
      watchlist.map(async (sym) => {
        try {
          const res = await fetchQuote(sym);
          return res.data;
        } catch {
          return null;
        }
      })
    ).then((results) => {
      if (!isCurrent) return;
      const map = new Map<string, StockQuote>();
      results.forEach((r) => {
        if (r.status === 'fulfilled' && r.value) {
          map.set(r.value.symbol.toUpperCase(), r.value);
        }
      });
      setQuotes(map);
      setLoading(false);
    });

    return () => {
      isCurrent = false;
    };
  }, [watchlist]);

  if (watchlist.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto py-16 px-4 text-center bg-slate-900/40 rounded-xl border border-slate-800">
        <Bookmark className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-200 mb-1">Your Watchlist is Empty</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
          Keep track of potential investment candidates and view their live market data. Add stocks by clicking on any tile in the heatmap or from the stock detail view.
        </p>
        <button
          onClick={() => setActiveTab('heatmap')}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
        >
          Explore Market Heatmap
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-4 pb-12">
      <div className="flex items-center justify-between p-4 bg-[#0d121f] rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-mono font-bold text-white">
            Watchlist ({watchlist.length} Tickers)
          </h2>
        </div>

        <button
          onClick={() => setActiveTab('heatmap')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-emerald-400 text-xs font-mono font-semibold transition-colors"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>View as Heatmap</span>
        </button>
      </div>

      {loading && quotes.size === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {watchlist.map((sym) => (
            <Skeleton key={sym} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {watchlist.map((sym) => {
            const q = quotes.get(sym.toUpperCase());
            const price = q ? q.price : 0;
            const changePercent = q ? q.changePercent : 0;
            const isUp = changePercent >= 0;
            const currency = q?.currency || (sym.endsWith('.NS') ? 'INR' : 'USD');

            return (
              <div
                key={sym}
                onClick={() => openStock(sym)}
                role="button"
                tabIndex={0}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-base text-white group-hover:text-emerald-400 transition-colors">
                        {sym}
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[11px] text-slate-400 truncate block max-w-[150px]">
                      {q?.name || sym}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist(sym);
                    }}
                    title="Remove from watchlist"
                    className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-end justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Price</span>
                    <span className="text-base font-extrabold text-white">
                      {price > 0 ? formatCurrency(price, currency) : '--'}
                    </span>
                  </div>

                  <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${
                    isUp ? 'text-emerald-400 bg-emerald-950/60' : 'text-rose-400 bg-rose-950/60'
                  }`}>
                    {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{formatPercent(changePercent)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/ThemeContext';
import { fetchQuote } from '../../lib/api';
import { StockQuote, NamedWatchlist, SectorGroup } from '../../types';
import { formatCurrency, formatPercent } from '../../lib/utils';
import { Bookmark, Trash2, Plus, Grid, List } from 'lucide-react';
import { TreemapD3 } from '../heatmap/TreemapD3';

const WATCHLIST_STORAGE_KEY = 'stock_named_watchlists';

export const WatchlistView: React.FC = () => {
  const { watchlist, toggleWatchlist, openStock } = useApp();

  const [namedLists, setNamedLists] = useState<NamedWatchlist[]>([
    { id: 'default', name: 'Main Watchlist', symbols: watchlist, createdAt: new Date().toISOString() },
  ]);
  const [activeListId, setActiveListId] = useState<string>('default');
  const [newListName, setNewListName] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'heatmap'>('table');

  const [quotes, setQuotes] = useState<Map<string, StockQuote>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);

  // Load named lists from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (saved) {
        const parsed: NamedWatchlist[] = JSON.parse(saved);
        if (parsed.length > 0) {
          // Merge current context watchlist into default
          const defaultList = parsed.find((l) => l.id === 'default');
          if (defaultList && watchlist.length > 0) {
            defaultList.symbols = Array.from(new Set([...defaultList.symbols, ...watchlist]));
          }
          setNamedLists(parsed);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  // Save named lists to localStorage
  const saveLists = (updated: NamedWatchlist[]) => {
    setNamedLists(updated);
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const activeList = namedLists.find((l) => l.id === activeListId) || namedLists[0];
  const activeSymbols = activeList?.symbols || [];

  // Fetch quotes for active symbols
  useEffect(() => {
    if (activeSymbols.length === 0) {
      setQuotes(new Map());
      setLoading(false);
      return;
    }

    let isCurrent = true;
    setLoading(true);

    Promise.allSettled(
      activeSymbols.map(async (sym) => {
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
  }, [activeListId, activeSymbols]);

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    const newList: NamedWatchlist = {
      id: `list-${Date.now()}`,
      name: newListName.trim(),
      symbols: [],
      createdAt: new Date().toISOString(),
    };
    saveLists([...namedLists, newList]);
    setActiveListId(newList.id);
    setNewListName('');
    setIsAddingList(false);
  };

  const handleRemoveFromList = (symbol: string) => {
    const updated = namedLists.map((l) => {
      if (l.id === activeListId) {
        return { ...l, symbols: l.symbols.filter((s) => s !== symbol) };
      }
      return l;
    });
    saveLists(updated);
    toggleWatchlist(symbol);
  };

  // Build sector groups for mini heatmap view
  const heatmapSectors: SectorGroup[] = React.useMemo(() => {
    const map = new Map<string, any[]>();
    activeSymbols.forEach((sym) => {
      const q = quotes.get(sym.toUpperCase());
      const sector = 'Watchlist';
      if (!map.has(sector)) map.set(sector, []);
      map.get(sector)!.push({
        symbol: sym,
        name: q?.name || sym,
        sector,
        price: q?.price || 100,
        changePercent: q?.changePercent || 0,
        marketCap: (q?.price || 100) * 5000000000,
        volume: q?.volume || 1000000,
        currency: q?.currency || (sym.endsWith('.NS') ? 'INR' : 'USD'),
      });
    });

    return Array.from(map.entries()).map(([name, stocks]) => ({
      name,
      marketCap: stocks.reduce((acc, s) => acc + s.marketCap, 0),
      stocks,
    }));
  }, [activeSymbols, quotes]);

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Header and Named Watchlist Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400" /> Watchlists & Trackers
            {loading && <span className="text-[11px] text-blue-400 font-normal animate-pulse ml-2">Updating...</span>}
          </h1>
          <p className="text-xs text-slate-400">
            Organize tickers into multiple named watchlists with live quotes, metrics, and heatmap visualization
          </p>
        </div>

        {/* View Mode Toggle: Table vs Heatmap */}
        <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition ${
              viewMode === 'table' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" /> Table View
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition ${
              viewMode === 'heatmap' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Heatmap View
          </button>
        </div>
      </div>

      {/* Named Watchlist Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-thin">
        {namedLists.map((l) => (
          <button
            key={l.id}
            onClick={() => setActiveListId(l.id)}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeListId === l.id
                ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>{l.name}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/60 font-mono">
              {l.symbols.length}
            </span>
          </button>
        ))}

        {isAddingList ? (
          <form onSubmit={handleCreateList} className="flex items-center gap-1">
            <input
              type="text"
              placeholder="List name..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            <button type="submit" className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold">
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsAddingList(false)}
              className="px-2 py-1 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingList(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" /> New List
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {activeSymbols.length === 0 ? (
        <div className="w-full py-16 px-4 text-center bg-slate-900/40 rounded-xl border border-slate-800 flex flex-col items-center">
          <Bookmark className="w-10 h-10 text-slate-500 mb-3" />
          <h3 className="text-base font-bold text-slate-200 mb-1">"{activeList?.name}" is empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            Add stocks by clicking on any stock tile in the heatmap or from the stock drawer.
          </p>
        </div>
      ) : viewMode === 'heatmap' ? (
        <div className="w-full">
          <TreemapD3 sectors={heatmapSectors} onSelectStock={(sym) => openStock(sym)} />
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 border-b border-slate-800 font-semibold">
                <th className="py-3 px-4">Symbol</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-right">1D Change</th>
                <th className="py-3 px-4 text-right">Day Range</th>
                <th className="py-3 px-4 text-right">Volume</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {activeSymbols.map((sym) => {
                const q = quotes.get(sym.toUpperCase());
                const isPos = (q?.changePercent || 0) >= 0;
                const curr = q?.currency || (sym.endsWith('.NS') ? 'INR' : 'USD');

                return (
                  <tr
                    key={sym}
                    onClick={() => openStock(sym)}
                    className="hover:bg-slate-800/50 cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-bold text-blue-400">{sym}</td>
                    <td className="py-3 px-4 text-slate-300 font-sans truncate max-w-[150px]">
                      {q?.name || sym}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-100 font-medium">
                      {q ? formatCurrency(q.price, curr) : '--'}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-bold ${
                        isPos ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {q ? `${isPos ? '+' : ''}${formatPercent(q.changePercent)}` : '--'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                      {q?.dayLow ? `${formatCurrency(q.dayLow, curr)} - ${formatCurrency(q.dayHigh, curr)}` : '--'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {q?.volume ? q.volume.toLocaleString() : '--'}
                    </td>
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleRemoveFromList(sym)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

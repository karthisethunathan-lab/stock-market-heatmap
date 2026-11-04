import React, { useState, useEffect } from 'react';
import { ScreenerFilters, StockTile } from '../../types';
import { fetchScreener } from '../../lib/api';
import { formatCompactNumber, formatCurrency, formatPercent } from '../../lib/utils';
import { Download, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

interface ScreenerViewProps {
  onSelectStock: (symbol: string) => void;
}

export const ScreenerView: React.FC<ScreenerViewProps> = ({ onSelectStock }) => {
  const [market, setMarket] = useState<'us' | 'in' | 'all'>('us');
  const [sector, setSector] = useState('All');
  const [capBucket, setCapBucket] = useState('All');
  const [minPe, setMinPe] = useState('');
  const [maxPe, setMaxPe] = useState('');
  const [minDivYield, setMinDivYield] = useState('');
  const [minRoe, setMinRoe] = useState('');
  const [maxDebtEquity, setMaxDebtEquity] = useState('');
  const [minRevGrowth, setMinRevGrowth] = useState('');
  const [preset, setPreset] = useState('');

  const [sortBy, setSortBy] = useState('marketCap');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const [results, setResults] = useState<StockTile[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters: ScreenerFilters = {
        market,
        sector: sector !== 'All' ? sector : undefined,
        capBucket: capBucket !== 'All' ? capBucket : undefined,
        minPe: minPe || undefined,
        maxPe: maxPe || undefined,
        minDivYield: minDivYield || undefined,
        minRoe: minRoe || undefined,
        maxDebtEquity: maxDebtEquity || undefined,
        minRevGrowth: minRevGrowth || undefined,
        preset: preset || undefined,
        sortBy,
        sortOrder,
        page,
        limit: 20,
      };

      const res = await fetchScreener(filters);
      setResults(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [market, sector, capBucket, preset, sortBy, sortOrder, page]);

  const handleApplyCustomFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleExportCSV = () => {
    if (results.length === 0) return;
    const headers = ['Symbol', 'Name', 'Sector', 'Price', 'Change1D', 'MarketCap', 'PE', 'ROE', 'DivYield', 'RevGrowth'];
    const rows = results.map((s) => [
      `"${s.symbol}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.sector}"`,
      s.price,
      s.changePercent,
      s.marketCap,
      s.pe ?? '',
      s.roe ?? '',
      s.dividendYield ?? '',
      s.revGrowth ?? '',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `screener-export-${market}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-400" /> Multi-Factor Stock Screener
          </h1>
          <p className="text-xs text-slate-400">
            Filter 1,020+ stocks across US and Indian markets by fundamental valuation and technical momentum
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter Controls Card */}
      <form onSubmit={handleApplyCustomFilters} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
        {/* Top Controls: Market, Sector, Preset, Cap */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Market */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 font-medium">Market Universe</label>
            <select
              value={market}
              onChange={(e) => {
                setMarket(e.target.value as any);
                setPage(1);
              }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="us">US Stocks (S&P 500, Nasdaq 100)</option>
              <option value="in">Indian Stocks (NIFTY 500)</option>
              <option value="all">Global (All Universes)</option>
            </select>
          </div>

          {/* Preset Screens */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 font-medium">Preset Screens</label>
            <select
              value={preset}
              onChange={(e) => {
                setPreset(e.target.value);
                setPage(1);
              }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-300 outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
            >
              <option value="">Custom Filters</option>
              <option value="gainers">🔥 Top Gainers</option>
              <option value="losers">❄️ Top Losers</option>
              <option value="active">⚡ Most Active Volume</option>
              <option value="near-52w-high">🏔️ Near 52W High</option>
              <option value="high-dividend">💰 High Dividend Yield (&gt; 2%)</option>
              <option value="value">💎 Low P/E Value (P/E &lt; 22)</option>
              <option value="growth">🚀 High Growth (Rev &gt; 12%)</option>
            </select>
          </div>

          {/* Cap Bucket */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 font-medium">Market Cap</label>
            <select
              value={capBucket}
              onChange={(e) => {
                setCapBucket(e.target.value);
                setPage(1);
              }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Caps</option>
              <option value="Mega">Mega Cap</option>
              <option value="Large">Large Cap</option>
              <option value="Mid">Mid Cap</option>
              <option value="Small">Small Cap</option>
            </select>
          </div>

          {/* Sector */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 font-medium">Sector</label>
            <select
              value={sector}
              onChange={(e) => {
                setSector(e.target.value);
                setPage(1);
              }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Sectors</option>
              <option value="Technology">Technology</option>
              <option value="Financial Services">Financial Services</option>
              <option value="Financials">Financials (US)</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Consumer Discretionary">Consumer Discretionary</option>
              <option value="Consumer Staples">Consumer Staples</option>
              <option value="Industrials">Industrials</option>
              <option value="Oil Gas & Energy">Oil Gas & Energy</option>
              <option value="Energy">Energy (US)</option>
              <option value="IT">IT (India)</option>
              <option value="Auto">Auto (India)</option>
              <option value="FMCG">FMCG (India)</option>
              <option value="Metals & Mining">Metals & Mining</option>
              <option value="Realty">Realty</option>
            </select>
          </div>
        </div>

        {/* Numeric Quantitative Filter Thresholds */}
        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2.5 pt-2 border-t border-slate-800 text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-400">Min P/E</span>
            <input
              type="number"
              placeholder="e.g. 10"
              value={minPe}
              onChange={(e) => setMinPe(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white font-mono outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-400">Max P/E</span>
            <input
              type="number"
              placeholder="e.g. 35"
              value={maxPe}
              onChange={(e) => setMaxPe(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white font-mono outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-400">Min Div Yield (%)</span>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 2.0"
              value={minDivYield}
              onChange={(e) => setMinDivYield(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white font-mono outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-400">Min ROE (%)</span>
            <input
              type="number"
              placeholder="e.g. 15"
              value={minRoe}
              onChange={(e) => setMinRoe(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white font-mono outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-400">Max Debt/Equity</span>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 1.0"
              value={maxDebtEquity}
              onChange={(e) => setMaxDebtEquity(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white font-mono outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-400">Min Rev Growth (%)</span>
            <input
              type="number"
              step="1"
              placeholder="e.g. 10"
              value={minRevGrowth}
              onChange={(e) => setMinRevGrowth(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white font-mono outline-none"
            />
          </div>

          <div className="flex flex-col justify-end">
            <button
              type="submit"
              className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition"
            >
              Filter
            </button>
          </div>
        </div>
      </form>

      {/* Results Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Found <strong className="text-white">{total}</strong> matches</span>
          <span>Page {page} of {totalPages}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 border-b border-slate-800 font-semibold select-none">
                <th onClick={() => handleSort('symbol')} className="py-2.5 px-3 cursor-pointer hover:text-white">
                  Symbol {sortBy === 'symbol' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('name')} className="py-2.5 px-3 cursor-pointer hover:text-white">
                  Company
                </th>
                <th onClick={() => handleSort('sector')} className="py-2.5 px-3 cursor-pointer hover:text-white">
                  Sector
                </th>
                <th onClick={() => handleSort('price')} className="py-2.5 px-3 text-right cursor-pointer hover:text-white">
                  Price {sortBy === 'price' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('change1d')} className="py-2.5 px-3 text-right cursor-pointer hover:text-white">
                  1D % {sortBy === 'change1d' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('marketCap')} className="py-2.5 px-3 text-right cursor-pointer hover:text-white">
                  Market Cap {sortBy === 'marketCap' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('pe')} className="py-2.5 px-3 text-right cursor-pointer hover:text-white">
                  P/E {sortBy === 'pe' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('roe')} className="py-2.5 px-3 text-right cursor-pointer hover:text-white">
                  ROE % {sortBy === 'roe' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('dividendYield')} className="py-2.5 px-3 text-right cursor-pointer hover:text-white">
                  Div Yield {sortBy === 'dividendYield' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('dist52wHigh')} className="py-2.5 px-3 text-right cursor-pointer hover:text-white">
                  52W High Dist {sortBy === 'dist52wHigh' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 font-sans">
                    Loading screener results...
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 font-sans">
                    No stocks match the selected criteria.
                  </td>
                </tr>
              ) : (
                results.map((s) => {
                  const isPos = (s.changePercent ?? 0) >= 0;
                  return (
                    <tr
                      key={s.symbol}
                      onClick={() => onSelectStock(s.symbol)}
                      className="hover:bg-slate-800/50 cursor-pointer transition"
                    >
                      <td className="py-2.5 px-3 font-bold text-blue-400">{s.symbol}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-300 truncate max-w-[140px]">{s.name}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-400 truncate max-w-[120px]">{s.sector}</td>
                      <td className="py-2.5 px-3 text-right text-slate-100 font-medium">
                        {formatCurrency(s.price, s.currency)}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatPercent(s.changePercent)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300">
                        {formatCompactNumber(s.marketCap, s.currency)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{s.pe ? s.pe.toFixed(1) : 'N/A'}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{s.roe ? `${s.roe}%` : 'N/A'}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{s.dividendYield ? `${s.dividendYield}%` : '0%'}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{s.dist52wHigh !== undefined ? `${s.dist52wHigh}%` : 'N/A'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

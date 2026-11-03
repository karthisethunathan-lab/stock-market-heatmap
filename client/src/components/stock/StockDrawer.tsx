import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/ThemeContext';
import { useStockDetail } from '../../hooks/useStockDetail';
import { StockChart } from './StockChart';
import { KeyStatsGrid } from './KeyStatsGrid';
import { CompanyProfile } from './CompanyProfile';
import { AnalystBar } from './AnalystBar';
import { NewsList } from './NewsList';
import { AddHoldingModal } from '../portfolio/AddHoldingModal';
import { formatCurrency, formatPercent } from '../../lib/utils';
import {
  X,
  Bookmark,
  BookmarkCheck,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export const StockDrawer: React.FC = () => {
  const {
    selectedSymbol,
    closeStock,
    isWatchlisted,
    toggleWatchlist,
    colorMode,
  } = useApp();

  const {
    quote,
    profile,
    metrics,
    candles,
    news,
    loading,
    chartLoading,
    error,
    chartRange,
    setChartRange,
    chartType,
    setChartType,
  } = useStockDetail(selectedSymbol);

  const [addModalOpen, setAddModalOpen] = useState(false);

  // Esc key closes drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedSymbol && !addModalOpen) {
        closeStock();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSymbol, closeStock, addModalOpen]);

  if (!selectedSymbol) return null;

  const isUp = (quote?.changePercent || 0) >= 0;
  const isWatched = isWatchlisted(selectedSymbol);
  const currency = quote?.currency || (selectedSymbol.endsWith('.NS') ? 'INR' : 'USD');

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeStock}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer: Right panel on desktop, Bottom sheet on mobile */}
      <aside
        className="fixed z-50 inset-y-0 right-0 w-full max-w-2xl bg-[#090d16] border-l border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-250 max-md:inset-x-0 max-md:top-12 max-md:bottom-0 max-md:rounded-t-2xl max-md:max-w-none max-md:slide-in-from-bottom"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#0c111e]/90 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3.5">
            {profile?.logo ? (
              <img
                src={profile.logo}
                alt={selectedSymbol}
                className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 p-1.5 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-mono font-bold text-base text-white shadow-md">
                {selectedSymbol.slice(0, 3)}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-mono font-bold text-white tracking-tight">
                  {selectedSymbol}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-sans">
                  {profile?.exchange || quote?.exchange || 'EQUITY'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                  {quote?.marketState || 'REGULAR'}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                {profile?.name || quote?.name || selectedSymbol}
              </p>
            </div>
          </div>

          <button
            onClick={closeStock}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar: Price, Change, + Portfolio, + Watchlist */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 sm:px-5 py-3.5 bg-slate-900/50 border-b border-slate-800">
          <div>
            <div className="text-2xl font-mono font-extrabold text-white">
              {quote ? formatCurrency(quote.price, currency) : '--'}
            </div>
            {quote && (
              <div className={`flex items-center gap-1.5 text-xs font-mono font-semibold ${
                isUp ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{quote.change >= 0 ? `+${quote.change.toFixed(2)}` : quote.change.toFixed(2)}</span>
                <span>({formatPercent(quote.changePercent)})</span>
                <span className="text-slate-500 font-normal">Today</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleWatchlist(selectedSymbol)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                isWatched
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750'
              }`}
            >
              {isWatched ? <BookmarkCheck className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4" />}
              <span>{isWatched ? 'Watchlisted' : 'Watchlist'}</span>
            </button>

            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Holding</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {loading && !quote ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
              <p className="text-sm font-mono">Fetching market data from Yahoo & Finnhub...</p>
            </div>
          ) : error && !quote ? (
            <div className="p-6 rounded-xl border border-rose-800/40 bg-rose-950/20 text-center">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
              <h4 className="text-base font-bold text-white mb-1">Data Unavailable</h4>
              <p className="text-xs text-slate-400">{error}</p>
            </div>
          ) : (
            <>
              {/* Interactive Price Chart */}
              <StockChart
                candles={candles}
                currency={currency}
                previousClose={quote?.previousClose}
                timeframe={chartRange}
                onTimeframeChange={setChartRange}
                chartType={chartType}
                onChartTypeChange={setChartType}
                loading={chartLoading}
                colorMode={colorMode}
              />

              {/* Key Statistics Grid */}
              <KeyStatsGrid quote={quote} metrics={metrics} />

              {/* Company Profile */}
              <CompanyProfile profile={profile} />

              {/* Analyst Recommendation Consensus */}
              <AnalystBar recommendation={metrics?.recommendation} />

              {/* Latest News */}
              <NewsList news={news} />
            </>
          )}
        </div>
      </aside>

      {/* Add Holding Modal */}
      {addModalOpen && (
        <AddHoldingModal
          isOpen={addModalOpen}
          initialSymbol={selectedSymbol}
          initialPrice={quote?.price}
          currency={currency}
          onClose={() => setAddModalOpen(false)}
        />
      )}
    </>
  );
};

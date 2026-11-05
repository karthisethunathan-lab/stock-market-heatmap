import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/ThemeContext';
import { useStockDetail } from '../../hooks/useStockDetail';
import { StockChart } from './StockChart';
import { KeyStatsGrid } from './KeyStatsGrid';
import { CompanyProfile } from './CompanyProfile';
import { NewsList } from './NewsList';
import { FundamentalsTab } from './FundamentalsTab';
import { FinancialsTab } from './FinancialsTab';
import { AnalystsTab } from './AnalystsTab';
import { PeersTab } from './PeersTab';
import { CompareModal } from './CompareModal';
import { PriceAlertsModal } from '../alerts/PriceAlertsModal';
import { AddHoldingModal } from '../portfolio/AddHoldingModal';
import { formatCurrency, formatPercent } from '../../lib/utils';
import {
  X,
  Bookmark,
  BookmarkCheck,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Bell,
  Scale,
} from 'lucide-react';

type DrawerTab = 'overview' | 'fundamentals' | 'financials' | 'analysts' | 'news' | 'peers';

export const StockDrawer: React.FC = () => {
  const {
    selectedSymbol,
    selectStock,
    closeStock,
    isWatchlisted,
    toggleWatchlist,
  } = useApp();

  const {
    quote,
    profile,
    metrics,
    candles,
    news,
    chartLoading,
    chartRange,
    setChartRange,
    chartType,
    setChartType,
  } = useStockDetail(selectedSymbol);

  const [activeTab, setActiveTab] = useState<DrawerTab>('overview');
  const [logoError, setLogoError] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [alertsModalOpen, setAlertsModalOpen] = useState(false);

  useEffect(() => {
    setLogoError(false);
  }, [selectedSymbol]);

  // Synchronize URL with /stock/:symbol deep-linking
  useEffect(() => {
    if (selectedSymbol) {
      const url = new URL(window.location.href);
      if (!url.pathname.includes(`/stock/${selectedSymbol}`)) {
        window.history.pushState({}, '', `/stock/${selectedSymbol}`);
      }
    }
  }, [selectedSymbol]);

  // Handle drawer close and reset URL
  const handleClose = () => {
    closeStock();
    const url = new URL(window.location.href);
    if (url.pathname.startsWith('/stock/')) {
      window.history.pushState({}, '', '/');
    }
  };

  // Esc key closes drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedSymbol && !addModalOpen && !compareModalOpen && !alertsModalOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSymbol, addModalOpen, compareModalOpen, alertsModalOpen]);

  if (!selectedSymbol) return null;

  const isUp = (quote?.changePercent || 0) >= 0;
  const isWatched = isWatchlisted(selectedSymbol);
  const currency = quote?.currency || (selectedSymbol.endsWith('.NS') ? 'INR' : 'USD');

  // 52-week slider calculation
  const curPrice = quote?.price || 100;
  const high52 = quote?.fiftyTwoWeekHigh || curPrice * 1.15;
  const low52 = quote?.fiftyTwoWeekLow || curPrice * 0.75;
  const range52 = high52 - low52 || 1;
  const progress52 = Math.min(100, Math.max(0, ((curPrice - low52) / range52) * 100));


  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer: Right panel on desktop, Fullscreen on mobile */}
      <aside
        className="fixed z-50 inset-y-0 right-0 w-full max-w-3xl bg-[#090d16] border-l border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-250 max-md:inset-0 max-md:max-w-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#0c111e]/95 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3.5">
            {!logoError && profile?.logo ? (
              <img
                src={profile.logo}
                alt={selectedSymbol}
                className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 p-1.5 object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-mono font-bold text-base text-white shadow-md">
                {selectedSymbol.replace('.NS', '').slice(0, 3)}
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
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase ${
                    quote?.marketState === 'REGULAR'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {quote?.marketState || 'REGULAR'}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                {profile?.name || quote?.name || selectedSymbol}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar: Price, Change, Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-slate-900/60 border-b border-slate-800">
          <div>
            <div className="text-2xl font-mono font-extrabold text-white">
              {quote ? formatCurrency(quote.price, currency) : '--'}
            </div>
            {quote && (
              <div
                className={`flex items-center gap-1.5 text-xs font-mono font-semibold ${
                  isUp ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{quote.change >= 0 ? `+${quote.change.toFixed(2)}` : quote.change.toFixed(2)}</span>
                <span>({formatPercent(quote.changePercent)})</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Compare Button */}
            <button
              onClick={() => setCompareModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold transition"
              title="Compare with other stocks"
            >
              <Scale className="w-3.5 h-3.5 text-blue-400" />
              <span>Compare</span>
            </button>

            {/* Price Alert Button */}
            <button
              onClick={() => setAlertsModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold transition"
              title="Set Price Alert"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Alert</span>
            </button>

            {/* Watchlist Toggle */}
            <button
              onClick={() => toggleWatchlist(selectedSymbol)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                isWatched
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750'
              }`}
            >
              {isWatched ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{isWatched ? 'Watchlisted' : 'Watchlist'}</span>
            </button>

            {/* Add Holding Button */}
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Holding</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation: Overview | Fundamentals | Financials | Analysts | News | Peers */}
        <div className="flex items-center px-4 bg-slate-950/90 border-b border-slate-800 text-xs font-semibold overflow-x-auto scrollbar-thin">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'fundamentals', label: 'Fundamentals' },
            { id: 'financials', label: 'Financials' },
            { id: 'analysts', label: 'Analysts' },
            { id: 'news', label: 'News' },
            { id: 'peers', label: 'Peers' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DrawerTab)}
              className={`px-4 py-2.5 border-b-2 transition capitalize whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400 font-bold bg-blue-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drawer Body - Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="p-4 sm:p-5 flex flex-col gap-5">
              {/* 52-Week Range Slider Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>52-Week Range</span>
                  <span className="font-mono text-slate-200">
                    {formatCurrency(curPrice, currency)} ({progress52.toFixed(0)}% of range)
                  </span>
                </div>
                <div className="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${progress52}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>52W Low: {formatCurrency(low52, currency)}</span>
                  <span>52W High: {formatCurrency(high52, currency)}</span>
                </div>
              </div>

              {/* Chart */}
              <StockChart
                candles={candles}
                previousClose={quote?.previousClose}
                currency={currency}
                timeframe={chartRange}
                onTimeframeChange={setChartRange}
                chartType={chartType}
                onChartTypeChange={setChartType}
                loading={chartLoading}
              />

              {/* Key Stats Grid */}
              <KeyStatsGrid quote={quote} metrics={metrics} />

              {/* Company Profile Description */}
              <CompanyProfile profile={profile} />
            </div>
          )}

          {activeTab === 'fundamentals' && <FundamentalsTab symbol={selectedSymbol} />}

          {activeTab === 'financials' && <FinancialsTab symbol={selectedSymbol} />}

          {activeTab === 'analysts' && <AnalystsTab symbol={selectedSymbol} />}

          {activeTab === 'news' && (
            <div className="p-4 sm:p-5">
              <NewsList news={news} />
            </div>
          )}

          {activeTab === 'peers' && (
            <PeersTab symbol={selectedSymbol} onSelectStock={(sym) => selectStock(sym)} />
          )}
        </div>
      </aside>

      {/* Holding Modal */}
      <AddHoldingModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        initialSymbol={selectedSymbol}
        initialPrice={quote?.price}
        currency={currency}
      />

      {/* Compare Modal */}
      <CompareModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        initialSymbol={selectedSymbol}
        onSelectStock={(sym) => selectStock(sym)}
      />

      {/* Price Alerts Modal */}
      <PriceAlertsModal
        isOpen={alertsModalOpen}
        onClose={() => setAlertsModalOpen(false)}
        defaultSymbol={selectedSymbol}
        currentPrice={quote?.price || 100}
      />
    </>
  );
};

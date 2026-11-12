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
import { CryptoTokenomicsTab } from './CryptoTokenomicsTab';
import { ForexMechanicsTab } from './ForexMechanicsTab';
import { ForexCrossRatesTab } from './ForexCrossRatesTab';
import { CommoditySpecsTab } from './CommoditySpecsTab';
import { IndexMechanicsTab } from './IndexMechanicsTab';
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

type DrawerTab =
  | 'overview'
  | 'fundamentals'
  | 'financials'
  | 'analysts'
  | 'news'
  | 'peers'
  | 'tokenomics'
  | 'mechanics'
  | 'crossrates'
  | 'specs'
  | 'index_mechanics';

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

  const isCrypto = Boolean(selectedSymbol && selectedSymbol.includes('-USD'));
  const isForex = Boolean(selectedSymbol && selectedSymbol.includes('=X'));
  const isCommodity = Boolean(selectedSymbol && selectedSymbol.includes('=F'));
  const isIndex = Boolean(
    selectedSymbol &&
      (selectedSymbol.startsWith('^') ||
        selectedSymbol === '000001.SS' ||
        selectedSymbol === 'FTSEMIB.MI' ||
        selectedSymbol === 'DX-Y.NYB')
  );

  // Ensure active tab is valid for current asset type
  useEffect(() => {
    setActiveTab('overview');
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
  const currency = isForex ? 'FX' : quote?.currency || (selectedSymbol.endsWith('.NS') ? 'INR' : 'USD');

  // 52-week slider calculation
  const curPrice = quote?.price || 100;
  const high52 = quote?.fiftyTwoWeekHigh || curPrice * 1.15;
  const low52 = quote?.fiftyTwoWeekLow || curPrice * 0.75;
  const progress52 = high52 === low52 ? 50 : Math.max(0, Math.min(100, ((curPrice - low52) / (high52 - low52)) * 100));

  // Clean display symbol
  const cleanDisplay = isIndex
    ? quote?.name || selectedSymbol.replace('^', '')
    : isForex
      ? selectedSymbol.replace('=X', '').replace(/([A-Z]{3})([A-Z]{3})/, '$1 / $2')
      : isCrypto
        ? selectedSymbol.replace('-USD', '')
        : isCommodity
          ? selectedSymbol.replace('=F', '')
          : selectedSymbol.replace('.NS', '');

  // Dynamic tabs according to asset class
  const tabs: Array<{ id: DrawerTab; label: string }> = isIndex
    ? [
        { id: 'overview', label: 'Overview' },
        { id: 'index_mechanics', label: 'Benchmark Specs' },
        { id: 'news', label: 'Global News' },
        { id: 'peers', label: 'Regional Indices' },
      ]
    : isCommodity
    ? [
        { id: 'overview', label: 'Overview' },
        { id: 'specs', label: 'Contract Specs' },
        { id: 'news', label: 'Commodity News' },
        { id: 'peers', label: 'Related Commodities' },
      ]
    : isCrypto
    ? [
        { id: 'overview', label: 'Overview' },
        { id: 'tokenomics', label: 'Tokenomics & Supply' },
        { id: 'news', label: 'Crypto News' },
        { id: 'peers', label: 'Related Coins' },
      ]
    : isForex
      ? [
          { id: 'overview', label: 'Overview' },
          { id: 'mechanics', label: 'Currency Mechanics' },
          { id: 'news', label: 'Macro News' },
          { id: 'crossrates', label: 'Cross Rates' },
        ]
      : [
          { id: 'overview', label: 'Overview' },
          { id: 'fundamentals', label: 'Fundamentals' },
          { id: 'financials', label: 'Financials' },
          { id: 'analysts', label: 'Analysts' },
          { id: 'news', label: 'News' },
          { id: 'peers', label: 'Peers' },
        ];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity"
        onClick={handleClose}
      />

      <aside className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-3xl bg-[#0b101d] border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#090d16]/95">
          <div className="flex items-center gap-3">
            {/* Logo / Asset Avatar */}
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
              {profile?.logo && !logoError ? (
                <img
                  src={profile.logo}
                  alt={profile.name || selectedSymbol}
                  className="w-full h-full object-contain p-1"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="font-mono font-bold text-xs text-blue-400">
                  {cleanDisplay.slice(0, 3)}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono font-bold text-lg text-white tracking-wide">
                  {cleanDisplay}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                  {isIndex ? 'Global Index' : isCrypto ? 'Crypto' : isForex ? 'Forex' : isCommodity ? 'Commodity' : quote?.exchange || (selectedSymbol.endsWith('.NS') ? 'NSE' : 'US')}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                {profile?.name || quote?.name || selectedSymbol}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Price & Quick Actions Bar */}
        <div className="px-5 py-3.5 bg-slate-900/50 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-2.5">
            <div className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
              {quote ? formatCurrency(quote.price, currency) : '--'}
            </div>
            {quote && (
              <div
                className={`flex items-center gap-1.5 text-xs font-mono font-semibold ${
                  isUp ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>
                  {quote.change >= 0
                    ? `+${isForex ? quote.change.toFixed(4) : quote.change.toFixed(2)}`
                    : isForex ? quote.change.toFixed(4) : quote.change.toFixed(2)}
                </span>
                <span>({formatPercent(quote.changePercent)})</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Compare Button */}
            <button
              onClick={() => setCompareModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold transition"
              title="Compare with other assets"
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

        {/* Tab Navigation */}
        <div className="flex items-center px-4 bg-slate-950/90 border-b border-slate-800 text-xs font-semibold overflow-x-auto scrollbar-thin">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

              {/* Company / Asset Profile Description */}
              <CompanyProfile profile={profile} />
            </div>
          )}

          {/* Index Mechanics Tab */}
          {activeTab === 'index_mechanics' && <IndexMechanicsTab symbol={selectedSymbol} />}

          {/* Crypto Tokenomics Tab */}
          {activeTab === 'tokenomics' && <CryptoTokenomicsTab symbol={selectedSymbol} />}

          {/* Commodity Specs Tab */}
          {activeTab === 'specs' && <CommoditySpecsTab symbol={selectedSymbol} />}

          {/* Forex Mechanics Tab */}
          {activeTab === 'mechanics' && <ForexMechanicsTab symbol={selectedSymbol} />}

          {/* Forex Cross Rates Tab */}
          {activeTab === 'crossrates' && <ForexCrossRatesTab symbol={selectedSymbol} />}

          {/* Stocks Only Tabs */}
          {activeTab === 'fundamentals' && <FundamentalsTab symbol={selectedSymbol} />}
          {activeTab === 'financials' && <FinancialsTab symbol={selectedSymbol} />}
          {activeTab === 'analysts' && <AnalystsTab symbol={selectedSymbol} />}

          {/* News Tab */}
          {activeTab === 'news' && (
            <div className="p-4 sm:p-5">
              <NewsList news={news} />
            </div>
          )}

          {/* Peers Tab */}
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

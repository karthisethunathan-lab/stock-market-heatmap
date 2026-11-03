import React from 'react';
import { AppProvider, useApp } from './context/ThemeContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HeatmapView } from './components/heatmap/HeatmapView';
import { PortfolioPage } from './components/portfolio/PortfolioPage';
import { WatchlistView } from './components/watchlist/WatchlistView';
import { StockDrawer } from './components/stock/StockDrawer';
import { ToastContainer } from './components/common/Toast';

const MainLayout: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="flex flex-col min-h-screen bg-[#080b12] text-slate-100 font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {activeTab === 'heatmap' && <HeatmapView />}
        {activeTab === 'portfolios' && <PortfolioPage />}
        {activeTab === 'watchlist' && <WatchlistView />}
      </main>

      <Footer />
      <StockDrawer />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/ThemeContext';
import { TopLevelTab } from '../../types';
import {
  Search,
  Sun,
  Moon,
  Eye,
  TrendingUp,
  Briefcase,
  Bookmark,
  Activity,
  SlidersHorizontal,
  Flame,
  Coins,
  ArrowLeftRight,
} from 'lucide-react';
import { SearchModal } from './SearchModal';

export const Navbar: React.FC = () => {
  const {
    theme,
    toggleTheme,
    colorMode,
    toggleColorMode,
    activeTab,
    setActiveTab,
    watchlist,
  } = useApp();

  const [searchOpen, setSearchOpen] = useState(false);

  // Global hotkey: Ctrl+K or / to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems: Array<{ id: TopLevelTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'us', label: 'US Stocks', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'in', label: 'Indian Stocks', icon: <Flame className="w-4 h-4 text-orange-400" /> },
    { id: 'crypto', label: 'Crypto', icon: <Coins className="w-4 h-4 text-amber-400" /> },
    { id: 'forex', label: 'Forex', icon: <ArrowLeftRight className="w-4 h-4 text-cyan-400" /> },
    { id: 'portfolios', label: 'Portfolios', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'watchlist', label: 'Watchlist', icon: <Bookmark className="w-4 h-4" />, badge: watchlist.length },
    { id: 'screener', label: 'Screener', icon: <SlidersHorizontal className="w-4 h-4" /> },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#090d16]/95 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('us')}
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg border border-blue-500/30 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-mono font-bold tracking-wider text-base text-white flex items-center gap-1.5">
                  MARKET<span className="text-blue-400">PULSE</span>
                </span>
                <span className="text-[10px] text-slate-400 tracking-tight font-medium uppercase">
                  Heatmap & Analytics
                </span>
              </div>
            </button>

            {/* Desktop Navigation Tabs: US Stocks | Indian Stocks | Portfolios | Watchlist | Screener */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                      isActive
                        ? 'bg-slate-800 text-blue-400 shadow-sm border border-slate-700/60 font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search Bar & Terminal Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 text-xs transition-colors group"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
              <span className="hidden sm:inline">Search tickers...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 rounded border border-slate-700 text-slate-400">
                /
              </kbd>
            </button>

            {/* Colorblind toggle */}
            <button
              onClick={toggleColorMode}
              title={`Color mode: ${colorMode === 'standard' ? 'Standard (Red/Green)' : 'Colorblind (Orange/Blue)'}`}
              className={`p-2 rounded-lg border text-xs font-mono transition-colors flex items-center gap-1.5 ${
                colorMode === 'colorblind'
                  ? 'bg-blue-950/60 border-blue-600 text-blue-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden lg:inline text-[11px]">
                {colorMode === 'colorblind' ? 'Blue/Org' : 'Red/Grn'}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 px-2 py-1.5 bg-[#090d16] overflow-x-auto scrollbar-thin">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap ${
                activeTab === item.id ? 'text-blue-400 bg-slate-800 font-bold' : 'text-slate-400'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
};

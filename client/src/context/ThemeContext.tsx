import React, { createContext, useContext, useEffect, useState } from 'react';
import { ColorMode, ThemeMode, TopLevelTab } from '../types';
import { storage } from '../lib/storage';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  colorMode: ColorMode;
  toggleColorMode: () => void;
  selectedSymbol: string | null;
  openStock: (symbol: string) => void;
  selectStock: (symbol: string) => void;
  closeStock: () => void;
  activeTab: TopLevelTab;
  setActiveTab: (tab: TopLevelTab) => void;
  watchlist: string[];
  toggleWatchlist: (symbol: string) => Promise<void>;
  isWatchlisted: (symbol: string) => boolean;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function getInitialTabFromURL(): TopLevelTab {
  if (typeof window === 'undefined') return 'us';
  const path = window.location.pathname.toLowerCase();
  if (path.includes('/in') || path.includes('/india')) return 'in';
  if (path.includes('/crypto')) return 'crypto';
  if (path.includes('/forex') || path.includes('/fx')) return 'forex';
  if (path.includes('/commodit')) return 'commodities';
  if (path.includes('/portfolio')) return 'portfolios';
  if (path.includes('/watchlist')) return 'watchlist';
  if (path.includes('/screener')) return 'screener';
  return 'us';
}

function getInitialSymbolFromURL(): string | null {
  if (typeof window === 'undefined') return null;
  const match = window.location.pathname.match(/\/stock\/([A-Za-z0-9_.-]+)/i);
  return match ? match[1].toUpperCase() : null;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('mp_theme') as ThemeMode) || 'dark';
  });

  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    return (localStorage.getItem('mp_colormode') as ColorMode) || 'standard';
  });

  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(getInitialSymbolFromURL);
  const [activeTab, setActiveTabState] = useState<TopLevelTab>(getInitialTabFromURL);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Apply dark theme to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('mp_theme', theme);
  }, [theme]);

  // Persist colorMode
  useEffect(() => {
    localStorage.setItem('mp_colormode', colorMode);
  }, [colorMode]);

  // Listen to browser Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const tab = getInitialTabFromURL();
      setActiveTabState(tab);
      const sym = getInitialSymbolFromURL();
      setSelectedSymbol(sym);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setActiveTab = (tab: TopLevelTab) => {
    setActiveTabState(tab);
    if (!window.location.pathname.startsWith('/stock/')) {
      window.history.pushState({}, '', `/${tab}`);
    }
  };

  // Load watchlist on mount
  useEffect(() => {
    storage.getWatchlist().then((list) => setWatchlist(list));
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleColorMode = () => {
    setColorMode((prev) => (prev === 'standard' ? 'colorblind' : 'standard'));
  };

  const openStock = (symbol: string) => {
    setSelectedSymbol(symbol.toUpperCase());
  };

  const selectStock = (symbol: string) => {
    setSelectedSymbol(symbol.toUpperCase());
  };

  const closeStock = () => {
    setSelectedSymbol(null);
  };

  const toggleWatchlist = async (symbol: string) => {
    const sym = symbol.toUpperCase();
    const updated = watchlist.includes(sym)
      ? watchlist.filter((s) => s !== sym)
      : [...watchlist, sym];
    setWatchlist(updated);
    await storage.saveWatchlist(updated);
    showToast(watchlist.includes(sym) ? `Removed ${sym} from Watchlist` : `Added ${sym} to Watchlist`, 'success');
  };

  const isWatchlisted = (symbol: string) => {
    return watchlist.includes(symbol.toUpperCase());
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        colorMode,
        toggleColorMode,
        selectedSymbol,
        openStock,
        selectStock,
        closeStock,
        activeTab,
        setActiveTab,
        watchlist,
        toggleWatchlist,
        isWatchlisted,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

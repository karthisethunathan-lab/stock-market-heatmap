import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { searchStocks } from '../../lib/api';
import { SearchResult } from '../../types';
import { useApp } from '../../context/ThemeContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { openStock } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    let isCurrent = true;
    setLoading(true);

    searchStocks(debouncedQuery).then((data) => {
      if (isCurrent) {
        setResults(data);
        setLoading(false);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [debouncedQuery]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="relative flex items-center border-b border-slate-800 px-4 py-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search US or Indian stocks by symbol or company name..."
            className="w-full bg-transparent text-white placeholder-slate-500 text-base focus:outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-emerald-400 animate-spin mr-2" />}
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/50 p-2">
          {query.trim().length === 0 ? (
            <div className="py-8 px-4 text-center text-slate-400 text-sm">
              Type a ticker like <span className="text-emerald-400 font-mono font-semibold">AAPL</span>,{' '}
              <span className="text-emerald-400 font-mono font-semibold">NVDA</span>, or{' '}
              <span className="text-emerald-400 font-mono font-semibold">RELIANCE.NS</span>
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="py-8 px-4 text-center text-slate-400 text-sm">
              No matching tickers found for "{query}".
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.symbol}
                onClick={() => {
                  openStock(item.symbol);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/80 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-sm text-emerald-400">
                    {item.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {item.symbol}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {item.exchange}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                      {item.name}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

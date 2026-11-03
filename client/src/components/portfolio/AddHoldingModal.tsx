import React, { useState, useEffect } from 'react';
import { usePortfolios } from '../../hooks/usePortfolios';
import { useApp } from '../../context/ThemeContext';
import { useDebounce } from '../../hooks/useDebounce';
import { searchStocks } from '../../lib/api';
import { SearchResult, PortfolioHolding } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { X, Search, PlusCircle, Save } from 'lucide-react';

interface AddHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSymbol?: string;
  initialPrice?: number;
  currency?: string;
  holdingToEdit?: PortfolioHolding | null;
}

export const AddHoldingModal: React.FC<AddHoldingModalProps> = ({
  isOpen,
  onClose,
  initialSymbol = '',
  initialPrice,
  currency = 'USD',
  holdingToEdit = null,
}) => {
  const { portfolios, activePortfolioId, addHolding, editHolding } = usePortfolios();
  const { showToast } = useApp();

  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>(activePortfolioId || portfolios[0]?.id || '');
  const [symbol, setSymbol] = useState(holdingToEdit?.symbol || initialSymbol);
  const [name, setName] = useState(holdingToEdit?.name || '');
  const [sector, setSector] = useState(holdingToEdit?.sector || 'Technology');
  const [quantity, setQuantity] = useState<string>(holdingToEdit ? String(holdingToEdit.quantity) : '10');
  const [buyPrice, setBuyPrice] = useState<string>(
    holdingToEdit ? String(holdingToEdit.buyPrice) : initialPrice ? String(initialPrice) : '150.00'
  );
  const [buyDate, setBuyDate] = useState<string>(
    holdingToEdit?.buyDate || new Date().toISOString().slice(0, 10)
  );

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSymbol = useDebounce(symbol, 300);

  useEffect(() => {
    if (activePortfolioId) {
      setSelectedPortfolioId(activePortfolioId);
    }
  }, [activePortfolioId]);

  // Autocomplete search when user types symbol
  useEffect(() => {
    if (!debouncedSymbol.trim() || holdingToEdit) {
      setSearchResults([]);
      return;
    }

    let isMounted = true;
    setIsSearching(true);
    searchStocks(debouncedSymbol).then((results) => {
      if (isMounted) {
        setSearchResults(results.slice(0, 5));
        setIsSearching(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [debouncedSymbol, holdingToEdit]);

  if (!isOpen) return null;

  const numQty = parseFloat(quantity) || 0;
  const numPrice = parseFloat(buyPrice) || 0;
  const totalInvestment = numQty * numPrice;
  const holdingCurrency = symbol.endsWith('.NS') || symbol.endsWith('.BO') ? 'INR' : currency;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) {
      showToast('Symbol is required', 'error');
      return;
    }
    if (numQty <= 0) {
      showToast('Quantity must be greater than 0', 'error');
      return;
    }
    if (numPrice <= 0) {
      showToast('Buy price must be greater than 0', 'error');
      return;
    }

    if (holdingToEdit) {
      editHolding(selectedPortfolioId, {
        ...holdingToEdit,
        symbol: symbol.toUpperCase().trim(),
        name: name.trim() || symbol.toUpperCase(),
        sector,
        quantity: numQty,
        buyPrice: numPrice,
        buyDate,
        currency: holdingCurrency,
      });
    } else {
      addHolding(selectedPortfolioId, {
        symbol: symbol.toUpperCase().trim(),
        name: name.trim() || symbol.toUpperCase(),
        sector,
        quantity: numQty,
        buyPrice: numPrice,
        buyDate,
        currency: holdingCurrency,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-mono font-bold text-white text-base">
              {holdingToEdit ? `Edit Holding: ${holdingToEdit.symbol}` : 'Add Portfolio Holding'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-sans">
          
          {/* Portfolio Selector */}
          <div>
            <label className="block text-slate-400 font-mono text-[11px] mb-1">
              Select Portfolio
            </label>
            <select
              value={selectedPortfolioId}
              onChange={(e) => setSelectedPortfolioId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            >
              {portfolios.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Symbol Autocomplete Input */}
          <div className="relative">
            <label className="block text-slate-400 font-mono text-[11px] mb-1">
              Ticker Symbol
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g. AAPL, NVDA, RELIANCE.NS"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-emerald-500 pr-8"
              />
              {isSearching ? (
                <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
              ) : (
                <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>

            {/* Autocomplete dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg shadow-xl overflow-hidden divide-y divide-slate-800">
                {searchResults.map((item) => (
                  <button
                    key={item.symbol}
                    type="button"
                    onClick={() => {
                      setSymbol(item.symbol);
                      setName(item.name);
                      setSearchResults([]);
                    }}
                    className="w-full text-left p-2 hover:bg-slate-800 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-emerald-400 mr-2">{item.symbol}</span>
                      <span className="text-slate-300 text-xs truncate">{item.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase">{item.exchange}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Company Name & Sector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">Company Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apple Inc."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">Sector</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Technology">Technology</option>
                <option value="Communication Services">Communication Services</option>
                <option value="Consumer Discretionary">Consumer Discretionary</option>
                <option value="Consumer Staples">Consumer Staples</option>
                <option value="Financials">Financials</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Energy">Energy</option>
                <option value="Industrials">Industrials</option>
                <option value="Utilities">Utilities</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Basic Materials">Basic Materials</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Quantity & Buy Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">Quantity</label>
              <input
                type="number"
                step="any"
                min="0.001"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">
                Buy Price ({holdingCurrency})
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Buy Date */}
          <div>
            <label className="block text-slate-400 font-mono text-[11px] mb-1">Buy Date</label>
            <input
              type="date"
              value={buyDate}
              onChange={(e) => setBuyDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Live Investment Summary Preview */}
          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-between font-mono">
            <span className="text-slate-400">Total Investment:</span>
            <span className="text-sm font-bold text-emerald-400">
              {formatCurrency(totalInvestment, holdingCurrency)}
            </span>
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{holdingToEdit ? 'Save Changes' : 'Add to Portfolio'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

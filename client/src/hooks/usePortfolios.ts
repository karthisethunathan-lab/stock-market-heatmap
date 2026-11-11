import { useState, useEffect, useMemo, useCallback } from 'react';
import { Portfolio, PortfolioHolding, HoldingCalculated, SectorGroup } from '../types';
import { storage } from '../lib/storage';
import { fetchQuote } from '../lib/api';
import { useApp } from '../context/ThemeContext';

export function usePortfolios(baseCurrency: 'USD' | 'INR' = 'USD') {
  const { showToast } = useApp();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [activePortfolioId, setActivePortfolioId] = useState<string>('');
  const [priceMap, setPriceMap] = useState<Map<string, { price: number; changePercent: number }>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [usdInrRate, setUsdInrRate] = useState<number>(93.68);

  // Fetch live USD/INR exchange rate on mount
  useEffect(() => {
    fetchQuote('INR=X').then((res) => {
      if (res.data?.price && res.data.price > 50) {
        setUsdInrRate(res.data.price);
      }
    }).catch(() => {});
  }, []);

  // Load portfolios from storage
  useEffect(() => {
    storage.getPortfolios().then((list) => {
      setPortfolios(list);
      if (list.length > 0) {
        setActivePortfolioId(list[0].id);
      }
      setLoading(false);
    });
  }, []);

  const activePortfolio = useMemo(() => {
    return portfolios.find((p) => p.id === activePortfolioId) || portfolios[0];
  }, [portfolios, activePortfolioId]);

  // Fetch live prices for all holdings in the active portfolio
  const refreshPrices = useCallback(async () => {
    if (!activePortfolio || activePortfolio.holdings.length === 0) return;

    const symbols = Array.from(new Set(activePortfolio.holdings.map((h) => h.symbol)));
    const updates = new Map<string, { price: number; changePercent: number }>();

    await Promise.allSettled(
      symbols.map(async (sym) => {
        try {
          const res = await fetchQuote(sym);
          if (res.data?.price) {
            updates.set(sym.toUpperCase(), {
              price: res.data.price,
              changePercent: res.data.changePercent || 0,
            });
          }
        } catch {
          // fallback to holding buyPrice if offline
        }
      })
    );

    setPriceMap((prev) => {
      const next = new Map(prev);
      updates.forEach((val, key) => next.set(key, val));
      return next;
    });
  }, [activePortfolio]);

  useEffect(() => {
    refreshPrices();
  }, [activePortfolio?.id]);

  // Save portfolios helper
  const persistPortfolios = async (updated: Portfolio[]) => {
    setPortfolios(updated);
    await storage.savePortfolios(updated);
  };

  const createPortfolio = async (name: string) => {
    if (!name.trim()) return;
    const newPort: Portfolio = {
      id: `portfolio-${Date.now()}`,
      name: name.trim(),
      createdAt: new Date().toISOString(),
      holdings: [],
    };
    const updated = [...portfolios, newPort];
    await persistPortfolios(updated);
    setActivePortfolioId(newPort.id);
    showToast(`Created portfolio "${name}"`, 'success');
  };

  const renamePortfolio = async (id: string, newName: string) => {
    if (!newName.trim()) return;
    const updated = portfolios.map((p) => (p.id === id ? { ...p, name: newName.trim() } : p));
    await persistPortfolios(updated);
    showToast('Portfolio renamed', 'success');
  };

  const deletePortfolio = async (id: string) => {
    if (portfolios.length <= 1) {
      showToast('Cannot delete the last remaining portfolio', 'error');
      return;
    }
    const updated = portfolios.filter((p) => p.id !== id);
    await persistPortfolios(updated);
    setActivePortfolioId(updated[0].id);
    showToast('Portfolio deleted', 'info');
  };

  const addHolding = async (portfolioId: string, holdingData: Omit<PortfolioHolding, 'id'>) => {
    const newHolding: PortfolioHolding = {
      ...holdingData,
      id: `holding-${Date.now()}`,
    };

    const updated = portfolios.map((p) => {
      if (p.id === portfolioId) {
        return {
          ...p,
          holdings: [...p.holdings, newHolding],
        };
      }
      return p;
    });

    await persistPortfolios(updated);
    showToast(`Added ${newHolding.symbol} to portfolio`, 'success');
    refreshPrices();
  };

  const editHolding = async (portfolioId: string, updatedHolding: PortfolioHolding) => {
    const updated = portfolios.map((p) => {
      if (p.id === portfolioId) {
        return {
          ...p,
          holdings: p.holdings.map((h) => (h.id === updatedHolding.id ? updatedHolding : h)),
        };
      }
      return p;
    });

    await persistPortfolios(updated);
    showToast(`Updated ${updatedHolding.symbol}`, 'success');
  };

  const deleteHolding = async (portfolioId: string, holdingId: string) => {
    const updated = portfolios.map((p) => {
      if (p.id === portfolioId) {
        return {
          ...p,
          holdings: p.holdings.filter((h) => h.id !== holdingId),
        };
      }
      return p;
    });

    await persistPortfolios(updated);
    showToast('Holding removed', 'info');
  };

  const replaceHoldings = async (portfolioId: string, newHoldings: PortfolioHolding[]) => {
    const updated = portfolios.map((p) => {
      if (p.id === portfolioId) {
        return {
          ...p,
          holdings: [...p.holdings, ...newHoldings],
        };
      }
      return p;
    });

    await persistPortfolios(updated);
    showToast(`Imported ${newHoldings.length} holdings`, 'success');
    refreshPrices();
  };

  // Calculations for active portfolio with Base Currency conversion
  const calculated = useMemo(() => {
    if (!activePortfolio || activePortfolio.holdings.length === 0) {
      return {
        holdings: [] as HoldingCalculated[],
        totalInvested: 0,
        totalCurrentValue: 0,
        totalPnl: 0,
        totalPnlPercent: 0,
        dayPnl: 0,
        dayPnlPercent: 0,
        hasMixedCurrencies: false,
        primaryCurrency: baseCurrency,
        stockAllocations: [] as { name: string; value: number }[],
        sectorAllocations: [] as { name: string; value: number }[],
        portfolioSectors: [] as SectorGroup[],
      };
    }

    const effectiveRate = usdInrRate > 0 ? usdInrRate : 94.47;

    let totalInvested = 0;
    let totalCurrentValue = 0;
    let totalDayPnl = 0;

    // First pass: compute values with live base currency conversion
    const intermediate = activePortfolio.holdings.map((h) => {
      const isHoldingIndian = h.symbol.toUpperCase().endsWith('.NS') || h.currency === 'INR';
      const holdingCurrency = isHoldingIndian ? 'INR' : 'USD';

      const live = priceMap.get(h.symbol.toUpperCase());
      const rawCurrentPrice = live ? live.price : h.buyPrice;
      const dayChangePercent = live ? live.changePercent : 0;

      // Currency conversion factor
      let fxRate = 1.0;
      if (baseCurrency === 'INR' && holdingCurrency === 'USD') {
        fxRate = effectiveRate;
      } else if (baseCurrency === 'USD' && holdingCurrency === 'INR') {
        fxRate = 1.0 / effectiveRate;
      }

      const displayBuyPrice = Number((h.buyPrice * fxRate).toFixed(2));
      const displayCurrentPrice = Number((rawCurrentPrice * fxRate).toFixed(2));

      const investedValue = Number((h.quantity * displayBuyPrice).toFixed(2));
      const currentValue = Number((h.quantity * displayCurrentPrice).toFixed(2));
      const pnl = Number((currentValue - investedValue).toFixed(2));
      const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
      const dayPnl = Number((currentValue * (dayChangePercent / 100)).toFixed(2));

      totalInvested += investedValue;
      totalCurrentValue += currentValue;
      totalDayPnl += dayPnl;

      return {
        ...h,
        buyPrice: displayBuyPrice,
        currentPrice: displayCurrentPrice,
        currency: baseCurrency,
        dayChangePercent,
        investedValue,
        currentValue,
        pnl,
        pnlPercent,
        dayPnl,
      };
    });

    // Second pass: compute weights
    const calculatedHoldings: HoldingCalculated[] = intermediate.map((item) => ({
      ...item,
      weight: totalCurrentValue > 0 ? (item.currentValue / totalCurrentValue) * 100 : 0,
    }));

    const totalPnl = totalCurrentValue - totalInvested;
    const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
    const dayPnlPercent = totalCurrentValue > 0 ? (totalDayPnl / (totalCurrentValue - totalDayPnl)) * 100 : 0;

    // Allocation by stock
    const stockAllocations = calculatedHoldings.map((h) => ({
      name: h.symbol.replace('.NS', ''),
      value: Math.round(h.currentValue * 100) / 100,
    })).sort((a, b) => b.value - a.value);

    // Allocation by sector
    const sectorMap = new Map<string, number>();
    calculatedHoldings.forEach((h) => {
      const sec = h.sector || 'Other';
      sectorMap.set(sec, (sectorMap.get(sec) || 0) + h.currentValue);
    });

    const sectorAllocations = Array.from(sectorMap.entries())
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);

    // Portfolio Heatmap Treemap sectors
    const portSectorGroupMap = new Map<string, SectorGroup>();
    calculatedHoldings.forEach((h) => {
      const secName = h.sector || 'Other';
      if (!portSectorGroupMap.has(secName)) {
        portSectorGroupMap.set(secName, {
          name: secName,
          marketCap: 0,
          stocks: [],
        });
      }
      const g = portSectorGroupMap.get(secName)!;
      g.stocks.push({
        symbol: h.symbol,
        name: h.name,
        sector: h.sector,
        price: h.currentPrice,
        changePercent: h.dayChangePercent,
        marketCap: h.currentValue,
        volume: 0,
        currency: baseCurrency,
      });
      g.marketCap += h.currentValue;
    });

    const portfolioSectors = Array.from(portSectorGroupMap.values()).sort((a, b) => b.marketCap - a.marketCap);

    return {
      holdings: calculatedHoldings,
      totalInvested: Number(totalInvested.toFixed(2)),
      totalCurrentValue: Number(totalCurrentValue.toFixed(2)),
      totalPnl: Number(totalPnl.toFixed(2)),
      totalPnlPercent: Number(totalPnlPercent.toFixed(2)),
      dayPnl: Number(totalDayPnl.toFixed(2)),
      dayPnlPercent: Number(dayPnlPercent.toFixed(2)),
      hasMixedCurrencies: false,
      primaryCurrency: baseCurrency,
      stockAllocations,
      sectorAllocations,
      portfolioSectors,
    };
  }, [activePortfolio, priceMap, baseCurrency, usdInrRate]);

  return {
    portfolios,
    activePortfolioId,
    setActivePortfolioId,
    activePortfolio,
    loading,
    calculated,
    usdInrRate,
    createPortfolio,
    renamePortfolio,
    deletePortfolio,
    addHolding,
    editHolding,
    deleteHolding,
    replaceHoldings,
    refreshPrices,
  };
}

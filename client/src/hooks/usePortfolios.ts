import { useState, useEffect, useMemo, useCallback } from 'react';
import { Portfolio, PortfolioHolding, HoldingCalculated, SectorGroup } from '../types';
import { storage } from '../lib/storage';
import { fetchQuote } from '../lib/api';
import { useApp } from '../context/ThemeContext';

export function usePortfolios() {
  const { showToast } = useApp();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [activePortfolioId, setActivePortfolioId] = useState<string>('');
  const [priceMap, setPriceMap] = useState<Map<string, { price: number; changePercent: number }>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);

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
    const newPriceMap = new Map(priceMap);

    await Promise.allSettled(
      symbols.map(async (sym) => {
        try {
          const res = await fetchQuote(sym);
          if (res.data?.price) {
            newPriceMap.set(sym.toUpperCase(), {
              price: res.data.price,
              changePercent: res.data.changePercent || 0,
            });
          }
        } catch {
          // fallback to holding buyPrice if offline
        }
      })
    );

    setPriceMap(newPriceMap);
  }, [activePortfolio, priceMap]);

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
      symbol: holdingData.symbol.toUpperCase(),
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

  // Calculations for active portfolio
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
        primaryCurrency: 'USD',
        stockAllocations: [] as { name: string; value: number }[],
        sectorAllocations: [] as { name: string; value: number }[],
        portfolioSectors: [] as SectorGroup[],
      };
    }

    const currencies = new Set(activePortfolio.holdings.map((h) => h.currency || 'USD'));
    const hasMixedCurrencies = currencies.size > 1;
    const primaryCurrency = activePortfolio.holdings[0]?.currency || 'USD';

    let totalInvested = 0;
    let totalCurrentValue = 0;
    let totalDayPnl = 0;

    // First pass: compute values
    const intermediate = activePortfolio.holdings.map((h) => {
      const live = priceMap.get(h.symbol.toUpperCase());
      const currentPrice = live ? live.price : h.buyPrice;
      const dayChangePercent = live ? live.changePercent : 0;

      const investedValue = h.quantity * h.buyPrice;
      const currentValue = h.quantity * currentPrice;
      const pnl = currentValue - investedValue;
      const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
      const dayPnl = currentValue * (dayChangePercent / 100);

      totalInvested += investedValue;
      totalCurrentValue += currentValue;
      totalDayPnl += dayPnl;

      return {
        ...h,
        currentPrice,
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
    const dayPnlPercent = totalCurrentValue > 0 ? (totalDayPnl / totalCurrentValue) * 100 : 0;

    // Allocation by stock
    const stockAllocations = calculatedHoldings.map((h) => ({
      name: h.symbol,
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
        marketCap: h.currentValue, // tile size = current holding value
        volume: 0,
        currency: h.currency,
      });
      g.marketCap += h.currentValue;
    });

    const portfolioSectors = Array.from(portSectorGroupMap.values()).sort((a, b) => b.marketCap - a.marketCap);

    return {
      holdings: calculatedHoldings,
      totalInvested,
      totalCurrentValue,
      totalPnl,
      totalPnlPercent,
      dayPnl: totalDayPnl,
      dayPnlPercent,
      hasMixedCurrencies,
      primaryCurrency,
      stockAllocations,
      sectorAllocations,
      portfolioSectors,
    };
  }, [activePortfolio, priceMap]);

  return {
    portfolios,
    activePortfolioId,
    setActivePortfolioId,
    activePortfolio,
    loading,
    calculated,
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

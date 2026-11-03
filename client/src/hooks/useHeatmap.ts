import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MarketType, TimeframeType, SectorGroup } from '../types';
import { fetchHeatmap } from '../lib/api';
import { useApp } from '../context/ThemeContext';

export function useHeatmap() {
  const { watchlist, showToast } = useApp();
  const [market, setMarket] = useState<MarketType>('us');
  const [timeframe, setTimeframe] = useState<TimeframeType>('1d');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [sectors, setSectors] = useState<SectorGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('live');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // 60-second auto-refresh timer & pause state
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [refreshCountdown, setRefreshCountdown] = useState<number>(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);

    try {
      // If watchlist market, we fetch both US and IN to ensure watchlist symbols are resolved
      const marketParam = market === 'watchlist' ? 'us' : market;
      const res = await fetchHeatmap(marketParam, timeframe);

      let finalSectors = res.data.sectors || [];

      if (market === 'watchlist') {
        // Also fetch IN if watchlist has .NS stocks
        let inSectors: SectorGroup[] = [];
        if (watchlist.some((s) => s.endsWith('.NS') || s.endsWith('.BO'))) {
          try {
            const inRes = await fetchHeatmap('in', timeframe);
            inSectors = inRes.data.sectors || [];
          } catch {
            // ignore
          }
        }

        const allStocks = [...finalSectors.flatMap((s) => s.stocks), ...inSectors.flatMap((s) => s.stocks)];
        const watchlistStocks = allStocks.filter((st) => watchlist.includes(st.symbol.toUpperCase()));

        // Group by sector
        const grouped = new Map<string, SectorGroup>();
        watchlistStocks.forEach((st) => {
          if (!grouped.has(st.sector)) {
            grouped.set(st.sector, { name: st.sector, marketCap: 0, stocks: [] });
          }
          const group = grouped.get(st.sector)!;
          group.stocks.push(st);
          group.marketCap += st.marketCap;
        });

        finalSectors = Array.from(grouped.values()).sort((a, b) => b.marketCap - a.marketCap);
      }

      setSectors(finalSectors);
      setDataSource(res.source || 'yahoo');
      setLastUpdated(res.data.lastUpdated || new Date().toISOString());
      setRefreshCountdown(60);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load heatmap';
      setError(msg);
      if (!isSilent) showToast(msg, 'error');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [market, timeframe, watchlist, showToast]);

  // Initial and param change trigger
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh countdown effect
  useEffect(() => {
    if (!autoRefresh) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          loadData(true);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefresh, loadData]);

  const toggleAutoRefresh = () => {
    setAutoRefresh((prev) => !prev);
  };

  const refreshNow = () => {
    setRefreshCountdown(60);
    loadData();
  };

  // List of all unique sector names
  const allSectorsList = useMemo(() => {
    const names = sectors.map((s) => s.name);
    return ['all', ...Array.from(new Set(names))];
  }, [sectors]);

  // Filtered sectors and stocks based on sectorFilter and searchQuery
  const filteredSectors = useMemo(() => {
    let result = sectors;

    if (sectorFilter !== 'all') {
      result = result.filter((s) => s.name.toLowerCase() === sectorFilter.toLowerCase());
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result
        .map((sec) => {
          const matchedStocks = sec.stocks.filter(
            (st) => st.symbol.toLowerCase().includes(q) || st.name.toLowerCase().includes(q)
          );
          return {
            ...sec,
            stocks: matchedStocks,
            marketCap: matchedStocks.reduce((sum, s) => sum + s.marketCap, 0),
          };
        })
        .filter((sec) => sec.stocks.length > 0);
    }

    return result;
  }, [sectors, sectorFilter, searchQuery]);

  return {
    market,
    setMarket,
    timeframe,
    setTimeframe,
    sectorFilter,
    setSectorFilter,
    searchQuery,
    setSearchQuery,
    sectors: filteredSectors,
    rawSectors: sectors,
    allSectorsList,
    loading,
    error,
    dataSource,
    lastUpdated,
    autoRefresh,
    toggleAutoRefresh,
    refreshCountdown,
    refreshNow,
  };
}

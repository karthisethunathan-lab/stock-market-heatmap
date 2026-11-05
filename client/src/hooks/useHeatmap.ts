import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MarketType, TimeframeType, SectorGroup, GroupByOption, SizeMetric, ColorMetric } from '../types';
import { fetchHeatmap, FetchHeatmapParams } from '../lib/api';
import { useApp } from '../context/ThemeContext';

export interface MarketStatusInfo {
  isOpen: boolean;
  state: string;
  desc: string;
}

export function useHeatmap(initialMarket: 'us' | 'in' = 'us') {
  const { showToast } = useApp();

  // Parse URL search params for shareable views
  const getUrlParam = (key: string, fallback: string) => {
    if (typeof window === 'undefined') return fallback;
    const params = new URLSearchParams(window.location.search);
    return params.get(key) || fallback;
  };

  const [market, setMarketState] = useState<MarketType>(initialMarket);
  const [timeframe, setTimeframeState] = useState<TimeframeType>(() => (getUrlParam('tf', '1d') as TimeframeType));
  const [groupBy, setGroupByState] = useState<GroupByOption>(() => (getUrlParam('groupBy', 'sector') as GroupByOption));
  const [sizeMetric, setSizeMetricState] = useState<SizeMetric>(() => (getUrlParam('size', 'marketcap') as SizeMetric));
  const [colorMetric, setColorMetricState] = useState<ColorMetric>(() => (getUrlParam('color', 'change') as ColorMetric));

  const [selectedSector, setSelectedSectorState] = useState<string>(() => getUrlParam('sector', 'All'));
  const [selectedIndex, setSelectedIndexState] = useState<string>(() => getUrlParam('index', 'All'));
  const [selectedCapBucket, setSelectedCapBucketState] = useState<string>(() => getUrlParam('cap', 'All'));
  const [selectedPreset, setSelectedPresetState] = useState<string>(() => getUrlParam('preset', ''));

  const [sectors, setSectors] = useState<SectorGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('live');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [marketStatus, setMarketStatus] = useState<MarketStatusInfo>({
    isOpen: true,
    state: 'REGULAR',
    desc: 'Market Open',
  });

  // Real-time price flash animation state (symbol -> 'up' | 'down')
  const [priceFlashes, setPriceFlashes] = useState<Record<string, 'up' | 'down'>>({});
  const flashTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const prevPricesRef = useRef<Map<string, number>>(new Map());

  const triggerFlash = useCallback((symbol: string, direction: 'up' | 'down') => {
    setPriceFlashes((prev) => ({ ...prev, [symbol]: direction }));
    const existingTimer = flashTimersRef.current.get(symbol);
    if (existingTimer) clearTimeout(existingTimer);
    const newTimer = setTimeout(() => {
      setPriceFlashes((prev) => {
        const next = { ...prev };
        delete next[symbol];
        return next;
      });
      flashTimersRef.current.delete(symbol);
    }, 1200);
    flashTimersRef.current.set(symbol, newTimer);
  }, []);

  // Auto-refresh countdown (15s during open market, 45s when closed)
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const refreshInterval = marketStatus.isOpen ? 15 : 45;
  const [refreshCountdown, setRefreshCountdown] = useState<number>(refreshInterval);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state changes with URL search params
  const updateUrlParams = (updates: Record<string, string | undefined>) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([k, v]) => {
      if (!v || v === 'All' || (k === 'tf' && v === '1d') || (k === 'size' && v === 'marketcap') || (k === 'color' && v === 'change') || (k === 'groupBy' && v === 'sector')) {
        params.delete(k);
      } else {
        params.set(k, v);
      }
    });

    const newSearch = params.toString();
    const newPath = `/${market}${newSearch ? `?${newSearch}` : ''}`;
    if (!window.location.pathname.startsWith('/stock/')) {
      window.history.replaceState({}, '', newPath);
    }
  };

  const setMarket = (m: MarketType) => {
    setMarketState(m);
    updateUrlParams({});
  };

  const setTimeframe = (tf: TimeframeType) => {
    setTimeframeState(tf);
    updateUrlParams({ tf });
  };

  const setGroupBy = (gb: GroupByOption) => {
    setGroupByState(gb);
    updateUrlParams({ groupBy: gb });
  };

  const setSizeMetric = (sm: SizeMetric) => {
    setSizeMetricState(sm);
    updateUrlParams({ size: sm });
  };

  const setColorMetric = (cm: ColorMetric) => {
    setColorMetricState(cm);
    updateUrlParams({ color: cm });
  };

  const setSelectedSector = (s: string) => {
    setSelectedSectorState(s);
    updateUrlParams({ sector: s });
  };

  const setSelectedIndex = (idx: string) => {
    setSelectedIndexState(idx);
    updateUrlParams({ index: idx });
  };

  const setSelectedCapBucket = (cap: string) => {
    setSelectedCapBucketState(cap);
    updateUrlParams({ cap });
  };

  const setSelectedPreset = (p: string) => {
    setSelectedPresetState(p);
    updateUrlParams({ preset: p });
  };

  // Sync market prop when parent changes active tab between US and IN
  useEffect(() => {
    setMarketState(initialMarket);
  }, [initialMarket]);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);

    try {
      const params: FetchHeatmapParams = {
        market,
        range: timeframe,
        groupBy,
        sizeMetric,
        colorMetric,
        sector: selectedSector !== 'All' ? selectedSector : undefined,
        index: selectedIndex !== 'All' ? selectedIndex : undefined,
        capBucket: selectedCapBucket !== 'All' ? selectedCapBucket : undefined,
        preset: selectedPreset || undefined,
      };

      const res = await fetchHeatmap(params);
      const incomingSectors = res.sectors || [];
      
      // Compare prices with previous prices to trigger visual flashes
      incomingSectors.forEach((sec) => {
        sec.stocks.forEach((st) => {
          const oldPrice = prevPricesRef.current.get(st.symbol);
          if (oldPrice !== undefined && Math.abs(st.price - oldPrice) > 0.005) {
            triggerFlash(st.symbol, st.price > oldPrice ? 'up' : 'down');
          }
          prevPricesRef.current.set(st.symbol, st.price);
        });
      });

      setSectors(incomingSectors);
      setDataSource(res.source || 'live');
      setLastUpdated(res.lastUpdated || new Date().toISOString());
      if (res.marketStatus) {
        setMarketStatus(res.marketStatus);
      }
      setRefreshCountdown(res.marketStatus?.isOpen ? 15 : 45);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load heatmap';
      setError(msg);
      if (!isSilent) showToast(msg, 'error');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [market, timeframe, groupBy, sizeMetric, colorMetric, selectedSector, selectedIndex, selectedCapBucket, selectedPreset, showToast, triggerFlash]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Finnhub WebSocket connection for streaming US real-time trade ticks
  useEffect(() => {
    if (market !== 'us' || typeof window === 'undefined') return;

    let socket: WebSocket | null = null;
    let isSubscribed = true;

    try {
      socket = new WebSocket('wss://ws.finnhub.io?token=dbkup3pr01qjsmfrafdgdbkup3pr01qjsmfrafe0');

      const topUS = [
        'AAPL', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'AVGO',
        'BRK.B', 'JPM', 'LLY', 'V', 'UNH', 'XOM', 'MA', 'COST', 'HD', 'PG', 'NFLX', 'AMD'
      ];

      socket.onopen = () => {
        if (!isSubscribed || !socket) return;
        topUS.forEach((sym) => {
          socket?.send(JSON.stringify({ type: 'subscribe', symbol: sym }));
        });
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'trade' && Array.isArray(payload.data)) {
            payload.data.forEach((trade: { s: string; p: number; t: number; v: number }) => {
              const sym = trade.s;
              const newPrice = trade.p;
              if (!sym || !newPrice) return;

              setSectors((prevSectors) => {
                let changed = false;
                const nextSectors = prevSectors.map((sec) => {
                  const sIdx = sec.stocks.findIndex((st) => st.symbol === sym);
                  if (sIdx === -1) return sec;

                  changed = true;
                  const oldStock = sec.stocks[sIdx];
                  const oldPrice = oldStock.price;
                  const priceDiff = newPrice - oldPrice;

                  if (Math.abs(priceDiff) > 0.005) {
                    triggerFlash(sym, priceDiff > 0 ? 'up' : 'down');
                    prevPricesRef.current.set(sym, newPrice);
                  }

                  const prevClose = oldStock.changePercent !== 0
                    ? oldPrice / (1 + oldStock.changePercent / 100)
                    : oldPrice;
                  const newChange = Number((((newPrice - prevClose) / prevClose) * 100).toFixed(2));

                  const nextStocks = [...sec.stocks];
                  nextStocks[sIdx] = {
                    ...oldStock,
                    price: Number(newPrice.toFixed(2)),
                    changePercent: newChange,
                    colorValue: newChange,
                    isLive: true,
                  };

                  return { ...sec, stocks: nextStocks };
                });

                return changed ? nextSectors : prevSectors;
              });
            });
          }
        } catch {
          // Ignore JSON parse errors from ping frames
        }
      };

      socket.onerror = () => {
        // Will fallback smoothly to polling
      };
    } catch {
      // WebSocket not available, fallback to polling
    }

    return () => {
      isSubscribed = false;
      if (socket) {
        try {
          socket.close();
        } catch {
          // Ignore socket close errors
        }
      }
    };
  }, [market, triggerFlash]);

  // Dynamic auto-refresh timer (15s during market open, 45s when closed)
  useEffect(() => {
    if (!autoRefresh) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalSeconds = marketStatus.isOpen ? 15 : 45;

    timerRef.current = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          loadData(true);
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefresh, loadData, marketStatus.isOpen]);

  const toggleAutoRefresh = () => setAutoRefresh((prev) => !prev);
  const refreshNow = () => {
    setRefreshCountdown(marketStatus.isOpen ? 15 : 45);
    loadData();
  };

  // All stocks flattened
  const allStocks = useMemo(() => sectors.flatMap((s) => s.stocks), [sectors]);

  return {
    market,
    setMarket,
    timeframe,
    setTimeframe,
    groupBy,
    setGroupBy,
    sizeMetric,
    setSizeMetric,
    colorMetric,
    setColorMetric,
    selectedSector,
    setSelectedSector,
    selectedIndex,
    setSelectedIndex,
    selectedCapBucket,
    setSelectedCapBucket,
    selectedPreset,
    setSelectedPreset,
    sectors,
    allStocks,
    loading,
    error,
    dataSource,
    lastUpdated,
    marketStatus,
    priceFlashes,
    autoRefresh,
    toggleAutoRefresh,
    refreshCountdown,
    refreshNow,
  };
}

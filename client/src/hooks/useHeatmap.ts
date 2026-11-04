import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MarketType, TimeframeType, SectorGroup, GroupByOption, SizeMetric, ColorMetric } from '../types';
import { fetchHeatmap, FetchHeatmapParams } from '../lib/api';
import { useApp } from '../context/ThemeContext';

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

  // Auto-refresh countdown
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [refreshCountdown, setRefreshCountdown] = useState<number>(45);
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
      setSectors(res.sectors || []);
      setDataSource(res.source || 'live');
      setLastUpdated(res.lastUpdated || new Date().toISOString());
      setRefreshCountdown(45);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load heatmap';
      setError(msg);
      if (!isSilent) showToast(msg, 'error');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [market, timeframe, groupBy, sizeMetric, colorMetric, selectedSector, selectedIndex, selectedCapBucket, selectedPreset, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh timer
  useEffect(() => {
    if (!autoRefresh) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          loadData(true);
          return 45;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefresh, loadData]);

  const toggleAutoRefresh = () => setAutoRefresh((prev) => !prev);
  const refreshNow = () => {
    setRefreshCountdown(45);
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
    autoRefresh,
    toggleAutoRefresh,
    refreshCountdown,
    refreshNow,
  };
}

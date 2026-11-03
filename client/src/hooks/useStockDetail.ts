import { useState, useEffect, useCallback } from 'react';
import {
  StockQuote,
  CompanyProfile,
  KeyMetrics,
  HistoricalCandle,
  NewsItem,
  ChartTimeframe,
  ChartType,
} from '../types';
import {
  fetchQuote,
  fetchProfile,
  fetchMetrics,
  fetchHistory,
  fetchNews,
} from '../lib/api';

export function useStockDetail(symbol: string | null) {
  const [chartRange, setChartRange] = useState<ChartTimeframe>('1M');
  const [chartType, setChartType] = useState<ChartType>('area');

  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [metrics, setMetrics] = useState<KeyMetrics | null>(null);
  const [candles, setCandles] = useState<HistoricalCandle[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [chartLoading, setChartLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load base stock information when symbol changes
  useEffect(() => {
    if (!symbol) {
      setQuote(null);
      setProfile(null);
      setMetrics(null);
      setCandles([]);
      setNews([]);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.allSettled([
      fetchQuote(symbol),
      fetchProfile(symbol),
      fetchMetrics(symbol),
      fetchNews(symbol),
    ]).then(([quoteRes, profileRes, metricsRes, newsRes]) => {
      if (!isMounted) return;

      if (quoteRes.status === 'fulfilled') setQuote(quoteRes.value.data);
      if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);
      if (metricsRes.status === 'fulfilled') setMetrics(metricsRes.value.data);
      if (newsRes.status === 'fulfilled') setNews(newsRes.value.data);

      if (quoteRes.status === 'rejected' && profileRes.status === 'rejected') {
        setError('Failed to load stock details. Please try again.');
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [symbol]);

  // Load chart history when symbol or chartRange changes
  const loadHistory = useCallback(async () => {
    if (!symbol) return;
    setChartLoading(true);

    try {
      const res = await fetchHistory(symbol, chartRange.toLowerCase());
      setCandles(res.data.candles || []);
    } catch (err: unknown) {
      console.warn('History fetch error:', err);
    } finally {
      setChartLoading(false);
    }
  }, [symbol, chartRange]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    symbol,
    quote,
    profile,
    metrics,
    candles,
    news,
    loading,
    chartLoading,
    error,
    chartRange,
    setChartRange,
    chartType,
    setChartType,
    refreshHistory: loadHistory,
  };
}

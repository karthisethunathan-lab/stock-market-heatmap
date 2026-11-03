import {
  HeatmapResponse,
  StockQuote,
  CompanyProfile,
  KeyMetrics,
  HistoricalResponse,
  NewsItem,
  SearchResult,
  MarketType,
  TimeframeType,
} from '../types';

const API_BASE = '/api';

class ApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<{ data: T; source?: string }> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options?.headers || {}),
      },
    });

    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new ApiError(json.error || `HTTP error ${res.status}`, json.code);
    }

    return {
      data: json.data !== undefined ? json.data : json,
      source: json.source,
    };
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;
    const msg = err instanceof Error ? err.message : 'Network request failed';
    throw new ApiError(msg);
  }
}

export async function fetchHeatmap(market: MarketType = 'us', range: TimeframeType = '1d'): Promise<{ data: HeatmapResponse; source?: string }> {
  const res = await fetch(`${API_BASE}/heatmap?market=${market}&range=${range}`);
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new ApiError(json.error || 'Failed to fetch heatmap data');
  }
  return {
    data: {
      market: json.market,
      range: json.range,
      lastUpdated: json.lastUpdated,
      source: json.source,
      sectors: json.sectors || [],
      totalStocks: json.totalStocks || 0,
    },
    source: json.source,
  };
}

export async function fetchQuote(symbol: string): Promise<{ data: StockQuote; source?: string }> {
  return request<StockQuote>(`/quote/${encodeURIComponent(symbol)}`);
}

export async function fetchProfile(symbol: string): Promise<{ data: CompanyProfile; source?: string }> {
  return request<CompanyProfile>(`/profile/${encodeURIComponent(symbol)}`);
}

export async function fetchMetrics(symbol: string): Promise<{ data: KeyMetrics; source?: string }> {
  return request<KeyMetrics>(`/metrics/${encodeURIComponent(symbol)}`);
}

export async function fetchHistory(
  symbol: string,
  range: string = '1m',
  interval?: string
): Promise<{ data: HistoricalResponse; source?: string }> {
  const query = new URLSearchParams({ range });
  if (interval) query.set('interval', interval);
  return request<HistoricalResponse>(`/history/${encodeURIComponent(symbol)}?${query.toString()}`);
}

export async function fetchNews(symbol: string): Promise<{ data: NewsItem[]; source?: string }> {
  return request<NewsItem[]>(`/news/${encodeURIComponent(symbol)}`);
}

export async function searchStocks(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length === 0) return [];
  const res = await request<SearchResult[]>(`/search?q=${encodeURIComponent(query.trim())}`);
  return res.data || [];
}

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
  SectorGroup,
  StockFundamentals,
  FinancialStatements,
  MarketOverviewData,
  ScreenerFilters,
  ScreenerResult,
} from '../types';
import usUniverseData from '../data/universe-us.json';
import inUniverseData from '../data/universe-in.json';

const API_BASE = (import.meta as any).env?.VITE_API_URL
  ? `${(import.meta as any).env.VITE_API_URL}/api`
  : '/api';

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

    if (!res.ok) {
      throw new ApiError(`HTTP ${res.status}`);
    }

    const json = await res.json();
    if (json.success === false) {
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

export interface FetchHeatmapParams {
  market: MarketType;
  range?: TimeframeType;
  groupBy?: string;
  sizeMetric?: string;
  colorMetric?: string;
  sector?: string;
  index?: string;
  capBucket?: string;
  preset?: string;
}

export async function fetchHeatmap(params: FetchHeatmapParams): Promise<HeatmapResponse> {
  const {
    market,
    range = '1d',
    groupBy = 'sector',
    sizeMetric = 'marketcap',
    colorMetric = 'change',
    sector,
    index,
    capBucket,
    preset,
  } = params;

  const q = new URLSearchParams({
    market,
    range,
    groupBy,
    sizeMetric,
    colorMetric,
  });

  if (sector && sector !== 'All') q.set('sector', sector);
  if (index && index !== 'All') q.set('index', index);
  if (capBucket && capBucket !== 'All') q.set('capBucket', capBucket);
  if (preset) q.set('preset', preset);

  const queryStr = q.toString();

  // Try serverless first, fallback to Express /api/heatmap
  try {
    const res = await request<HeatmapResponse>(`/heatmap.js?${queryStr}`);
    if (res.data?.sectors?.length > 0) return res.data;
  } catch {
    try {
      const res = await request<HeatmapResponse>(`/heatmap?${queryStr}`);
      if (res.data?.sectors?.length > 0) return res.data;
    } catch {
      // Local universe fallback
    }
  }

  // Pure client fallback using pre-packaged universe json
  const isIndia = market === 'in';
  const universe = isIndia ? inUniverseData : usUniverseData;
  const currency = isIndia ? 'INR' : 'USD';

  const groupMap = new Map<string, SectorGroup>();
  universe.forEach((s: any) => {
    const groupName = s.sector || 'Other';
    if (!groupMap.has(groupName)) {
      groupMap.set(groupName, { name: groupName, marketCap: 0, stocks: [] });
    }
    const g = groupMap.get(groupName)!;
    g.stocks.push({
      ...s,
      currency,
      changePercent: s.change1d || 0,
      price: s.price || 100,
      marketCap: s.marketCap || 50000000000,
      volume: s.volume || 10000000,
      tileValue: s.marketCap,
      colorValue: s.change1d,
    });
    g.marketCap += s.marketCap || 0;
  });

  return {
    market,
    range,
    lastUpdated: new Date().toISOString(),
    source: 'local-universe',
    sectors: Array.from(groupMap.values()),
    totalStocks: universe.length,
  };
}

export async function fetchQuote(symbol: string): Promise<{ data: StockQuote; source?: string }> {
  try {
    return await request<StockQuote>(`/quote.js?symbol=${encodeURIComponent(symbol)}`);
  } catch {
    return await request<StockQuote>(`/quote/${encodeURIComponent(symbol)}`);
  }
}

export async function fetchProfile(symbol: string): Promise<{ data: CompanyProfile; source?: string }> {
  try {
    return await request<CompanyProfile>(`/profile.js?symbol=${encodeURIComponent(symbol)}`);
  } catch {
    return await request<CompanyProfile>(`/profile/${encodeURIComponent(symbol)}`);
  }
}

export async function fetchHistory(symbol: string, range = '1M', interval = '1d'): Promise<{ data: HistoricalResponse; source?: string }> {
  try {
    return await request<HistoricalResponse>(`/history.js?symbol=${encodeURIComponent(symbol)}&range=${range}&interval=${interval}`);
  } catch {
    return await request<HistoricalResponse>(`/history/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`);
  }
}

export async function fetchMetrics(symbol: string): Promise<{ data: KeyMetrics; source?: string }> {
  try {
    return await request<KeyMetrics>(`/metrics.js?symbol=${encodeURIComponent(symbol)}`);
  } catch {
    return await request<KeyMetrics>(`/metrics/${encodeURIComponent(symbol)}`);
  }
}

export async function fetchNews(symbol: string): Promise<{ data: NewsItem[]; source?: string }> {
  try {
    return await request<NewsItem[]>(`/news.js?symbol=${encodeURIComponent(symbol)}`);
  } catch {
    return await request<NewsItem[]>(`/news/${encodeURIComponent(symbol)}`);
  }
}

export async function fetchFundamentals(symbol: string): Promise<StockFundamentals> {
  try {
    const res = await request<StockFundamentals>(`/fundamentals.js?symbol=${encodeURIComponent(symbol)}`);
    return res.data;
  } catch {
    const res = await request<StockFundamentals>(`/fundamentals/${encodeURIComponent(symbol)}`);
    return res.data;
  }
}

export async function fetchFinancials(symbol: string, timeframe = 'annual'): Promise<FinancialStatements> {
  try {
    const res = await request<FinancialStatements>(`/financials.js?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}`);
    return res.data;
  } catch {
    const res = await request<FinancialStatements>(`/financials/${encodeURIComponent(symbol)}?timeframe=${timeframe}`);
    return res.data;
  }
}

export async function fetchAnalysts(symbol: string): Promise<any> {
  try {
    const res = await request<any>(`/analysts.js?symbol=${encodeURIComponent(symbol)}`);
    return res.data;
  } catch {
    const res = await request<any>(`/analysts/${encodeURIComponent(symbol)}`);
    return res.data;
  }
}

export async function fetchPeers(symbol: string): Promise<any[]> {
  try {
    const res = await request<any[]>(`/peers.js?symbol=${encodeURIComponent(symbol)}`);
    return res.data;
  } catch {
    const res = await request<any[]>(`/peers/${encodeURIComponent(symbol)}`);
    return res.data;
  }
}

export async function fetchMarketOverview(): Promise<MarketOverviewData> {
  try {
    const res = await request<MarketOverviewData>(`/market-overview.js`);
    return res.data;
  } catch {
    const res = await request<MarketOverviewData>(`/market-overview`);
    return res.data;
  }
}

export async function fetchScreener(filters: ScreenerFilters): Promise<ScreenerResult> {
  const q = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      q.set(k, String(v));
    }
  });
  const qs = q.toString();

  try {
    const res = await request<ScreenerResult>(`/screener.js?${qs}`);
    return res.data;
  } catch {
    const res = await request<ScreenerResult>(`/screener?${qs}`);
    return res.data;
  }
}

export async function searchStocks(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length === 0) return [];
  try {
    const res = await request<SearchResult[]>(`/search.js?q=${encodeURIComponent(query.trim())}`);
    if (res.data?.length > 0) return res.data;
  } catch {
    try {
      const res = await request<SearchResult[]>(`/search?q=${encodeURIComponent(query.trim())}`);
      if (res.data?.length > 0) return res.data;
    } catch {
      // Local fallback
    }
  }

  const q = query.toLowerCase().trim();
  const all = [...(usUniverseData as any[]), ...(inUniverseData as any[])];
  return all
    .filter((s: any) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
    .slice(0, 10)
    .map((s: any) => ({
      symbol: s.symbol,
      name: s.name,
      exchange: s.symbol.endsWith('.NS') ? 'NSE' : 'US',
      type: 'EQUITY',
      currency: s.symbol.endsWith('.NS') ? 'INR' : 'USD',
    }));
}

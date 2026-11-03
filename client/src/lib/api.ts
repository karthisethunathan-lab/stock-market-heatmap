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
} from '../types';
import usSeedData from '../data/usSymbols.json';
import inSeedData from '../data/inSymbols.json';

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

/**
 * Fallback generator if both live serverless API and proxy fail
 */
function getClientFallbackHeatmap(market: MarketType = 'us', range: TimeframeType = '1d'): HeatmapResponse {
  const seedList = market === 'in' ? inSeedData : usSeedData;
  const currency = market === 'in' ? 'INR' : 'USD';

  const stocks = seedList.map((item: any) => {
    let changePercent = item.change1d;
    if (range === '1w') changePercent = item.change1w;
    else if (range === '1m') changePercent = item.change1m;
    else if (range === 'ytd') changePercent = item.changeYtd;

    return {
      symbol: item.symbol,
      name: item.name,
      sector: item.sector,
      price: item.price,
      changePercent: Number((changePercent ?? 0).toFixed(2)),
      changeAmount: Number(((item.price * (changePercent ?? 0)) / 100).toFixed(2)),
      marketCap: item.marketCap || 50000000000,
      volume: 25000000,
      currency,
    };
  });

  const sectorMap = new Map<string, SectorGroup>();
  stocks.forEach((stock: any) => {
    const secName = stock.sector || 'Other';
    if (!sectorMap.has(secName)) {
      sectorMap.set(secName, { name: secName, marketCap: 0, stocks: [] });
    }
    const group = sectorMap.get(secName)!;
    group.stocks.push(stock);
    group.marketCap += stock.marketCap;
  });

  const sectors = Array.from(sectorMap.values()).sort((a, b) => b.marketCap - a.marketCap);
  sectors.forEach((sec) => sec.stocks.sort((a, b) => b.marketCap - a.marketCap));

  return {
    market,
    range,
    lastUpdated: new Date().toISOString(),
    source: 'client-cache',
    sectors,
    totalStocks: stocks.length,
  };
}

export async function fetchHeatmap(market: MarketType = 'us', range: TimeframeType = '1d'): Promise<{ data: HeatmapResponse; source?: string }> {
  // First try direct Vercel serverless function or local express route
  const endpoints = [
    `/heatmap.js?market=${market}&range=${range}`,
    `/heatmap?market=${market}&range=${range}`,
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${API_BASE}${ep}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success !== false && json.sectors?.length > 0) {
          return {
            data: {
              market: json.market,
              range: json.range,
              lastUpdated: json.lastUpdated,
              source: json.source || 'yahoo-live',
              sectors: json.sectors || [],
              totalStocks: json.totalStocks || 0,
            },
            source: json.source || 'yahoo-live',
          };
        }
      }
    } catch {
      // Try next endpoint
    }
  }

  // Gracefully return seed list if completely offline
  return {
    data: getClientFallbackHeatmap(market, range),
    source: 'seed-data',
  };
}

export async function fetchQuote(symbol: string): Promise<{ data: StockQuote; source?: string }> {
  try {
    return await request<StockQuote>(`/quote.js?symbol=${encodeURIComponent(symbol)}`);
  } catch {
    try {
      return await request<StockQuote>(`/quote/${encodeURIComponent(symbol)}`);
    } catch {
      const sym = symbol.toUpperCase();
      const all = [...usSeedData, ...inSeedData];
      const item = all.find((s: any) => s.symbol === sym);
      const price = item?.price || (sym.endsWith('.NS') ? 1450 : 225.4);
      const change = item?.change1d || 1.25;

      return {
        data: {
          symbol: sym,
          name: item?.name || sym,
          price,
          change: Number(((price * change) / 100).toFixed(2)),
          changePercent: change,
          previousClose: Number((price / (1 + change / 100)).toFixed(2)),
          open: Number((price * 0.995).toFixed(2)),
          dayHigh: Number((price * 1.015).toFixed(2)),
          dayLow: Number((price * 0.985).toFixed(2)),
          volume: 34500000,
          fiftyTwoWeekHigh: Number((price * 1.2).toFixed(2)),
          fiftyTwoWeekLow: Number((price * 0.8).toFixed(2)),
          currency: sym.endsWith('.NS') ? 'INR' : 'USD',
          exchange: sym.endsWith('.NS') ? 'NSE' : 'NASDAQ',
          marketState: 'REGULAR',
          lastUpdated: new Date().toISOString(),
        },
        source: 'seed-data',
      };
    }
  }
}

export async function fetchProfile(symbol: string): Promise<{ data: CompanyProfile; source?: string }> {
  try {
    return await request<CompanyProfile>(`/profile.js?symbol=${encodeURIComponent(symbol)}`);
  } catch {
    try {
      return await request<CompanyProfile>(`/profile/${encodeURIComponent(symbol)}`);
    } catch {
      const sym = symbol.toUpperCase();
      const all = [...usSeedData, ...inSeedData];
      const item = all.find((s: any) => s.symbol === sym);
      return {
        data: {
          symbol: sym,
          name: item?.name || sym,
          logo: `https://assets.parqet.com/logos/symbol/${sym.replace('.NS', '')}?format=svg`,
          industry: item?.sector || 'Technology',
          exchange: sym.endsWith('.NS') ? 'NSE' : 'NASDAQ',
          website: `https://finance.yahoo.com/quote/${sym}`,
          marketCap: item?.marketCap || 350000000000,
          description: `${item?.name || sym} operates in the ${item?.sector || 'General'} industry.`,
          currency: sym.endsWith('.NS') ? 'INR' : 'USD',
        },
        source: 'seed-data',
      };
    }
  }
}

export async function fetchMetrics(symbol: string): Promise<{ data: KeyMetrics; source?: string }> {
  try {
    return await request<KeyMetrics>(`/metrics.js?symbol=${encodeURIComponent(symbol)}`);
  } catch {
    try {
      return await request<KeyMetrics>(`/metrics/${encodeURIComponent(symbol)}`);
    } catch {
      const sym = symbol.toUpperCase();
      return {
        data: {
          symbol: sym,
          peRatio: 26.4,
          eps: 6.8,
          beta: 1.12,
          dividendYield: 1.45,
          fiftyTwoWeekHigh: null,
          fiftyTwoWeekLow: null,
          marketCap: 450000000000,
          recommendation: {
            strongBuy: 14,
            buy: 22,
            hold: 9,
            sell: 2,
            strongSell: 1,
          },
        },
        source: 'seed-data',
      };
    }
  }
}

export async function fetchHistory(
  symbol: string,
  range: string = '1m',
  interval?: string
): Promise<{ data: HistoricalResponse; source?: string }> {
  const query = new URLSearchParams({ symbol, range });
  if (interval) query.set('interval', interval);

  try {
    return await request<HistoricalResponse>(`/history.js?${query.toString()}`);
  } catch {
    try {
      return await request<HistoricalResponse>(`/history/${encodeURIComponent(symbol)}?range=${range}`);
    } catch {
      const sym = symbol.toUpperCase();
      const count = range.includes('1d') ? 30 : 60;
      const now = Date.now();
      const stepMs = 24 * 60 * 60 * 1000;
      const all = [...usSeedData, ...inSeedData];
      const item = all.find((s: any) => s.symbol === sym);
      let basePrice = item?.price || 220;

      const candles = [];
      let current = basePrice * 0.94;

      for (let i = count; i >= 0; i--) {
        const ts = now - i * stepMs;
        const d = new Date(ts);
        const fluctuation = (Math.sin(i * 0.4) + Math.random() - 0.45) * (basePrice * 0.015);
        current = Math.max(1, current + fluctuation);
        const open = current - (Math.random() - 0.5) * 1.5;
        const high = Math.max(open, current) + Math.random() * 1.8;
        const low = Math.min(open, current) - Math.random() * 1.8;

        candles.push({
          timestamp: ts,
          date: d.toISOString(),
          label: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
          open: Number(open.toFixed(2)),
          high: Number(high.toFixed(2)),
          low: Number(low.toFixed(2)),
          close: Number(current.toFixed(2)),
          volume: Math.floor(15000000 + Math.random() * 30000000),
        });
      }

      return {
        data: {
          symbol: sym,
          range,
          interval: '1d',
          currency: sym.endsWith('.NS') ? 'INR' : 'USD',
          previousClose: candles[0].close,
          candles,
        },
        source: 'seed-data',
      };
    }
  }
}

export async function fetchNews(symbol: string): Promise<{ data: NewsItem[]; source?: string }> {
  try {
    return await request<NewsItem[]>(`/news.js?symbol=${encodeURIComponent(symbol)}`);
  } catch {
    try {
      return await request<NewsItem[]>(`/news/${encodeURIComponent(symbol)}`);
    } catch {
      const sym = symbol.toUpperCase();
      return {
        data: [
          {
            id: `news-1-${sym}`,
            headline: `${sym} reports positive momentum amid sector-wide institutional inflows`,
            summary: `Market analysts highlight continuous institutional demand and steady operating margin expansion for ${sym}.`,
            source: 'Financial Times',
            url: `https://finance.yahoo.com/quote/${sym}/news`,
            image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80',
            datetime: Date.now() - 2 * 3600 * 1000,
          },
        ],
        source: 'seed-data',
      };
    }
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
      // Fallback
    }
  }

  const q = query.toLowerCase().trim();
  const all = [...usSeedData, ...inSeedData];
  return all
    .filter((s: any) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
    .slice(0, 8)
    .map((s: any) => ({
      symbol: s.symbol,
      name: s.name,
      exchange: s.symbol.endsWith('.NS') ? 'NSE' : 'US',
      type: 'EQUITY',
      currency: s.symbol.endsWith('.NS') ? 'INR' : 'USD',
    }));
}

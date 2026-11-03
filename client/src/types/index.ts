export type MarketType = 'us' | 'in' | 'watchlist';
export type TimeframeType = '1d' | '1w' | '1m' | 'ytd';
export type ChartTimeframe = '1D' | '1W' | '1M' | '6M' | '1Y' | '5Y';
export type ChartType = 'area' | 'candle';
export type ColorMode = 'standard' | 'colorblind';
export type ThemeMode = 'dark' | 'light';

export interface StockTile {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  changePercent: number;
  changeAmount?: number;
  marketCap: number;
  volume: number;
  currency: string;
}

export interface SectorGroup {
  name: string;
  marketCap: number;
  stocks: StockTile[];
}

export interface HeatmapResponse {
  market: MarketType;
  range: TimeframeType;
  lastUpdated: string;
  source: string;
  sectors: SectorGroup[];
  totalStocks: number;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  currency: string;
  exchange: string;
  marketState: string;
  lastUpdated: string;
}

export interface CompanyProfile {
  symbol: string;
  name: string;
  logo: string;
  industry: string;
  exchange: string;
  website: string;
  marketCap: number;
  sharesOutstanding?: number | null;
  description: string;
  country?: string;
  currency: string;
}

export interface RecommendationTrend {
  buy: number;
  hold: number;
  sell: number;
  strongBuy: number;
  strongSell: number;
  period?: string;
}

export interface KeyMetrics {
  symbol: string;
  peRatio: number | null;
  eps: number | null;
  beta: number | null;
  dividendYield: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  fiftyTwoWeekReturn?: number | null;
  marketCap: number;
  recommendation?: RecommendationTrend | null;
}

export interface NewsItem {
  id: string | number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image?: string;
  datetime: number;
}

export interface HistoricalCandle {
  timestamp: number;
  date: string;
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoricalResponse {
  symbol: string;
  range: string;
  interval: string;
  currency: string;
  previousClose: number;
  candles: HistoricalCandle[];
}

export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
  currency: string;
}

export interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  buyPrice: number;
  buyDate: string;
  sector: string;
  currency: string;
}

export interface Portfolio {
  id: string;
  name: string;
  createdAt: string;
  holdings: PortfolioHolding[];
}

export interface HoldingCalculated extends PortfolioHolding {
  currentPrice: number;
  dayChangePercent: number;
  investedValue: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  weight: number;
}

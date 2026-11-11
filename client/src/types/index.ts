export type MarketType = 'us' | 'in' | 'watchlist';
export type TimeframeType = '1d' | '1w' | '1m' | '3m' | '6m' | 'ytd' | '1y';
export type ChartTimeframe = '1D' | '1W' | '1M' | '6M' | '1Y' | '5Y';
export type ChartType = 'area' | 'candle';
export type ColorMode = 'standard' | 'colorblind';
export type ThemeMode = 'dark' | 'light';

export type TopLevelTab = 'us' | 'in' | 'portfolios' | 'watchlist' | 'screener';
export type GroupByOption = 'sector' | 'industry' | 'index' | 'capbucket';
export type SizeMetric = 'marketcap' | 'volume' | 'equal';
export type ColorMetric = 'change' | 'volume' | 'pe' | 'dist52whigh';

export interface StockTile {
  symbol: string;
  name: string;
  sector: string;
  industry?: string;
  indices?: string[];
  capBucket?: 'Mega' | 'Large' | 'Mid' | 'Small';
  price: number;
  changePercent: number;
  change1d?: number;
  changeAmount?: number;
  marketCap: number;
  volume: number;
  avgVolume?: number;
  pe?: number;
  pb?: number;
  dividendYield?: number;
  roe?: number;
  debtEquity?: number;
  revGrowth?: number;
  dist52wHigh?: number;
  tileValue?: number;
  colorValue?: number;
  currency: string;
  isLive?: boolean;
}

export interface SectorGroup {
  name: string;
  marketCap: number;
  stocks: StockTile[];
}

export interface HeatmapResponse {
  market: MarketType;
  range: TimeframeType;
  groupBy?: GroupByOption;
  sizeMetric?: SizeMetric;
  colorMetric?: ColorMetric;
  lastUpdated: string;
  source?: string;
  sectors: SectorGroup[];
  totalStocks: number;
  isLive?: boolean;
  marketStatus?: {
    isOpen: boolean;
    state: string;
    desc: string;
  };
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

// Grouped Fundamentals
export interface QuickTakeTag {
  label: string;
  type: 'positive' | 'neutral' | 'warning';
}

export interface StockFundamentals {
  symbol: string;
  name: string;
  currency: string;
  source: string;
  lastUpdated: string;
  valuation: {
    marketCap: number;
    enterpriseValue: number;
    peRatioTTM: number;
    forwardPE: number;
    pegRatio: number;
    priceToBook: number;
    priceToSales: number;
    evToEbitda: number;
    earningsYield: number;
  };
  profitability: {
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
    roe: number;
    roa: number;
    roce: number;
  };
  growth: {
    revenueGrowthYoY: number;
    epsGrowthYoY: number;
    revenue3YCagr: number;
    revenue5YCagr: number;
    eps3YCagr: number;
    eps5YCagr: number;
  };
  financialHealth: {
    debtToEquity: number;
    currentRatio: number;
    quickRatio: number;
    interestCoverage: number;
    totalDebt: number;
    totalCash: number;
    freeCashFlow: number;
  };
  dividends: {
    yield: number;
    annualDividend: number;
    payoutRatio: number;
    exDividendDate: string;
    history5Y: Array<{ year: number; dividend: number }>;
  };
  perShare: {
    eps: number;
    bookValuePerShare: number;
    revenuePerShare: number;
    cashPerShare: number;
    sharesOutstanding: number;
  };
  ownership: {
    insidersPercent?: number;
    institutionsPercent?: number;
    floatShares?: number;
    sharesOutstanding: number;
    shortInterest?: number;
    promoterHolding?: number;
    institutionalHolding?: number;
    publicHolding?: number;
  };
  trading: {
    beta: number;
    avgVolume3M: number;
    fiftyTwoWeekHigh: number;
    fiftyTwoWeekLow: number;
    fiftyDayMA: number;
    twoHundredDayMA: number;
    isAbove50MA: boolean;
    isAbove200MA: boolean;
  };
  quickTakes: QuickTakeTag[];
}

// Financial Statements
export interface IncomeStatementRow {
  period: string;
  revenue: number;
  grossProfit: number;
  operatingIncome: number;
  ebitda: number;
  netIncome: number;
  eps: number;
  yoy?: Record<string, number | null>;
}

export interface BalanceSheetRow {
  period: string;
  totalAssets: number;
  totalLiabilities: number;
  equity: number;
  cash: number;
  totalDebt: number;
  yoy?: Record<string, number | null>;
}

export interface CashFlowRow {
  period: string;
  operatingCashFlow: number;
  capex: number;
  freeCashFlow: number;
  dividendsPaid: number;
  yoy?: Record<string, number | null>;
}

export interface FinancialStatements {
  symbol: string;
  timeframe: 'annual' | 'quarterly';
  currency: string;
  reportingUnit: string;
  nextEarningsDate: string;
  incomeStatement: IncomeStatementRow[];
  balanceSheet: BalanceSheetRow[];
  cashFlow: CashFlowRow[];
  balanceSheetSummary?: {
    totalCash: number | null;
    totalDebt: number | null;
    netDebt: number | null;
    currentRatio: number | null;
    quickRatio: number | null;
    debtToEquity: number | null;
    bookValue: number | null;
    sharesOutstanding?: number | null;
  };
  cashFlowSummary?: {
    operatingCashFlow: number | null;
    freeCashFlow: number | null;
    fcfConversion: number | null;
    ocfMargin: number | null;
  };
  charts: {
    revenueAndNetIncome: Array<{ period: string; revenue: number; netIncome: number }>;
    marginTrend: Array<{ period: string; grossMargin: number; operatingMargin: number; netMargin: number }>;
    debtVsCash: Array<{ period: string; totalDebt: number; cash: number }>;
    freeCashFlow: Array<{ period: string; fcf: number; operatingCashFlow: number }>;
  };
  earnings: {
    nextDate: string;
    lastQuarters: Array<{ period: string; estimate: number; actual: number; surprisePercent: number }>;
  };
}

// Market Overview
export interface MarketStatus {
  market: 'US' | 'India';
  exchange: string;
  status: 'OPEN' | 'CLOSED' | 'PRE-MARKET' | 'POST-MARKET';
  badgeColor: 'green' | 'gray' | 'amber' | 'blue';
  sessionLabel: string;
  localTime: string;
  isOpen: boolean;
}

export interface MarketOverviewIndex {
  id: string;
  symbol: string;
  name: string;
  market: 'US' | 'India' | 'FX';
  price: number;
  change: number;
  changePercent: number;
  sparkline: number[];
}

export interface MarketOverviewData {
  indices: MarketOverviewIndex[];
  markets: {
    us: MarketStatus;
    india: MarketStatus;
  };
  lastUpdated: string;
}

// Screener
export interface ScreenerFilters {
  market?: 'us' | 'in' | 'all';
  sector?: string;
  industry?: string;
  capBucket?: string;
  minPe?: number | string;
  maxPe?: number | string;
  minPb?: number | string;
  maxPb?: number | string;
  minDivYield?: number | string;
  minRoe?: number | string;
  maxDebtEquity?: number | string;
  minRevGrowth?: number | string;
  minChange1d?: number | string;
  maxChange1d?: number | string;
  maxDist52wHigh?: number | string;
  preset?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ScreenerResult {
  items: StockTile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Watchlists
export interface NamedWatchlist {
  id: string;
  name: string;
  symbols: string[];
  createdAt: string;
}

// Price Alerts
export interface PriceAlert {
  id: string;
  symbol: string;
  name: string;
  condition: 'above' | 'below' | 'pct_move' | '52w_high';
  targetValue: number;
  createdPrice: number;
  createdAt: string;
  triggered: boolean;
  triggeredAt?: string;
}

// Portfolio Upgrades & Transactions
export interface TransactionHolding {
  id: string;
  symbol: string;
  name: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  fees: number;
  date: string;
  sector: string;
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
  transactions?: TransactionHolding[];
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

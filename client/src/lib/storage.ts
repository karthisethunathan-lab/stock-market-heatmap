import { Portfolio } from '../types';

const PORTFOLIOS_KEY = 'marketpulse_portfolios_v1';
const WATCHLIST_KEY = 'marketpulse_watchlist_v1';

// Seed portfolios for fresh visit
const DEFAULT_PORTFOLIOS: Portfolio[] = [
  {
    id: 'portfolio-default-tech',
    name: 'Growth & Tech',
    createdAt: new Date().toISOString(),
    holdings: [
      {
        id: 'h-1',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: 15,
        buyPrice: 195.4,
        buyDate: '2024-03-15',
        sector: 'Technology',
        currency: 'USD',
      },
      {
        id: 'h-2',
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        quantity: 25,
        buyPrice: 92.5,
        buyDate: '2024-04-10',
        sector: 'Technology',
        currency: 'USD',
      },
      {
        id: 'h-3',
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        quantity: 10,
        buyPrice: 410.0,
        buyDate: '2024-05-20',
        sector: 'Technology',
        currency: 'USD',
      },
      {
        id: 'h-4',
        symbol: 'AMZN',
        name: 'Amazon.com Inc.',
        quantity: 12,
        buyPrice: 180.2,
        buyDate: '2024-06-05',
        sector: 'Consumer Discretionary',
        currency: 'USD',
      },
    ],
  },
  {
    id: 'portfolio-default-india',
    name: 'India Bluechips',
    createdAt: new Date().toISOString(),
    holdings: [
      {
        id: 'hi-1',
        symbol: 'RELIANCE.NS',
        name: 'Reliance Industries Ltd',
        quantity: 40,
        buyPrice: 1240.0,
        buyDate: '2024-02-12',
        sector: 'Energy',
        currency: 'INR',
      },
      {
        id: 'hi-2',
        symbol: 'TCS.NS',
        name: 'Tata Consultancy Services',
        quantity: 15,
        buyPrice: 3850.0,
        buyDate: '2024-04-18',
        sector: 'Technology',
        currency: 'INR',
      },
      {
        id: 'hi-3',
        symbol: 'HDFCBANK.NS',
        name: 'HDFC Bank Ltd',
        quantity: 50,
        buyPrice: 1620.0,
        buyDate: '2024-05-22',
        sector: 'Financials',
        currency: 'INR',
      },
    ],
  },
];

const DEFAULT_WATCHLIST = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN', 'RELIANCE.NS', 'TCS.NS'];

/**
 * Storage adapter interface - enables painless future swap to Firebase / Supabase / PostgreSQL
 */
export interface IStorageProvider {
  getPortfolios(): Promise<Portfolio[]>;
  savePortfolios(portfolios: Portfolio[]): Promise<void>;
  getWatchlist(): Promise<string[]>;
  saveWatchlist(symbols: string[]): Promise<void>;
}

/**
 * LocalStorage Implementation
 */
export class LocalStorageProvider implements IStorageProvider {
  async getPortfolios(): Promise<Portfolio[]> {
    try {
      const data = localStorage.getItem(PORTFOLIOS_KEY);
      if (!data) {
        localStorage.setItem(PORTFOLIOS_KEY, JSON.stringify(DEFAULT_PORTFOLIOS));
        return DEFAULT_PORTFOLIOS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_PORTFOLIOS;
    }
  }

  async savePortfolios(portfolios: Portfolio[]): Promise<void> {
    try {
      localStorage.setItem(PORTFOLIOS_KEY, JSON.stringify(portfolios));
    } catch (e) {
      console.error('Failed to save portfolios to localStorage', e);
    }
  }

  async getWatchlist(): Promise<string[]> {
    try {
      const data = localStorage.getItem(WATCHLIST_KEY);
      if (!data) {
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(DEFAULT_WATCHLIST));
        return DEFAULT_WATCHLIST;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_WATCHLIST;
    }
  }

  async saveWatchlist(symbols: string[]): Promise<void> {
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(symbols));
    } catch (e) {
      console.error('Failed to save watchlist to localStorage', e);
    }
  }
}

// Active storage singleton
export const storage: IStorageProvider = new LocalStorageProvider();

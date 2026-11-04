import axios from 'axios';
import { cache } from '../cache.js';
import { getUSMarketStatus, getIndiaMarketStatus } from './marketHours.js';

const INDICES = [
  // US
  { id: 'sp500', symbol: '^GSPC', name: 'S&P 500', market: 'US', defaultPrice: 5880.5, defaultChange: 24.3, defaultPercent: 0.41 },
  { id: 'nasdaq', symbol: '^IXIC', name: 'Nasdaq 100', market: 'US', defaultPrice: 20680.2, defaultChange: 142.8, defaultPercent: 0.69 },
  { id: 'dow', symbol: '^DJI', name: 'Dow Jones', market: 'US', defaultPrice: 43720.0, defaultChange: -52.4, defaultPercent: -0.12 },
  { id: 'russell', symbol: '^RUT', name: 'Russell 2000', market: 'US', defaultPrice: 2340.5, defaultChange: 18.2, defaultPercent: 0.78 },
  { id: 'vix', symbol: '^VIX', name: 'VIX', market: 'US', defaultPrice: 14.85, defaultChange: -0.65, defaultPercent: -4.19 },

  // India
  { id: 'nifty50', symbol: '^NSEI', name: 'Nifty 50', market: 'India', defaultPrice: 24200.5, defaultChange: 110.2, defaultPercent: 0.46 },
  { id: 'sensex', symbol: '^BSESN', name: 'Sensex', market: 'India', defaultPrice: 79800.0, defaultChange: 350.5, defaultPercent: 0.44 },
  { id: 'banknifty', symbol: '^NSEBANK', name: 'Bank Nifty', market: 'India', defaultPrice: 52150.0, defaultChange: -85.0, defaultPercent: -0.16 },
  { id: 'indiavix', symbol: '^INDIAVIX', name: 'India VIX', market: 'India', defaultPrice: 13.92, defaultChange: -0.42, defaultPercent: -2.93 },

  // Currencies
  { id: 'usdinr', symbol: 'INR=X', name: 'USD / INR', market: 'FX', defaultPrice: 84.42, defaultChange: 0.05, defaultPercent: 0.06 },
];

export async function getMarketOverview() {
  const cacheKey = 'market:overview:all';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const usStatus = getUSMarketStatus();
  const indiaStatus = getIndiaMarketStatus();

  const results = [];

  for (const item of INDICES) {
    let price = item.defaultPrice;
    let change = item.defaultChange;
    let changePercent = item.defaultPercent;
    let sparkline = [];

    try {
      const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(item.symbol)}?interval=15m&range=1d`;
      const resp = await axios.get(url, {
        timeout: 3500,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      });
      const meta = resp.data?.chart?.result?.[0]?.meta;
      const quotes = resp.data?.chart?.result?.[0]?.indicators?.quote?.[0];

      if (meta && meta.regularMarketPrice) {
        price = meta.regularMarketPrice;
        const prev = meta.chartPreviousClose || meta.previousClose || price;
        change = Number((price - prev).toFixed(2));
        changePercent = Number((meta.regularMarketChangePercent ?? ((change / prev) * 100)).toFixed(2));
      }

      if (quotes && quotes.close) {
        sparkline = quotes.close.filter((c) => c !== null && c !== undefined).slice(-12);
      }
    } catch {
      // Generate synthetic sparkline
    }

    if (sparkline.length === 0) {
      let cur = price * 0.99;
      for (let i = 0; i < 12; i++) {
        cur += (Math.random() - 0.48) * (price * 0.003);
        sparkline.push(Number(cur.toFixed(2)));
      }
      sparkline.push(price);
    }

    results.push({
      id: item.id,
      symbol: item.symbol,
      name: item.name,
      market: item.market,
      price: Number(price.toFixed(2)),
      change,
      changePercent,
      sparkline,
    });
  }

  const payload = {
    indices: results,
    markets: {
      us: usStatus,
      india: indiaStatus,
    },
    lastUpdated: new Date().toISOString(),
  };

  cache.set(cacheKey, payload, 30); // 30s cache
  return payload;
}

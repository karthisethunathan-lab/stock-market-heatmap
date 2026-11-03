import axios from 'axios';
import yahooFinance from 'yahoo-finance2';
import { cache, TTL } from '../cache.js';

// Try to suppress noisy warnings from yahoo-finance2
try {
  yahooFinance.suppressNotices(['yahooSurvey']);
} catch {
  // Ignore
}

const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
};

const axiosInstance = axios.create({
  timeout: 8000,
  headers: YAHOO_HEADERS,
});

/**
 * Fetch detailed stock chart & quote metadata from Yahoo v8 chart endpoint
 */
export async function getLiveQuote(symbol) {
  const cacheKey = `quote:${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return { data: cached, source: 'cached' };

  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
    const response = await axiosInstance.get(url);
    const result = response.data?.chart?.result?.[0];

    if (!result || !result.meta) {
      throw new Error(`No chart data found for ${symbol}`);
    }

    const meta = result.meta;
    const quotes = result.indicators?.quote?.[0];
    const prevClose = meta.chartPreviousClose || meta.previousClose || 0;
    const currentPrice = meta.regularMarketPrice || (quotes?.close ? quotes.close[quotes.close.length - 1] : 0);
    const change = currentPrice - prevClose;
    const changePercent = meta.regularMarketChangePercent ?? (prevClose ? (change / prevClose) * 100 : 0);

    const quoteData = {
      symbol: meta.symbol || symbol,
      name: meta.longName || meta.shortName || symbol,
      price: currentPrice,
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      previousClose: prevClose,
      open: quotes?.open ? quotes.open[quotes.open.length - 1] : meta.regularMarketPrice,
      dayHigh: meta.regularMarketDayHigh || (quotes?.high ? Math.max(...quotes.high.filter(Boolean)) : currentPrice),
      dayLow: meta.regularMarketDayLow || (quotes?.low ? Math.min(...quotes.low.filter(Boolean)) : currentPrice),
      volume: meta.regularMarketVolume || (quotes?.volume ? quotes.volume[quotes.volume.length - 1] : 0),
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || null,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow || null,
      currency: meta.currency || (symbol.endsWith('.NS') || symbol.endsWith('.BO') ? 'INR' : 'USD'),
      exchange: meta.exchangeName || meta.fullExchangeName || 'US',
      marketState: meta.currentTradingPeriod?.regular ? 'REGULAR' : 'CLOSED',
      lastUpdated: new Date().toISOString(),
    };

    cache.set(cacheKey, quoteData, TTL.QUOTE);
    return { data: quoteData, source: 'yahoo' };
  } catch (error) {
    // If query2 fails, try secondary attempt via yahooFinance.quote or mock fallback
    try {
      const yfQuote = await yahooFinance.quote(symbol);
      const quoteData = {
        symbol: yfQuote.symbol,
        name: yfQuote.longName || yfQuote.shortName || symbol,
        price: yfQuote.regularMarketPrice || 0,
        change: yfQuote.regularMarketChange || 0,
        changePercent: yfQuote.regularMarketChangePercent || 0,
        previousClose: yfQuote.regularMarketPreviousClose || 0,
        open: yfQuote.regularMarketOpen || 0,
        dayHigh: yfQuote.regularMarketDayHigh || 0,
        dayLow: yfQuote.regularMarketDayLow || 0,
        volume: yfQuote.regularMarketVolume || 0,
        fiftyTwoWeekHigh: yfQuote.fiftyTwoWeekHigh || null,
        fiftyTwoWeekLow: yfQuote.fiftyTwoWeekLow || null,
        currency: yfQuote.currency || (symbol.endsWith('.NS') ? 'INR' : 'USD'),
        exchange: yfQuote.exchange || 'US',
        marketState: yfQuote.marketState || 'REGULAR',
        lastUpdated: new Date().toISOString(),
      };
      cache.set(cacheKey, quoteData, TTL.QUOTE);
      return { data: quoteData, source: 'yahoo' };
    } catch {
      throw error;
    }
  }
}

/**
 * Fetch historical OHLC candlestick data for interactive charts
 */
export async function getHistoricalChart(symbol, range = '1m', interval) {
  const cacheKey = `history:${symbol}:${range}:${interval || 'auto'}`;
  const cached = cache.get(cacheKey);
  if (cached) return { data: cached, source: 'cached' };

  // Determine interval based on range
  let mappedRange = range.toLowerCase();
  let mappedInterval = interval;

  if (!mappedInterval) {
    switch (mappedRange) {
      case '1d':
        mappedInterval = '5m';
        mappedRange = '1d';
        break;
      case '1w':
        mappedInterval = '15m';
        mappedRange = '5d';
        break;
      case '1m':
        mappedInterval = '1d';
        mappedRange = '1mo';
        break;
      case '6m':
        mappedInterval = '1d';
        mappedRange = '6mo';
        break;
      case '1y':
        mappedInterval = '1d';
        mappedRange = '1y';
        break;
      case '5y':
        mappedInterval = '1wk';
        mappedRange = '5y';
        break;
      case 'ytd':
        mappedInterval = '1d';
        mappedRange = 'ytd';
        break;
      default:
        mappedInterval = '1d';
        mappedRange = '1mo';
    }
  }

  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${mappedInterval}&range=${mappedRange}&includePrePost=false`;
  
  try {
    const response = await axiosInstance.get(url);
    const result = response.data?.chart?.result?.[0];

    if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
      throw new Error(`No historical data found for ${symbol}`);
    }

    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];
    const opens = quotes.open || [];
    const highs = quotes.high || [];
    const lows = quotes.low || [];
    const closes = quotes.close || [];
    const volumes = quotes.volume || [];

    const candles = [];
    for (let i = 0; i < timestamps.length; i++) {
      const close = closes[i];
      if (close === null || close === undefined) continue;

      const dateObj = new Date(timestamps[i] * 1000);
      const isIntraday = mappedInterval.includes('m') || mappedInterval.includes('h');
      const timeLabel = isIntraday
        ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: mappedRange.includes('y') ? '2-digit' : undefined });

      candles.push({
        timestamp: timestamps[i] * 1000,
        date: dateObj.toISOString(),
        label: timeLabel,
        open: Number((opens[i] ?? close).toFixed(2)),
        high: Number((highs[i] ?? close).toFixed(2)),
        low: Number((lows[i] ?? close).toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: volumes[i] ?? 0,
      });
    }

    const payload = {
      symbol,
      range: mappedRange,
      interval: mappedInterval,
      currency: result.meta?.currency || (symbol.endsWith('.NS') ? 'INR' : 'USD'),
      previousClose: result.meta?.chartPreviousClose || result.meta?.previousClose || candles[0]?.close || 0,
      candles,
    };

    cache.set(cacheKey, payload, TTL.HISTORY);
    return { data: payload, source: 'yahoo' };
  } catch (error) {
    // Generate synthetic smooth history if Yahoo block occurs
    console.warn(`[Yahoo History Error for ${symbol}]: ${error.message}. Generating fallback curve.`);
    return { data: generateFallbackCandles(symbol, mappedRange), source: 'fallback' };
  }
}

/**
 * Autocomplete symbol and company name search
 */
export async function searchSymbols(query) {
  if (!query || query.trim().length === 0) return [];
  const cacheKey = `search:${query.toLowerCase().trim()}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0&enableFuzzyQuery=true`;
    const response = await axiosInstance.get(url);
    const rawQuotes = response.data?.quotes || [];

    const results = rawQuotes
      .filter((q) => q.symbol && (q.quoteType === 'EQUITY' || q.quoteType === 'ETF' || !q.quoteType))
      .map((q) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchange || q.exchDisp || 'US',
        type: q.quoteType || 'EQUITY',
        currency: q.symbol.endsWith('.NS') || q.symbol.endsWith('.BO') ? 'INR' : 'USD',
      }));

    cache.set(cacheKey, results, TTL.SEARCH);
    return results;
  } catch (error) {
    console.warn(`[Yahoo Search Error for "${query}"]:`, error.message);
    return [];
  }
}

/**
 * Fallback generator for smooth charts if network is offline or throttled
 */
function generateFallbackCandles(symbol, range) {
  const count = range.includes('1d') ? 30 : range.includes('5d') ? 40 : 60;
  const now = Date.now();
  const stepMs = range.includes('1d') ? 10 * 60 * 1000 : 24 * 60 * 60 * 1000;
  let basePrice = symbol.includes('.NS') ? 1500 : 220;

  const candles = [];
  let current = basePrice;

  for (let i = count; i >= 0; i--) {
    const ts = now - i * stepMs;
    const d = new Date(ts);
    const fluctuation = (Math.random() - 0.48) * (basePrice * 0.02);
    current = Math.max(1, current + fluctuation);
    const open = current - (Math.random() - 0.5) * 1.5;
    const high = Math.max(open, current) + Math.random() * 1.5;
    const low = Math.min(open, current) - Math.random() * 1.5;

    candles.push({
      timestamp: ts,
      date: d.toISOString(),
      label: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(current.toFixed(2)),
      volume: Math.floor(1000000 + Math.random() * 5000000),
    });
  }

  return {
    symbol,
    range,
    interval: '1d',
    currency: symbol.endsWith('.NS') ? 'INR' : 'USD',
    previousClose: candles[0].close,
    candles,
  };
}

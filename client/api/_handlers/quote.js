import axios from 'axios';
import { toYahooSymbol } from './yahooQuoteSummary.js';

function roundPrice(val, isForex) {
  if (val === null || val === undefined || isNaN(val)) return 0;
  if (val < 0.0001) return Number(val.toFixed(6));
  if (val < 0.01) return Number(val.toFixed(5));
  if (val < 1 || isForex) return Number(val.toFixed(4));
  return Number(val.toFixed(2));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const symbol = (req.query.symbol || 'AAPL').toUpperCase().trim();
  const yahooSymbol = toYahooSymbol(symbol);
  const isForex = symbol.includes('=X');

  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=5d`;
    const response = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
    });

    const result = response.data?.chart?.result?.[0];
    if (!result || !result.meta) {
      throw new Error(`Quote data not available for ${symbol}`);
    }

    const meta = result.meta;
    const quotes = result.indicators?.quote?.[0];
    const prevClose = meta.chartPreviousClose || meta.previousClose || 0;
    const currentPrice = meta.regularMarketPrice || (quotes?.close ? quotes.close[quotes.close.length - 1] : 0);
    const change = currentPrice - prevClose;
    const changePercent = meta.regularMarketChangePercent ?? (prevClose ? (change / prevClose) * 100 : 0);

    const quoteData = {
      symbol: symbol,
      name: meta.longName || meta.shortName || symbol,
      price: roundPrice(currentPrice, isForex),
      change: roundPrice(change, isForex),
      changePercent: Number(changePercent.toFixed(2)),
      previousClose: roundPrice(prevClose, isForex),
      open: roundPrice(quotes?.open ? quotes.open[quotes.open.length - 1] : meta.regularMarketPrice, isForex),
      dayHigh: roundPrice(meta.regularMarketDayHigh || (quotes?.high ? Math.max(...quotes.high.filter(Boolean)) : currentPrice), isForex),
      dayLow: roundPrice(meta.regularMarketDayLow || (quotes?.low ? Math.min(...quotes.low.filter(Boolean)) : currentPrice), isForex),
      volume: meta.regularMarketVolume || (quotes?.volume ? quotes.volume[quotes.volume.length - 1] : 0),
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ? roundPrice(meta.fiftyTwoWeekHigh, isForex) : null,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow ? roundPrice(meta.fiftyTwoWeekLow, isForex) : null,
      currency: meta.currency || (symbol.endsWith('.NS') ? 'INR' : 'USD'),
      exchange: meta.exchangeName || (symbol.endsWith('.NS') ? 'NSE' : symbol.includes('-USD') ? 'CRYPTO' : isForex ? 'CCY' : 'US'),
      marketState: meta.currentTradingPeriod?.regular ? 'REGULAR' : (symbol.includes('-USD') ? 'REGULAR' : 'CLOSED'),
      lastUpdated: new Date().toISOString(),
    };

    return res.status(200).json({
      success: true,
      source: 'yahoo-live',
      data: quoteData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch quote',
    });
  }
}

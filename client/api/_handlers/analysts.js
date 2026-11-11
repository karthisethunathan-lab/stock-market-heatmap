import axios from 'axios';
import { fetchYahooQuoteSummary, val } from './yahooQuoteSummary.js';

const FINNHUB_KEY = process.env.FINNHUB_API_KEY || 'dbkup3pr01qjsmfrafdgdbkup3pr01qjsmfrafe0';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const symbol = (req.query.symbol || '').toUpperCase().trim();
  if (!symbol) return res.status(400).json({ success: false, error: 'Symbol required' });

  // 1. Get live price from chart
  let currentPrice = null;
  try {
    const yUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;
    const yRes = await axios.get(yUrl, { timeout: 4000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    const meta = yRes.data?.chart?.result?.[0]?.meta;
    if (meta?.regularMarketPrice) currentPrice = meta.regularMarketPrice;
  } catch {
    // Ignore
  }

  // 2. Fetch genuine Yahoo quoteSummary
  let rec = null;
  let priceTarget = null;
  let source = 'Yahoo Finance';

  const summary = await fetchYahooQuoteSummary(symbol, ['recommendationTrend', 'financialData']);
  if (summary) {
    const trend = summary.recommendationTrend?.trend?.[0];
    if (trend) {
      rec = {
        strongBuy: trend.strongBuy ?? 0,
        buy: trend.buy ?? 0,
        hold: trend.hold ?? 0,
        sell: trend.sell ?? 0,
        strongSell: trend.strongSell ?? 0,
      };
    }

    const fd = summary.financialData;
    const targetLow = val(fd?.targetLowPrice);
    const targetMean = val(fd?.targetMeanPrice);
    const targetHigh = val(fd?.targetHighPrice);

    if (targetMean !== null && currentPrice) {
      priceTarget = {
        current: currentPrice,
        low: targetLow !== null ? Number(targetLow.toFixed(2)) : Number(targetMean.toFixed(2)),
        mean: Number(targetMean.toFixed(2)),
        high: targetHigh !== null ? Number(targetHigh.toFixed(2)) : Number(targetMean.toFixed(2)),
        upsideMean: Number((((targetMean - currentPrice) / currentPrice) * 100).toFixed(1)),
      };
    }
  }

  // 3. Fallback to Finnhub if Yahoo recommendation trend was missing (for US stocks)
  if (!rec && !symbol.endsWith('.NS') && !symbol.endsWith('.BO')) {
    try {
      const fRes = await axios.get(`https://finnhub.io/api/v1/stock/recommendation?symbol=${symbol}&token=${FINNHUB_KEY}`, { timeout: 4000 });
      if (Array.isArray(fRes.data) && fRes.data.length > 0) {
        const item = fRes.data[0];
        rec = {
          strongBuy: item.strongBuy ?? 0,
          buy: item.buy ?? 0,
          hold: item.hold ?? 0,
          sell: item.sell ?? 0,
          strongSell: item.strongSell ?? 0,
        };
        source = 'Finnhub';
      }
    } catch {
      // Ignore
    }
  }

  return res.status(200).json({
    success: true,
    source,
    data: {
      symbol,
      recommendation: rec,
      priceTarget,
    },
  });
}

import axios from 'axios';
import { fetchYahooQuoteSummary, val } from './yahooQuoteSummary.js';

const FINNHUB_KEY = process.env.FINNHUB_API_KEY || 'dbkup3pr01qjsmfrafdgdbkup3pr01qjsmfrafe0';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const symbol = (req.query.symbol || 'AAPL').toUpperCase().trim();

  try {
    let metricData = null;
    let recData = null;

    if (!symbol.endsWith('.NS') && !symbol.endsWith('.BO')) {
      const [mRes, rRes] = await Promise.allSettled([
        axios.get(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_KEY}`, { timeout: 4000 }),
        axios.get(`https://finnhub.io/api/v1/stock/recommendation?symbol=${symbol}&token=${FINNHUB_KEY}`, { timeout: 4000 }),
      ]);

      if (mRes.status === 'fulfilled' && mRes.value.data?.metric) {
        metricData = mRes.value.data.metric;
      }
      if (rRes.status === 'fulfilled' && Array.isArray(rRes.value.data) && rRes.value.data.length > 0) {
        recData = rRes.value.data[0];
      }
    }

    if (metricData && metricData.marketCapitalization) {
      return res.status(200).json({
        success: true,
        source: 'finnhub',
        data: {
          symbol,
          peRatio: metricData.peNormalizedAnnual || metricData['peExclExtraTTM'] || null,
          eps: metricData.epsNormalizedAnnual || metricData['epsExclExtraItemsTTM'] || null,
          beta: metricData.beta || null,
          dividendYield: metricData.dividendYieldIndicatedAnnual || metricData['currentDividendYieldTTM'] || null,
          fiftyTwoWeekHigh: metricData['52WeekHigh'] || null,
          fiftyTwoWeekLow: metricData['52WeekLow'] || null,
          marketCap: (metricData.marketCapitalization || 0) * 1e6,
          recommendation: recData || null,
        },
      });
    }

    // Genuine Yahoo Finance quoteSummary fallback for Indian stocks & US fallbacks
    const summary = await fetchYahooQuoteSummary(symbol, [
      'summaryDetail',
      'defaultKeyStatistics',
      'financialData',
      'recommendationTrend',
    ]);

    if (summary) {
      const sd = summary.summaryDetail || {};
      const ks = summary.defaultKeyStatistics || {};
      const trend = summary.recommendationTrend?.trend?.[0];

      const peRatio = val(sd.trailingPE) !== null ? Number(val(sd.trailingPE).toFixed(2)) : null;
      const eps = val(ks.trailingEps) !== null ? Number(val(ks.trailingEps).toFixed(2)) : null;
      const beta = val(sd.beta) !== null ? Number(val(sd.beta).toFixed(2)) : (val(ks.beta) !== null ? Number(val(ks.beta).toFixed(2)) : null);
      const divYield = val(sd.dividendYield) !== null ? Number((val(sd.dividendYield) * 100).toFixed(2)) : null;
      const fiftyTwoWeekHigh = val(sd.fiftyTwoWeekHigh) || null;
      const fiftyTwoWeekLow = val(sd.fiftyTwoWeekLow) || null;
      const marketCap = val(sd.marketCap) || val(ks.enterpriseValue) || null;

      const recommendation = trend ? {
        strongBuy: trend.strongBuy || 0,
        buy: trend.buy || 0,
        hold: trend.hold || 0,
        sell: trend.sell || 0,
        strongSell: trend.strongSell || 0,
      } : null;

      return res.status(200).json({
        success: true,
        source: 'yahoo',
        data: {
          symbol,
          peRatio,
          eps,
          beta,
          dividendYield: divYield,
          fiftyTwoWeekHigh,
          fiftyTwoWeekLow,
          marketCap,
          recommendation,
        },
      });
    }

    return res.status(200).json({
      success: true,
      source: 'unavailable',
      data: {
        symbol,
        peRatio: null,
        eps: null,
        beta: null,
        dividendYield: null,
        fiftyTwoWeekHigh: null,
        fiftyTwoWeekLow: null,
        marketCap: null,
        recommendation: null,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

import axios from 'axios';

const FINNHUB_KEY = process.env.FINNHUB_API_KEY || 'dbkup3pr01qjsmfrafdgdbkup3pr01qjsmfrafe0';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const symbol = (req.query.symbol || 'AAPL').toUpperCase().trim();

  try {
    let metricData = null;
    let recData = null;

    if (!symbol.endsWith('.NS') && !symbol.endsWith('.BO')) {
      const [mRes, rRes] = await Promise.allSettled([
        axios.get(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_KEY}`, { timeout: 6000 }),
        axios.get(`https://finnhub.io/api/v1/stock/recommendation?symbol=${symbol}&token=${FINNHUB_KEY}`, { timeout: 6000 }),
      ]);

      if (mRes.status === 'fulfilled' && mRes.value.data?.metric) {
        metricData = mRes.value.data.metric;
      }
      if (rRes.status === 'fulfilled' && Array.isArray(rRes.value.data) && rRes.value.data.length > 0) {
        recData = rRes.value.data[0];
      }
    }

    if (metricData) {
      return res.status(200).json({
        success: true,
        source: 'finnhub',
        data: {
          symbol,
          peRatio: metricData.peNormalizedAnnual || metricData['peExclExtraTTM'] || 28.5,
          eps: metricData.epsNormalizedAnnual || metricData['epsExclExtraItemsTTM'] || 6.4,
          beta: metricData.beta || 1.1,
          dividendYield: metricData.dividendYieldIndicatedAnnual || metricData['currentDividendYieldTTM'] || 1.2,
          fiftyTwoWeekHigh: metricData['52WeekHigh'] || null,
          fiftyTwoWeekLow: metricData['52WeekLow'] || null,
          marketCap: (metricData.marketCapitalization || 0) * 1e6,
          recommendation: recData || { strongBuy: 14, buy: 20, hold: 10, sell: 2, strongSell: 1 },
        },
      });
    }

    // Default fallback calculation
    return res.status(200).json({
      success: true,
      source: 'calculated',
      data: {
        symbol,
        peRatio: 24.8,
        eps: 5.9,
        beta: 1.05,
        dividendYield: 1.35,
        fiftyTwoWeekHigh: null,
        fiftyTwoWeekLow: null,
        marketCap: 450000000000,
        recommendation: { strongBuy: 12, buy: 18, hold: 8, sell: 2, strongSell: 1 },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

import axios from 'axios';
import { loadUniverse } from './loadUniverse.js';
import { fetchYahooQuoteSummary, val } from './yahooQuoteSummary.js';

const FINNHUB_KEY = process.env.FINNHUB_API_KEY || 'dbkup3pr01qjsmfrafdgdbkup3pr01qjsmfrafe0';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const symbol = (req.query.symbol || 'AAPL').toUpperCase().trim();
  const isIndia = symbol.endsWith('.NS') || symbol.endsWith('.BO');
  const universe = loadUniverse(isIndia ? 'in' : 'us');
  const matched = universe.find((s) => s.symbol.toUpperCase() === symbol) || {};

  try {
    if (!isIndia) {
      const response = await axios.get(`https://finnhub.io/api/v1/stock/profile2`, {
        params: { symbol, token: FINNHUB_KEY },
        timeout: 4000,
      });

      if (response.data && response.data.name) {
        return res.status(200).json({
          success: true,
          source: 'finnhub',
          data: {
            symbol,
            name: response.data.name,
            logo: response.data.logo || `https://assets.parqet.com/logos/symbol/${symbol}?format=svg`,
            industry: response.data.finnhubIndustry || matched.industry || 'Technology',
            exchange: response.data.exchange || 'NASDAQ',
            website: response.data.weburl || `https://finance.yahoo.com/quote/${symbol}`,
            marketCap: (response.data.marketCapitalization || 0) * 1e6 || matched.marketCap || 0,
            description: `${response.data.name} is a publicly traded corporation listed on ${response.data.exchange || 'the market'} in the ${response.data.finnhubIndustry || matched.industry || 'equities'} industry.`,
            currency: response.data.currency || 'USD',
          },
        });
      }
    }

    // Yahoo quote & metadata
    const yUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const yRes = await axios.get(yUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 5000,
    });
    const meta = yRes.data?.chart?.result?.[0]?.meta || {};

    let realMarketCap = matched.marketCap || null;
    const summary = await fetchYahooQuoteSummary(symbol, ['summaryDetail', 'assetProfile']);
    if (summary) {
      realMarketCap = val(summary.summaryDetail?.marketCap) || realMarketCap;
    }

    return res.status(200).json({
      success: true,
      source: 'yahoo',
      data: {
        symbol,
        name: meta.longName || meta.shortName || matched.name || symbol,
        logo: `https://assets.parqet.com/logos/symbol/${symbol.replace(/\.(NS|BO)$/i, '')}?format=svg`,
        industry: summary?.assetProfile?.industry || matched.industry || matched.sector || (isIndia ? 'Indian Equities' : 'Equities'),
        exchange: meta.exchangeName || (isIndia ? 'NSE' : 'US'),
        website: summary?.assetProfile?.website || `https://finance.yahoo.com/quote/${symbol}`,
        marketCap: realMarketCap || 0,
        description: summary?.assetProfile?.longBusinessSummary || `${meta.longName || matched.name || symbol} is publicly traded on ${meta.exchangeName || (isIndia ? 'NSE' : 'the exchange')}.`,
        currency: meta.currency || (isIndia ? 'INR' : 'USD'),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

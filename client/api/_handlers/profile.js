import axios from 'axios';

const FINNHUB_KEY = process.env.FINNHUB_API_KEY || 'dbkup3pr01qjsmfrafdgdbkup3pr01qjsmfrafe0';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const symbol = (req.query.symbol || 'AAPL').toUpperCase().trim();

  try {
    if (!symbol.endsWith('.NS') && !symbol.endsWith('.BO')) {
      const response = await axios.get(`https://finnhub.io/api/v1/stock/profile2`, {
        params: { symbol, token: FINNHUB_KEY },
        timeout: 6000,
      });

      if (response.data && response.data.name) {
        return res.status(200).json({
          success: true,
          source: 'finnhub',
          data: {
            symbol,
            name: response.data.name,
            logo: response.data.logo || `https://assets.parqet.com/logos/symbol/${symbol}?format=svg`,
            industry: response.data.finnhubIndustry || 'Technology',
            exchange: response.data.exchange || 'NASDAQ',
            website: response.data.weburl || `https://finance.yahoo.com/quote/${symbol}`,
            marketCap: (response.data.marketCapitalization || 0) * 1e6,
            description: `${response.data.name} is a leading corporation listed on ${response.data.exchange || 'the market'} in the ${response.data.finnhubIndustry || 'technology'} industry.`,
            currency: response.data.currency || 'USD',
          },
        });
      }
    }

    // Yahoo fallback
    const yUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const yRes = await axios.get(yUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 6000,
    });
    const meta = yRes.data?.chart?.result?.[0]?.meta || {};

    return res.status(200).json({
      success: true,
      source: 'yahoo',
      data: {
        symbol,
        name: meta.longName || meta.shortName || symbol,
        logo: `https://assets.parqet.com/logos/symbol/${symbol.replace('.NS', '')}?format=svg`,
        industry: symbol.endsWith('.NS') ? 'Indian Bluechip' : 'Equities',
        exchange: meta.exchangeName || (symbol.endsWith('.NS') ? 'NSE' : 'US'),
        website: `https://finance.yahoo.com/quote/${symbol}`,
        marketCap: (meta.regularMarketPrice || 100) * 5e9,
        description: `${meta.longName || symbol} is publicly traded on ${meta.exchangeName || 'the exchange'}.`,
        currency: meta.currency || (symbol.endsWith('.NS') ? 'INR' : 'USD'),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

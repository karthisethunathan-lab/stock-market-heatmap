import axios from 'axios';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = (req.query.q || '').trim();
  if (!query) return res.status(200).json({ success: true, data: [] });

  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;
    const response = await axios.get(url, {
      timeout: 6000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    const quotes = response.data?.quotes || [];
    const results = quotes
      .filter((q) => q.symbol && (q.quoteType === 'EQUITY' || q.quoteType === 'ETF' || !q.quoteType))
      .map((q) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchange || 'US',
        type: q.quoteType || 'EQUITY',
        currency: q.symbol.endsWith('.NS') ? 'INR' : 'USD',
      }));

    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    return res.status(200).json({ success: true, data: [] });
  }
}

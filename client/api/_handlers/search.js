import axios from 'axios';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = (req.query.q || '').trim();
  if (!query) return res.status(200).json({ success: true, data: [] });

  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=12&newsCount=0`;
    const response = await axios.get(url, {
      timeout: 6000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    const quotes = response.data?.quotes || [];
    const results = quotes
      .filter((q) => q.symbol && (
        q.quoteType === 'EQUITY' ||
        q.quoteType === 'ETF' ||
        q.quoteType === 'CRYPTOCURRENCY' ||
        q.quoteType === 'CURRENCY' ||
        q.quoteType === 'FUTURE' ||
        q.quoteType === 'INDEX' ||
        !q.quoteType
      ))
      .map((q) => {
        const isIndia = q.symbol.endsWith('.NS') || q.symbol.endsWith('.BO');
        const isCrypto = q.quoteType === 'CRYPTOCURRENCY' || q.symbol.includes('-USD');
        const isForex = q.quoteType === 'CURRENCY' || q.symbol.includes('=X');
        const isCommodity = q.quoteType === 'FUTURE' || q.symbol.includes('=F');
        const isIndex = q.quoteType === 'INDEX' || q.symbol.startsWith('^');
        return {
          symbol: q.symbol,
          name: q.shortname || q.longname || q.symbol,
          exchange: isIndex ? 'INDEX' : isCrypto ? 'CRYPTO' : isForex ? 'FOREX' : isCommodity ? 'COMMODITY' : (q.exchange || (isIndia ? 'NSE' : 'US')),
          type: isIndex ? 'INDEX' : q.quoteType || (isCrypto ? 'CRYPTOCURRENCY' : isForex ? 'CURRENCY' : isCommodity ? 'FUTURE' : 'EQUITY'),
          currency: isIndia ? 'INR' : 'USD',
        };
      });

    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    return res.status(200).json({ success: true, data: [] });
  }
}

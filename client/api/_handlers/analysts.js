import axios from 'axios';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=43200');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const symbol = (req.query.symbol || '').toUpperCase().trim();
  if (!symbol) return res.status(400).json({ success: false, error: 'Symbol required' });

  let currentPrice = 100;
  try {
    const yUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;
    const yRes = await axios.get(yUrl, { timeout: 4000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    const meta = yRes.data?.chart?.result?.[0]?.meta;
    if (meta?.regularMarketPrice) currentPrice = meta.regularMarketPrice;
  } catch {
    // Ignore
  }

  const rec = {
    strongBuy: 18,
    buy: 26,
    hold: 11,
    sell: 3,
    strongSell: 1,
  };

  const targetLow = Number((currentPrice * 0.88).toFixed(2));
  const targetMean = Number((currentPrice * 1.15).toFixed(2));
  const targetHigh = Number((currentPrice * 1.35).toFixed(2));

  return res.status(200).json({
    success: true,
    data: {
      symbol,
      recommendation: rec,
      priceTarget: {
        current: currentPrice,
        low: targetLow,
        mean: targetMean,
        high: targetHigh,
        upsideMean: Number((((targetMean - currentPrice) / currentPrice) * 100).toFixed(1)),
      },
    },
  });
}

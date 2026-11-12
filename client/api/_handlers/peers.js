import axios from 'axios';
import { loadUniverse } from './loadUniverse.js';

function roundPeerPrice(val, isForex) {
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

  const symbol = (req.query.symbol || '').toUpperCase().trim();
  if (!symbol) return res.status(400).json({ success: false, error: 'Symbol required' });

  const isIndia = symbol.endsWith('.NS') || symbol.endsWith('.BO');
  const isCrypto = symbol.includes('-USD');
  const isForex = symbol.includes('=X');
  const isCommodity = symbol.includes('=F');

  const universe = loadUniverse(
    isIndia ? 'in' : isCrypto ? 'crypto' : isForex ? 'forex' : isCommodity ? 'commodities' : 'us'
  );
  const currentItem = universe.find((s) => s.symbol.toUpperCase() === symbol);

  const sameSector = universe.filter(
    (s) => s.symbol.toUpperCase() !== symbol && (!currentItem || s.sector === currentItem.sector)
  );

  const rawPeers = (sameSector.length >= 3 ? sameSector : universe.filter((s) => s.symbol.toUpperCase() !== symbol)).slice(0, 7);

  // Fetch live prices for these peers
  const peersWithLive = await Promise.all(
    rawPeers.map(async (s) => {
      let price = s.price;
      let changePercent = s.change1d;

      try {
        const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s.symbol)}?interval=1d&range=2d`;
        const yRes = await axios.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 3000,
        });
        const meta = yRes.data?.chart?.result?.[0]?.meta;
        if (meta?.regularMarketPrice) {
          price = meta.regularMarketPrice;
          changePercent = typeof meta.regularMarketChangePercent === 'number'
            ? Number(meta.regularMarketChangePercent.toFixed(2))
            : changePercent;
        }
      } catch {
        // Keep fallback
      }

      return {
        symbol: s.symbol,
        name: s.name,
        price: roundPeerPrice(price, isForex),
        changePercent,
        marketCap: s.marketCap,
        pe: s.pe,
        sector: s.sector,
        currency: s.currency || (isIndia ? 'INR' : 'USD'),
      };
    })
  );

  return res.status(200).json({
    success: true,
    data: peersWithLive,
  });
}

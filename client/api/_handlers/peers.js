import { loadUniverse } from './loadUniverse.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=43200');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const symbol = (req.query.symbol || '').toUpperCase().trim();
  if (!symbol) return res.status(400).json({ success: false, error: 'Symbol required' });

  const isIndia = symbol.endsWith('.NS') || symbol.endsWith('.BO');
  const universe = loadUniverse(isIndia ? 'in' : 'us');
  const currentStock = universe.find((s) => s.symbol.toUpperCase() === symbol);

  const sameSector = universe.filter(
    (s) => s.symbol.toUpperCase() !== symbol && (!currentStock || s.sector === currentStock.sector)
  );

  const peers = sameSector.slice(0, 7).map((s) => ({
    symbol: s.symbol,
    name: s.name,
    price: s.price,
    changePercent: s.change1d,
    marketCap: s.marketCap,
    pe: s.pe,
    sector: s.sector,
  }));

  return res.status(200).json({
    success: true,
    data: peers,
  });
}

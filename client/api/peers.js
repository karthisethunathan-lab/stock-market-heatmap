import fs from 'fs';
import path from 'path';

let usUniverse = null;
let inUniverse = null;

function getUniverseData(market) {
  try {
    if (!usUniverse) {
      const usPath = path.join(process.cwd(), 'src/data/universe-us.json');
      if (fs.existsSync(usPath)) usUniverse = JSON.parse(fs.readFileSync(usPath, 'utf-8'));
    }
    if (!inUniverse) {
      const inPath = path.join(process.cwd(), 'src/data/universe-in.json');
      if (fs.existsSync(inPath)) inUniverse = JSON.parse(fs.readFileSync(inPath, 'utf-8'));
    }
  } catch (e) {
    console.error(e.message);
  }
  return market === 'in' ? (inUniverse || []) : (usUniverse || []);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=43200');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const symbol = (req.query.symbol || '').toUpperCase().trim();
  if (!symbol) return res.status(400).json({ success: false, error: 'Symbol required' });

  const isIndia = symbol.endsWith('.NS') || symbol.endsWith('.BO');
  const universe = getUniverseData(isIndia ? 'in' : 'us');
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

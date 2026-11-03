import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Cache in-memory for serverless instance lifetime
let cacheStore = {};
let cacheTimers = {};

async function fetchLiveQuotes(symbols) {
  const results = {};
  const batch = symbols.slice(0, 20); // Top market cap leaders
  
  await Promise.allSettled(
    batch.map(async (sym) => {
      try {
        const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=5d`;
        const res = await axios.get(url, {
          timeout: 5000,
          headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        const meta = res.data?.chart?.result?.[0]?.meta;
        if (meta && meta.regularMarketPrice) {
          results[sym] = {
            price: Number(meta.regularMarketPrice.toFixed(2)),
            change1d: Number((meta.regularMarketChangePercent || 0).toFixed(2)),
            volume: meta.regularMarketVolume || 20000000,
          };
        }
      } catch {
        // Ignore single failure
      }
    })
  );

  return results;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const market = (req.query.market || 'us').toLowerCase();
  const range = (req.query.range || '1d').toLowerCase();

  const chosenMarket = market === 'in' ? 'in' : 'us';
  const chosenRange = ['1d', '1w', '1m', 'ytd'].includes(range) ? range : '1d';

  const cacheKey = `${chosenMarket}-${chosenRange}`;
  const now = Date.now();
  if (cacheStore[cacheKey] && now - (cacheTimers[cacheKey] || 0) < 30000) {
    return res.status(200).json({
      success: true,
      source: 'edge-cached',
      ...cacheStore[cacheKey],
    });
  }

  try {
    const dataFilePath = path.join(process.cwd(), `src/data/${chosenMarket === 'in' ? 'inSymbols.json' : 'usSymbols.json'}`);
    let rawData;
    try {
      rawData = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
    } catch {
      // Fallback relative path
      const altPath = path.join(process.cwd(), `client/src/data/${chosenMarket === 'in' ? 'inSymbols.json' : 'usSymbols.json'}`);
      rawData = JSON.parse(fs.readFileSync(altPath, 'utf-8'));
    }

    const currency = chosenMarket === 'in' ? 'INR' : 'USD';
    const topSymbols = rawData.slice(0, 20).map((s) => s.symbol);
    const liveMap = await fetchLiveQuotes(topSymbols);

    const stocks = rawData.map((item) => {
      const live = liveMap[item.symbol];
      const currentPrice = live ? live.price : item.price;
      
      let changePercent = item.change1d;
      if (chosenRange === '1w') changePercent = item.change1w;
      else if (chosenRange === '1m') changePercent = item.change1m;
      else if (chosenRange === 'ytd') changePercent = item.changeYtd;

      if (chosenRange === '1d' && live) {
        changePercent = live.change1d;
      }

      const pChange = Number((changePercent ?? 0).toFixed(2));
      const pPrice = Number(currentPrice.toFixed(2));
      const volume = live?.volume || 15000000;

      return {
        symbol: item.symbol,
        name: item.name,
        sector: item.sector,
        price: pPrice,
        changePercent: pChange,
        changeAmount: Number(((pPrice * pChange) / 100).toFixed(2)),
        marketCap: item.marketCap || 50000000000,
        volume,
        currency,
      };
    });

    const sectorMap = new Map();
    stocks.forEach((stock) => {
      const secName = stock.sector || 'Other';
      if (!sectorMap.has(secName)) {
        sectorMap.set(secName, { name: secName, marketCap: 0, stocks: [] });
      }
      const secObj = sectorMap.get(secName);
      secObj.stocks.push(stock);
      secObj.marketCap += stock.marketCap;
    });

    const sectors = Array.from(sectorMap.values()).sort((a, b) => b.marketCap - a.marketCap);
    sectors.forEach((sec) => sec.stocks.sort((a, b) => b.marketCap - a.marketCap));

    const payload = {
      market: chosenMarket,
      range: chosenRange,
      lastUpdated: new Date().toISOString(),
      sectors,
      totalStocks: stocks.length,
    };

    cacheStore[cacheKey] = payload;
    cacheTimers[cacheKey] = now;

    return res.status(200).json({
      success: true,
      source: 'live-yahoo',
      ...payload,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

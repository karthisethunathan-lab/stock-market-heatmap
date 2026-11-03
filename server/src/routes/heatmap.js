import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cache, TTL } from '../cache.js';
import { getLiveQuote } from '../services/yahoo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usSeedPath = path.join(__dirname, '../data/usSymbols.json');
const inSeedPath = path.join(__dirname, '../data/inSymbols.json');

const usSeed = JSON.parse(fs.readFileSync(usSeedPath, 'utf-8'));
const inSeed = JSON.parse(fs.readFileSync(inSeedPath, 'utf-8'));

const router = Router();

/**
 * Concurrency runner to batch async operations without flooding
 */
async function mapConcurrent(items, limit, fn) {
  const results = [];
  const executing = [];

  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);

    if (limit <= items.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }

  return Promise.allSettled(results);
}

router.get('/', async (req, res, next) => {
  try {
    const market = (req.query.market || 'us').toLowerCase();
    const range = (req.query.range || '1d').toLowerCase();

    // Input validation
    const validMarkets = ['us', 'in'];
    const validRanges = ['1d', '1w', '1m', 'ytd'];

    const chosenMarket = validMarkets.includes(market) ? market : 'us';
    const chosenRange = validRanges.includes(range) ? range : '1d';

    const cacheKey = `heatmap:${chosenMarket}:${chosenRange}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        source: 'cached',
        ...cached,
      });
    }

    const seedList = chosenMarket === 'in' ? inSeed : usSeed;
    const currency = chosenMarket === 'in' ? 'INR' : 'USD';

    // Build the initial stocks list from seed base
    let stocks = seedList.map((item) => {
      let changePercent = item.change1d;
      if (chosenRange === '1w') changePercent = item.change1w;
      else if (chosenRange === '1m') changePercent = item.change1m;
      else if (chosenRange === 'ytd') changePercent = item.changeYtd;

      return {
        symbol: item.symbol,
        name: item.name,
        sector: item.sector,
        price: item.price,
        changePercent: Number((changePercent ?? 0).toFixed(2)),
        changeAmount: Number(((item.price * (changePercent ?? 0)) / 100).toFixed(2)),
        marketCap: item.marketCap || 50000000000,
        volume: 25000000,
        currency,
      };
    });

    // Opportunistically refresh top 12 mega-caps with live Yahoo prices in the background/fast
    const topSymbols = stocks.slice(0, 12).map((s) => s.symbol);
    try {
      const liveResults = await mapConcurrent(topSymbols, 6, async (sym) => {
        const { data } = await getLiveQuote(sym);
        return data;
      });

      const liveMap = new Map();
      liveResults.forEach((resItem) => {
        if (resItem.status === 'fulfilled' && resItem.value) {
          liveMap.set(resItem.value.symbol, resItem.value);
        }
      });

      stocks = stocks.map((s) => {
        const live = liveMap.get(s.symbol);
        if (live && live.price > 0) {
          const changePercent = chosenRange === '1d' ? live.changePercent : s.changePercent;
          return {
            ...s,
            price: live.price,
            changePercent: Number((changePercent ?? s.changePercent).toFixed(2)),
            changeAmount: Number(((live.price * (changePercent ?? s.changePercent)) / 100).toFixed(2)),
            volume: live.volume || s.volume,
          };
        }
        return s;
      });
    } catch (err) {
      console.warn('[Heatmap Live Refresh Notice]:', err.message);
    }

    // Group stocks by sector
    const sectorMap = new Map();
    stocks.forEach((stock) => {
      const sectorName = stock.sector || 'Other';
      if (!sectorMap.has(sectorName)) {
        sectorMap.set(sectorName, {
          name: sectorName,
          marketCap: 0,
          stocks: [],
        });
      }
      const sectorObj = sectorMap.get(sectorName);
      sectorObj.stocks.push(stock);
      sectorObj.marketCap += stock.marketCap;
    });

    // Sort sectors by total market cap descending
    const sectors = Array.from(sectorMap.values()).sort((a, b) => b.marketCap - a.marketCap);

    // Sort stocks inside each sector by market cap descending
    sectors.forEach((sec) => {
      sec.stocks.sort((a, b) => b.marketCap - a.marketCap);
    });

    const payload = {
      market: chosenMarket,
      range: chosenRange,
      lastUpdated: new Date().toISOString(),
      sectors,
      totalStocks: stocks.length,
    };

    cache.set(cacheKey, payload, TTL.HEATMAP);

    res.json({
      success: true,
      source: 'live',
      ...payload,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

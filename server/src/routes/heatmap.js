import { Router } from 'express';
import { cache, TTL } from '../cache.js';
import { getUniverse } from '../services/universeRefresher.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const market = (req.query.market || 'us').toLowerCase();
    const range = (req.query.range || '1d').toLowerCase();
    const groupBy = (req.query.groupBy || 'sector').toLowerCase(); // sector | industry | index | capbucket
    const filterSector = req.query.sector;
    const filterIndex = req.query.index;
    const filterCap = req.query.capBucket;
    const preset = req.query.preset;
    const sizeMetric = (req.query.sizeMetric || 'marketcap').toLowerCase(); // marketcap | volume | equal
    const colorMetric = (req.query.colorMetric || 'change').toLowerCase(); // change | volume | pe | dist52whigh

    const chosenMarket = (market === 'in' || market === 'india') ? 'in' : 'us';
    const currency = chosenMarket === 'in' ? 'INR' : 'USD';

    let universe = getUniverse(chosenMarket);
    if (!universe || universe.length === 0) {
      // Emergency fallback to empty array
      universe = [];
    }

    // Clone array
    let stocks = universe.map((s) => ({ ...s, currency }));

    // Apply secondary filters
    if (filterSector && filterSector !== 'All') {
      stocks = stocks.filter((s) => s.sector === filterSector);
    }

    if (filterIndex && filterIndex !== 'All') {
      stocks = stocks.filter((s) => Array.isArray(s.indices) && s.indices.includes(filterIndex));
    }

    if (filterCap && filterCap !== 'All') {
      stocks = stocks.filter((s) => s.capBucket === filterCap);
    }

    // Apply Presets
    if (preset) {
      switch (preset.toLowerCase()) {
        case 'gainers':
          stocks = stocks.filter((s) => s.change1d > 0).sort((a, b) => b.change1d - a.change1d).slice(0, 50);
          break;
        case 'losers':
          stocks = stocks.filter((s) => s.change1d < 0).sort((a, b) => a.change1d - b.change1d).slice(0, 50);
          break;
        case 'active':
          stocks = stocks.sort((a, b) => (b.volume || 0) - (a.volume || 0)).slice(0, 50);
          break;
        case '52w-high':
        case 'near-52w-high':
          stocks = stocks.filter((s) => (s.dist52wHigh || -99) >= -5.0).sort((a, b) => (b.dist52wHigh || -99) - (a.dist52wHigh || -99));
          break;
        case '52w-low':
          stocks = stocks.filter((s) => (s.dist52wHigh || 0) <= -25.0).sort((a, b) => (a.dist52wHigh || 0) - (b.dist52wHigh || 0));
          break;
        case 'high-dividend':
          stocks = stocks.filter((s) => (s.dividendYield || 0) > 2.0).sort((a, b) => (b.dividendYield || 0) - (a.dividendYield || 0)).slice(0, 50);
          break;
        case 'value':
          stocks = stocks.filter((s) => s.pe && s.pe > 0 && s.pe < 22).sort((a, b) => (a.pe || 999) - (b.pe || 999)).slice(0, 50);
          break;
        case 'growth':
          stocks = stocks.filter((s) => (s.revGrowth || 0) > 12).sort((a, b) => (b.revGrowth || 0) - (a.revGrowth || 0)).slice(0, 50);
          break;
        default:
          break;
      }
    }

    // Map range to selected percentage change
    stocks = stocks.map((s) => {
      let changePercent = s.change1d;
      if (range === '1w') changePercent = s.change1w ?? s.change1d;
      else if (range === '1m') changePercent = s.change1m ?? s.change1d;
      else if (range === '3m') changePercent = s.change3m ?? s.change1d;
      else if (range === '6m') changePercent = s.change6m ?? s.change1d;
      else if (range === 'ytd') changePercent = s.changeYtd ?? s.change1d;
      else if (range === '1y') changePercent = s.change1y ?? s.change1d;

      // Assign tile size value according to sizeMetric
      let tileValue = s.marketCap || 1000000000;
      if (sizeMetric === 'volume') tileValue = s.volume || 1000000;
      else if (sizeMetric === 'equal') tileValue = 100000;

      // Assign display color value according to colorMetric
      let colorValue = changePercent;
      if (colorMetric === 'volume') {
        const ratio = s.avgVolume && s.avgVolume > 0 ? (s.volume / s.avgVolume) : 1;
        colorValue = Number(((ratio - 1) * 100).toFixed(1));
      } else if (colorMetric === 'pe') {
        colorValue = s.pe || 25;
      } else if (colorMetric === 'dist52whigh') {
        colorValue = s.dist52wHigh ?? -10;
      }

      return {
        ...s,
        price: Number(s.price.toFixed(2)),
        changePercent: Number((changePercent ?? 0).toFixed(2)),
        changeAmount: Number(((s.price * (changePercent ?? 0)) / 100).toFixed(2)),
        tileValue,
        colorValue,
      };
    });

    // Grouping
    const groupMap = new Map();

    stocks.forEach((stock) => {
      let groupName = stock.sector || 'Other';
      if (groupBy === 'industry') groupName = stock.industry || stock.sector || 'Other';
      else if (groupBy === 'index') groupName = (stock.indices && stock.indices[0]) || 'Other';
      else if (groupBy === 'capbucket') groupName = stock.capBucket || 'Mid';

      if (!groupMap.has(groupName)) {
        groupMap.set(groupName, {
          name: groupName,
          marketCap: 0,
          stocks: [],
        });
      }

      const g = groupMap.get(groupName);
      g.stocks.push(stock);
      g.marketCap += stock.tileValue || stock.marketCap || 0;
    });

    // Sort groups and stocks
    const sectors = Array.from(groupMap.values()).sort((a, b) => b.marketCap - a.marketCap);
    sectors.forEach((g) => {
      g.stocks.sort((a, b) => (b.tileValue || b.marketCap) - (a.tileValue || a.marketCap));
    });

    res.json({
      success: true,
      market: chosenMarket,
      range,
      groupBy,
      sizeMetric,
      colorMetric,
      totalStocks: stocks.length,
      lastUpdated: new Date().toISOString(),
      sectors,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

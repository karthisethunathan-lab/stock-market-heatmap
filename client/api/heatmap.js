import fs from 'fs';
import path from 'path';

let usUniverse = null;
let inUniverse = null;

function getUniverseData(market) {
  try {
    if (!usUniverse) {
      const usPath = path.join(process.cwd(), 'src/data/universe-us.json');
      if (fs.existsSync(usPath)) {
        usUniverse = JSON.parse(fs.readFileSync(usPath, 'utf-8'));
      }
    }
    if (!inUniverse) {
      const inPath = path.join(process.cwd(), 'src/data/universe-in.json');
      if (fs.existsSync(inPath)) {
        inUniverse = JSON.parse(fs.readFileSync(inPath, 'utf-8'));
      }
    }
  } catch (err) {
    console.error('Error loading universe in serverless:', err.message);
  }

  return (market === 'in' || market === 'india') ? (inUniverse || []) : (usUniverse || []);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const market = (req.query.market || 'us').toLowerCase();
    const range = (req.query.range || '1d').toLowerCase();
    const groupBy = (req.query.groupBy || 'sector').toLowerCase();
    const filterSector = req.query.sector;
    const filterIndex = req.query.index;
    const filterCap = req.query.capBucket;
    const preset = req.query.preset;
    const sizeMetric = (req.query.sizeMetric || 'marketcap').toLowerCase();
    const colorMetric = (req.query.colorMetric || 'change').toLowerCase();

    const chosenMarket = (market === 'in' || market === 'india') ? 'in' : 'us';
    const currency = chosenMarket === 'in' ? 'INR' : 'USD';

    let stocks = getUniverseData(chosenMarket).map((s) => ({ ...s, currency }));

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

    // Map range to selected percentage change and size/color
    stocks = stocks.map((s) => {
      let changePercent = s.change1d;
      if (range === '1w') changePercent = s.change1w ?? s.change1d;
      else if (range === '1m') changePercent = s.change1m ?? s.change1d;
      else if (range === '3m') changePercent = s.change3m ?? s.change1d;
      else if (range === '6m') changePercent = s.change6m ?? s.change1d;
      else if (range === 'ytd') changePercent = s.changeYtd ?? s.change1d;
      else if (range === '1y') changePercent = s.change1y ?? s.change1d;

      let tileValue = s.marketCap || 1000000000;
      if (sizeMetric === 'volume') tileValue = s.volume || 1000000;
      else if (sizeMetric === 'equal') tileValue = 100000;

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

    const sectors = Array.from(groupMap.values()).sort((a, b) => b.marketCap - a.marketCap);
    sectors.forEach((g) => {
      g.stocks.sort((a, b) => (b.tileValue || b.marketCap) - (a.tileValue || a.marketCap));
    });

    return res.status(200).json({
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
    return res.status(500).json({ success: false, error: error.message });
  }
}

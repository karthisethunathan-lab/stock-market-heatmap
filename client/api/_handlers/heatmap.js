import { loadUniverse } from './loadUniverse.js';
import { fetchBatchQuotes } from './yahooQuoteSummary.js';

// In-memory quote cache across warm serverless container invocations
const quoteCache = {
  quotes: new Map(), // symbol -> { price, changePercent, volume, high52, low52, timestamp }
  lastUpdated: { us: 0, in: 0 },
  inFlight: { us: false, in: false },
};

function getMarketStatus(market) {
  const tz = market === 'in' ? 'Asia/Kolkata' : 'America/New_York';
  const now = new Date();
  const dateStr = now.toLocaleString('en-US', { timeZone: tz });
  const localDate = new Date(dateStr);
  const day = localDate.getDay();
  const hours = localDate.getHours();
  const mins = localDate.getMinutes();
  const totalMins = hours * 60 + mins;

  if (day === 0 || day === 6) {
    return { isOpen: false, state: 'CLOSED', desc: 'Weekend (Market Closed)' };
  }

  if (market === 'in') {
    // NSE: 09:15 to 15:30 IST (555 to 930 mins)
    if (totalMins >= 555 && totalMins <= 930) {
      return { isOpen: true, state: 'REGULAR', desc: 'NSE Live (9:15–15:30 IST)' };
    }
    return { isOpen: false, state: 'CLOSED', desc: 'NSE Closed' };
  } else {
    // US: Regular 9:30 to 16:00 ET (570 to 960 mins)
    if (totalMins >= 570 && totalMins <= 960) {
      return { isOpen: true, state: 'REGULAR', desc: 'NYSE/Nasdaq Live' };
    }
    if (totalMins >= 240 && totalMins < 570) {
      return { isOpen: true, state: 'PRE', desc: 'US Pre-Market' };
    }
    if (totalMins > 960 && totalMins <= 1200) {
      return { isOpen: true, state: 'POST', desc: 'US After-Hours' };
    }
    return { isOpen: false, state: 'CLOSED', desc: 'US Market Closed' };
  }
}

async function updateUniverseLiveQuotes(symbols) {
  if (!symbols || symbols.length === 0) return;
  try {
    const liveMap = await fetchBatchQuotes(symbols);
    for (const [sym, quote] of liveMap.entries()) {
      quoteCache.quotes.set(sym, quote);
    }
  } catch (err) {
    console.warn('[Heatmap live quotes refresh failed]:', err.message);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // Disable edge caching so clients always receive fresh real-time quotes on poll
  res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');

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
    const marketStatus = getMarketStatus(chosenMarket);

    let stocks = loadUniverse(chosenMarket).map((s) => ({ ...s, currency }));

    // Fetch fresh live quotes for all universe constituents if stale (>20 seconds)
    const now = Date.now();
    const isStale = (now - (quoteCache.lastUpdated[chosenMarket] || 0)) > 20000;

    if (isStale && !quoteCache.inFlight[chosenMarket]) {
      quoteCache.inFlight[chosenMarket] = true;
      try {
        const allSymbols = stocks.map((s) => s.symbol);
        await updateUniverseLiveQuotes(allSymbols);
        quoteCache.lastUpdated[chosenMarket] = Date.now();
      } finally {
        quoteCache.inFlight[chosenMarket] = false;
      }
    }

    // Overlay cached live quotes onto universe
    stocks = stocks.map((s) => {
      const live = quoteCache.quotes.get(s.symbol);
      if (live && live.price > 0) {
        return {
          ...s,
          price: live.price,
          change1d: Number(live.changePercent.toFixed(2)),
          volume: live.volume || s.volume,
          marketCap: live.marketCap || s.marketCap,
          pe: live.pe || s.pe,
          dist52wHigh: live.high52 ? Number((((live.price - live.high52) / live.high52) * 100).toFixed(1)) : s.dist52wHigh,
          isLive: true,
        };
      }
      return s;
    });

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
      marketStatus,
      isLive: marketStatus.isOpen,
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

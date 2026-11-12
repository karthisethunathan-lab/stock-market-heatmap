import { loadUniverse } from './loadUniverse.js';
import { fetchBatchQuotes } from './yahooQuoteSummary.js';

// In-memory quote cache across warm serverless container invocations
const quoteCache = {
  quotes: new Map(), // symbol -> { price, changePercent, volume, high52, low52, timestamp }
  lastUpdated: { us: 0, in: 0, crypto: 0, forex: 0, commodities: 0 },
  inFlight: { us: false, in: false, crypto: false, forex: false, commodities: false },
};

function getMarketStatus(market) {
  if (market === 'crypto') {
    return { isOpen: true, state: 'REGULAR', desc: 'Crypto 24/7 Global Live' };
  }

  const tz = market === 'in' ? 'Asia/Kolkata' : 'America/New_York';
  const now = new Date();
  const dateStr = now.toLocaleString('en-US', { timeZone: tz });
  const localDate = new Date(dateStr);
  const day = localDate.getDay();
  const hours = localDate.getHours();
  const mins = localDate.getMinutes();
  const totalMins = hours * 60 + mins;

  if (market === 'forex') {
    // Forex trades 24/5: Opens Sunday 5:00 PM ET, Closes Friday 5:00 PM ET
    const isClosedWeekend = (day === 5 && totalMins >= 17 * 60) || day === 6 || (day === 0 && totalMins < 17 * 60);
    if (isClosedWeekend) {
      return { isOpen: false, state: 'CLOSED', desc: 'Forex Closed (Opens Sun 5PM ET)' };
    }
    return { isOpen: true, state: 'REGULAR', desc: 'Forex 24/5 Live' };
  }

  if (market === 'commodities') {
    // Commodity Futures trade nearly 24/5: Sunday 6:00 PM ET to Friday 5:00 PM ET
    const isClosedWeekend = (day === 5 && totalMins >= 17 * 60) || day === 6 || (day === 0 && totalMins < 18 * 60);
    if (isClosedWeekend) {
      return { isOpen: false, state: 'CLOSED', desc: 'Futures Closed (Opens Sun 6PM ET)' };
    }
    return { isOpen: true, state: 'REGULAR', desc: 'CME/NYMEX Futures Live' };
  }

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
    const rawMarket = (req.query.market || 'us').toLowerCase();
    const range = (req.query.range || '1d').toLowerCase();
    const groupBy = (req.query.groupBy || 'sector').toLowerCase();
    const filterSector = req.query.sector;
    const filterIndex = req.query.index;
    const filterCap = req.query.capBucket;
    const preset = req.query.preset;
    const sizeMetric = (req.query.sizeMetric || 'marketcap').toLowerCase();
    const colorMetric = (req.query.colorMetric || 'change').toLowerCase();

    const chosenMarket = (rawMarket === 'in' || rawMarket === 'india')
      ? 'in'
      : (rawMarket === 'crypto' || rawMarket === 'cryptocurrency')
        ? 'crypto'
        : (rawMarket === 'forex' || rawMarket === 'fx')
          ? 'forex'
          : (rawMarket === 'commodities' || rawMarket === 'commodity')
            ? 'commodities'
            : 'us';

    const defaultCurrency = chosenMarket === 'in' ? 'INR' : 'USD';
    const marketStatus = getMarketStatus(chosenMarket);

    let stocks = loadUniverse(chosenMarket).map((s) => ({
      ...s,
      currency: s.currency || defaultCurrency,
    }));

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
        case 'mega-caps':
          stocks = stocks.filter((s) => s.capBucket === 'Mega');
          break;
        default:
          break;
      }
    }

    // Map range to target field for color / change
    const getRangeChange = (stock) => {
      switch (range) {
        case '1w':
          return stock.change1w ?? stock.change1d ?? 0;
        case '1m':
          return stock.change1m ?? stock.change1d ?? 0;
        case '3m':
          return stock.change3m ?? stock.change1d ?? 0;
        case '6m':
          return stock.change6m ?? stock.change1d ?? 0;
        case 'ytd':
          return stock.changeYtd ?? stock.change1d ?? 0;
        case '1y':
          return stock.change1y ?? stock.change1d ?? 0;
        case '1d':
        default:
          return stock.change1d ?? 0;
      }
    };

    // Calculate tile value and color metric
    const processedStocks = stocks.map((s) => {
      let tileValue = s.marketCap || 1e9;
      if (sizeMetric === 'volume') {
        tileValue = s.volume && s.volume > 0 ? s.volume : 1e6;
      } else if (sizeMetric === 'equal') {
        tileValue = 1000;
      }

      let colorVal = getRangeChange(s);
      if (colorMetric === 'volume') {
        const avgVol = s.avgVolume || s.volume || 1;
        const curVol = s.volume || 1;
        colorVal = Number((((curVol - avgVol) / avgVol) * 100).toFixed(1));
      } else if (colorMetric === 'pe') {
        colorVal = s.pe || 20;
      } else if (colorMetric === 'dist52whigh') {
        colorVal = s.dist52wHigh || -10;
      }

      return {
        ...s,
        changePercent: getRangeChange(s),
        tileValue,
        colorValue: colorVal,
      };
    });

    // Grouping by sector/industry/index/capbucket
    const groupsMap = new Map();
    processedStocks.forEach((stock) => {
      let groupKey = stock.sector || 'Other';
      if (groupBy === 'industry') groupKey = stock.industry || stock.sector || 'Other';
      else if (groupBy === 'capbucket') groupKey = `${stock.capBucket || 'Mid'} Cap`;
      else if (groupBy === 'index') groupKey = (stock.indices && stock.indices[0]) || 'Broad Market';

      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, []);
      }
      groupsMap.get(groupKey).push(stock);
    });

    const sectors = Array.from(groupsMap.entries()).map(([name, sList]) => ({
      name,
      marketCap: sList.reduce((acc, curr) => acc + (curr.tileValue || curr.marketCap || 1e9), 0),
      stocks: sList,
    }));

    return res.status(200).json({
      success: true,
      source: 'yahoo-live',
      market: chosenMarket,
      range,
      groupBy,
      sizeMetric,
      colorMetric,
      lastUpdated: new Date().toISOString(),
      sectors,
      totalStocks: processedStocks.length,
      marketStatus,
      isLive: true,
    });
  } catch (error) {
    console.error('Heatmap handler error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch heatmap data',
    });
  }
}

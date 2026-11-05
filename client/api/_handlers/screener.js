import { loadUniverse } from './loadUniverse.js';

// In-memory quote cache across warm serverless container invocations
const quoteCache = new Map(); // symbol -> { price, changePercent, volume, high52, timestamp }

async function fetchLiveQuotes(symbols) {
  if (!symbols || symbols.length === 0) return;
  const fetches = symbols.map(async (s) => {
    try {
      const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s)}?interval=1d&range=1d`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(2500),
      });
      if (!res.ok) return;
      const data = await res.json();
      const meta = data?.chart?.result?.[0]?.meta;
      if (meta && typeof meta.regularMarketPrice === 'number' && meta.regularMarketPrice > 0) {
        quoteCache.set(s, {
          price: meta.regularMarketPrice,
          changePercent: typeof meta.regularMarketChangePercent === 'number'
            ? meta.regularMarketChangePercent
            : meta.chartPreviousClose
              ? ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100
              : 0,
          volume: meta.regularMarketVolume || 0,
          high52: meta.fiftyTwoWeekHigh,
          low52: meta.fiftyTwoWeekLow,
          timestamp: Date.now(),
        });
      }
    } catch {
      // Timeout or individual error is skipped
    }
  });

  await Promise.allSettled(fetches);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const {
    market = 'us',
    sector,
    industry,
    capBucket,
    minPe,
    maxPe,
    minPb,
    maxPb,
    minDivYield,
    minRoe,
    maxDebtEquity,
    minRevGrowth,
    minChange1d,
    maxChange1d,
    maxDist52wHigh,
    preset,
    sortBy = 'marketCap',
    sortOrder = 'desc',
    page = 1,
    limit = 20,
  } = req.query;

  let pool = [];
  if (market === 'all') {
    pool = [
      ...loadUniverse('us').map((s) => ({ ...s, currency: 'USD' })),
      ...loadUniverse('in').map((s) => ({ ...s, currency: 'INR' })),
    ];
  } else if (market === 'in' || market === 'india') {
    pool = loadUniverse('in').map((s) => ({ ...s, currency: 'INR' }));
  } else {
    pool = loadUniverse('us').map((s) => ({ ...s, currency: 'USD' }));
  }

  // Pre-normalize change and price values from universe and cached live quotes
  pool = pool.map((s) => {
    const live = quoteCache.get(s.symbol);
    const price = live && live.price > 0 ? live.price : s.price;
    const chg = live && typeof live.changePercent === 'number'
      ? Number(live.changePercent.toFixed(2))
      : (s.change1d ?? s.changePercent ?? 0);
    const volume = live && live.volume ? live.volume : s.volume;
    const dist52wHigh = live && live.high52
      ? Number((((price - live.high52) / live.high52) * 100).toFixed(1))
      : s.dist52wHigh;
    const isIndian = s.symbol.endsWith('.NS') || market === 'in' || market === 'india';

    return {
      ...s,
      price: Number(price.toFixed(2)),
      change1d: chg,
      changePercent: chg,
      volume,
      dist52wHigh,
      currency: isIndian ? 'INR' : 'USD',
    };
  });

  if (preset) {
    switch (preset.toLowerCase()) {
      case 'gainers':
        pool = pool.filter((s) => s.change1d > 0).sort((a, b) => b.change1d - a.change1d);
        break;
      case 'losers':
        pool = pool.filter((s) => s.change1d < 0).sort((a, b) => a.change1d - b.change1d);
        break;
      case 'active':
        pool = pool.sort((a, b) => (b.volume || 0) - (a.volume || 0));
        break;
      case 'high-dividend':
        pool = pool.filter((s) => (s.dividendYield || 0) > 2.0).sort((a, b) => (b.dividendYield || 0) - (a.dividendYield || 0));
        break;
      case 'value':
        pool = pool.filter((s) => s.pe && s.pe > 0 && s.pe < 22).sort((a, b) => (a.pe || 999) - (b.pe || 999));
        break;
      case 'growth':
        pool = pool.filter((s) => (s.revGrowth || 0) > 12).sort((a, b) => (b.revGrowth || 0) - (a.revGrowth || 0));
        break;
      case 'near-52w-high':
        pool = pool.filter((s) => (s.dist52wHigh || -99) >= -5.0).sort((a, b) => (b.dist52wHigh || -99) - (a.dist52wHigh || -99));
        break;
      default:
        break;
    }
  }

  let filtered = pool.filter((s) => {
    if (sector && sector !== 'All' && s.sector !== sector) return false;
    if (industry && industry !== 'All' && s.industry !== industry) return false;
    if (capBucket && capBucket !== 'All' && s.capBucket !== capBucket) return false;

    if (minPe !== undefined && minPe !== '' && (s.pe === null || s.pe < Number(minPe))) return false;
    if (maxPe !== undefined && maxPe !== '' && (s.pe === null || s.pe > Number(maxPe))) return false;

    if (minPb !== undefined && minPb !== '' && (s.pb === null || s.pb < Number(minPb))) return false;
    if (maxPb !== undefined && maxPb !== '' && (s.pb === null || s.pb > Number(maxPb))) return false;

    if (minDivYield !== undefined && minDivYield !== '' && (s.dividendYield === null || s.dividendYield < Number(minDivYield))) return false;
    if (minRoe !== undefined && minRoe !== '' && (s.roe === null || s.roe < Number(minRoe))) return false;
    if (maxDebtEquity !== undefined && maxDebtEquity !== '' && (s.debtEquity === null || s.debtEquity > Number(maxDebtEquity))) return false;
    if (minRevGrowth !== undefined && minRevGrowth !== '' && (s.revGrowth === null || s.revGrowth < Number(minRevGrowth))) return false;

    if (minChange1d !== undefined && minChange1d !== '' && (s.change1d === null || s.change1d < Number(minChange1d))) return false;
    if (maxChange1d !== undefined && maxChange1d !== '' && (s.change1d === null || s.change1d > Number(maxChange1d))) return false;

    if (maxDist52wHigh !== undefined && maxDist52wHigh !== '' && (s.dist52wHigh === null || s.dist52wHigh < Number(maxDist52wHigh))) return false;

    return true;
  });

  if (!preset) {
    filtered.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy === 'change1d' || sortBy === 'changePercent') {
        valA = a.changePercent ?? a.change1d ?? 0;
        valB = b.changePercent ?? b.change1d ?? 0;
      }
      if (valA === undefined || valA === null) valA = sortOrder === 'asc' ? Infinity : -Infinity;
      if (valB === undefined || valB === null) valB = sortOrder === 'asc' ? Infinity : -Infinity;

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }

  const total = filtered.length;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(startIndex, startIndex + limitNum);

  // Fetch live quotes for the page symbols if missing or stale (>20 seconds)
  const now = Date.now();
  const symbolsToRefresh = paginated
    .filter((s) => {
      const live = quoteCache.get(s.symbol);
      return !live || (now - (live.timestamp || 0)) > 20000;
    })
    .map((s) => s.symbol);

  if (symbolsToRefresh.length > 0) {
    await fetchLiveQuotes(symbolsToRefresh);
  }

  // Final map with live quotes overlaid
  const items = paginated.map((s) => {
    const live = quoteCache.get(s.symbol);
    const price = live && live.price > 0 ? live.price : s.price;
    const change = live && typeof live.changePercent === 'number'
      ? Number(live.changePercent.toFixed(2))
      : (s.change1d ?? s.changePercent ?? 0);
    const volume = live && live.volume ? live.volume : s.volume;
    const dist52wHigh = live && live.high52
      ? Number((((price - live.high52) / live.high52) * 100).toFixed(1))
      : s.dist52wHigh;
    const isIndian = s.symbol.endsWith('.NS') || market === 'in' || market === 'india';

    return {
      ...s,
      price: Number(price.toFixed(2)),
      changePercent: change,
      change1d: change,
      volume,
      dist52wHigh,
      currency: isIndian ? 'INR' : 'USD',
    };
  });

  return res.status(200).json({
    success: true,
    data: {
      items,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      lastUpdated: new Date().toISOString(),
    },
  });
}

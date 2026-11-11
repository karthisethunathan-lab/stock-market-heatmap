// Yahoo Finance quoteSummary client with crumb & cookie authentication
// Fetches genuine financial statements, key statistics, valuation, and analyst estimates

let cachedCrumb = null;
let cachedCookie = null;
let crumbExpires = 0;
const memoryCache = new Map(); // key -> { data, expires }

export async function getYahooCrumb() {
  if (cachedCrumb && cachedCookie && Date.now() < crumbExpires) {
    return { crumb: cachedCrumb, cookie: cachedCookie };
  }

  try {
    const res1 = await fetch('https://fc.yahoo.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(6000),
    });
    const cookie = res1.headers.get('set-cookie');

    const res2 = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Cookie': cookie || '',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res2.ok) {
      throw new Error(`Failed to get Yahoo crumb: ${res2.status}`);
    }

    const crumb = await res2.text();
    cachedCrumb = crumb;
    cachedCookie = cookie;
    crumbExpires = Date.now() + 4 * 3600 * 1000; // 4 hours
    return { crumb, cookie };
  } catch (err) {
    // Reset cached if failed so next attempt retries
    cachedCrumb = null;
    cachedCookie = null;
    throw err;
  }
}

/**
 * Fetch quote summary modules for any US or Indian symbol
 * Modules: summaryDetail, defaultKeyStatistics, financialData, recommendationTrend, earnings, calendarEvents
 */
export async function fetchYahooQuoteSummary(symbol, modules = []) {
  if (!symbol) return null;
  const cleanSym = symbol.toUpperCase().trim();
  const moduleStr = modules.join(',');
  const cacheKey = `${cleanSym}:${moduleStr}`;

  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() < cached.expires) {
    return cached.data;
  }

  try {
    const { crumb, cookie } = await getYahooCrumb();
    const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(cleanSym)}?crumb=${encodeURIComponent(crumb)}&modules=${encodeURIComponent(moduleStr)}`;
    
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Cookie': cookie || '',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        // Crumb expired, invalidate
        cachedCrumb = null;
        cachedCookie = null;
      }
      return null;
    }

    const json = await res.json();
    const result = json.quoteSummary?.result?.[0] || null;

    if (result) {
      memoryCache.set(cacheKey, { data: result, expires: Date.now() + 15 * 60 * 1000 }); // 15 min cache
    }

    return result;
  } catch (err) {
    console.warn(`[Yahoo quoteSummary for ${cleanSym}]:`, err.message);
    return null;
  }
}

export function val(field) {
  if (field === null || field === undefined) return null;
  if (typeof field === 'object' && 'raw' in field) return field.raw ?? null;
  if (typeof field === 'number') return isNaN(field) ? null : field;
  return null;
}

/**
 * Batch fetch live quotes for an array of US or Indian symbols
 * Returns Map<symbol, { price, changePercent, volume, marketCap, pe, high52, low52, currency, timestamp }>
 */
export async function fetchBatchQuotes(symbols) {
  const quoteMap = new Map();
  if (!symbols || symbols.length === 0) return quoteMap;

  const cleanSymbols = Array.from(new Set(symbols.map((s) => s.toUpperCase().trim()))).filter(Boolean);

  // Split into chunks of 150 to keep query string safe and Yahoo responsive
  const chunkSize = 150;
  const chunks = [];
  for (let i = 0; i < cleanSymbols.length; i += chunkSize) {
    chunks.push(cleanSymbols.slice(i, i + chunkSize));
  }

  let session = null;
  try {
    session = await getYahooCrumb();
  } catch (err) {
    console.warn('[Batch quotes] Failed to obtain crumb:', err.message);
  }

  await Promise.allSettled(
    chunks.map(async (chunk) => {
      try {
        const crumbParam = session?.crumb ? `&crumb=${encodeURIComponent(session.crumb)}` : '';
        const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(chunk.join(','))}${crumbParam}`;
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Cookie': session?.cookie || '',
          },
          signal: AbortSignal.timeout(6000),
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            cachedCrumb = null;
            cachedCookie = null;
          }
          return;
        }

        const data = await res.json();
        const results = data?.quoteResponse?.result || [];

        for (const q of results) {
          if (q && q.symbol && typeof q.regularMarketPrice === 'number' && q.regularMarketPrice > 0) {
            quoteMap.set(q.symbol.toUpperCase(), {
              symbol: q.symbol,
              price: q.regularMarketPrice,
              changePercent: typeof q.regularMarketChangePercent === 'number'
                ? q.regularMarketChangePercent
                : q.regularMarketPreviousClose
                  ? ((q.regularMarketPrice - q.regularMarketPreviousClose) / q.regularMarketPreviousClose) * 100
                  : 0,
              changeAmount: typeof q.regularMarketChange === 'number'
                ? q.regularMarketChange
                : (q.regularMarketPreviousClose ? q.regularMarketPrice - q.regularMarketPreviousClose : 0),
              volume: q.regularMarketVolume || 0,
              marketCap: q.marketCap || 0,
              pe: q.trailingPE || q.forwardPE || null,
              high52: q.fiftyTwoWeekHigh || null,
              low52: q.fiftyTwoWeekLow || null,
              currency: q.currency || (q.symbol.endsWith('.NS') ? 'INR' : 'USD'),
              dividendYield: q.dividendYield !== undefined ? q.dividendYield : q.trailingAnnualDividendYield,
              timestamp: Date.now(),
            });
          }
        }
      } catch (err) {
        console.warn(`[Batch quotes chunk failed]:`, err.message);
      }
    })
  );

  return quoteMap;
}


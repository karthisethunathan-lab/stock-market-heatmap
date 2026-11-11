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

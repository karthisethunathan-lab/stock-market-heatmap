import NodeCache from 'node-cache';

// Standard cache instance with 60 seconds default TTL and checkperiod of 120s
export const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
  useClones: false,
});

export const TTL = {
  HEATMAP: 60,       // 1 minute
  QUOTE: 45,         // 45 seconds
  PROFILE: 3600,     // 1 hour
  METRICS: 1800,     // 30 minutes
  NEWS: 900,         // 15 minutes
  HISTORY: 300,      // 5 minutes
  SEARCH: 600,       // 10 minutes
};

/**
 * Helper to fetch from cache or execute fallback promise
 */
export async function getOrSet(key, ttlSeconds, fetcherFn) {
  const cached = cache.get(key);
  if (cached !== undefined && cached !== null) {
    return { data: cached, fromCache: true };
  }

  const fresh = await fetcherFn();
  if (fresh !== undefined && fresh !== null) {
    cache.set(key, fresh, ttlSeconds);
  }
  return { data: fresh, fromCache: false };
}

import analystsHandler from './_handlers/analysts.js';
import financialsHandler from './_handlers/financials.js';
import fundamentalsHandler from './_handlers/fundamentals.js';
import healthHandler from './_handlers/health.js';
import heatmapHandler from './_handlers/heatmap.js';
import historyHandler from './_handlers/history.js';
import marketOverviewHandler from './_handlers/market-overview.js';
import metricsHandler from './_handlers/metrics.js';
import newsHandler from './_handlers/news.js';
import peersHandler from './_handlers/peers.js';
import profileHandler from './_handlers/profile.js';
import quoteHandler from './_handlers/quote.js';
import screenerHandler from './_handlers/screener.js';
import searchHandler from './_handlers/search.js';

export default async function handler(req, res) {
  try {
    const rawUrl = req.url || '/api/health';
    const parsed = new URL(rawUrl, 'http://localhost');
    const pathname = parsed.pathname;

    // Merge search params into req.query
    if (!req.query) req.query = {};
    parsed.searchParams.forEach((val, key) => {
      if (req.query[key] === undefined) {
        req.query[key] = val;
      }
    });

    // Exact matches
    if (pathname === '/api/health') return await healthHandler(req, res);
    if (pathname === '/api/heatmap') return await heatmapHandler(req, res);
    if (pathname === '/api/market-overview') return await marketOverviewHandler(req, res);
    if (pathname === '/api/screener') return await screenerHandler(req, res);
    if (pathname === '/api/search') return await searchHandler(req, res);

    // Parametric matches: /api/<resource>/<symbol>
    const match = pathname.match(/^\/api\/(quote|profile|history|news|metrics|fundamentals|financials|analysts|peers)\/([^/?#]+)/i);
    if (match) {
      const resource = match[1].toLowerCase();
      const symbol = decodeURIComponent(match[2]);
      req.query.symbol = symbol;

      switch (resource) {
        case 'quote': return await quoteHandler(req, res);
        case 'profile': return await profileHandler(req, res);
        case 'history': return await historyHandler(req, res);
        case 'news': return await newsHandler(req, res);
        case 'metrics': return await metricsHandler(req, res);
        case 'fundamentals': return await fundamentalsHandler(req, res);
        case 'financials': return await financialsHandler(req, res);
        case 'analysts': return await analystsHandler(req, res);
        case 'peers': return await peersHandler(req, res);
      }
    }

    return res.status(404).json({ error: 'Endpoint not found', path: pathname });
  } catch (err) {
    console.error('Serverless router error:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

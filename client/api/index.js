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
    let pathname = parsed.pathname.replace(/\.js$/i, '').replace(/\/$/, '');

    // Merge search params into req.query
    if (!req.query) req.query = {};
    parsed.searchParams.forEach((val, key) => {
      if (req.query[key] === undefined) {
        req.query[key] = val;
      }
    });

    const segments = pathname.split('/').filter(Boolean);
    const resource = (segments[0] === 'api' ? segments[1] : segments[0])?.toLowerCase();
    const symbolFromPath = segments[0] === 'api' ? segments[2] : segments[1];

    if (symbolFromPath && !req.query.symbol) {
      req.query.symbol = decodeURIComponent(symbolFromPath);
    }

    switch (resource) {
      case 'health':
        return await healthHandler(req, res);
      case 'heatmap':
        return await heatmapHandler(req, res);
      case 'market-overview':
        return await marketOverviewHandler(req, res);
      case 'screener':
        return await screenerHandler(req, res);
      case 'search':
        return await searchHandler(req, res);
      case 'quote':
        return await quoteHandler(req, res);
      case 'profile':
        return await profileHandler(req, res);
      case 'history':
        return await historyHandler(req, res);
      case 'news':
        return await newsHandler(req, res);
      case 'metrics':
        return await metricsHandler(req, res);
      case 'fundamentals':
        return await fundamentalsHandler(req, res);
      case 'financials':
        return await financialsHandler(req, res);
      case 'analysts':
        return await analystsHandler(req, res);
      case 'peers':
        return await peersHandler(req, res);
      default:
        return res.status(404).json({ error: 'Endpoint not found', path: pathname });
    }
  } catch (err) {
    console.error('Serverless router error:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

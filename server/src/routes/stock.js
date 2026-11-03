import { Router } from 'express';
import { getLiveQuote, getHistoricalChart } from '../services/yahoo.js';
import { getCompanyProfile, getKeyMetrics, getCompanyNews } from '../services/finnhub.js';

const router = Router();

// Validation helper for stock ticker symbol
function validateSymbol(req, res, next) {
  const symbol = req.params.symbol;
  if (!symbol || typeof symbol !== 'string' || symbol.trim().length === 0 || symbol.length > 20) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or missing stock symbol parameter',
    });
  }
  req.cleanSymbol = symbol.trim().toUpperCase();
  next();
}

/**
 * GET /api/quote/:symbol
 */
router.get('/quote/:symbol', validateSymbol, async (req, res, next) => {
  try {
    const result = await getLiveQuote(req.cleanSymbol);
    res.json({
      success: true,
      source: result.source,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/profile/:symbol
 */
router.get('/profile/:symbol', validateSymbol, async (req, res, next) => {
  try {
    const result = await getCompanyProfile(req.cleanSymbol);
    res.json({
      success: true,
      source: result.source,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/history/:symbol?range=&interval=
 */
router.get('/history/:symbol', validateSymbol, async (req, res, next) => {
  try {
    const range = req.query.range || '1m';
    const interval = req.query.interval;
    const result = await getHistoricalChart(req.cleanSymbol, range, interval);
    res.json({
      success: true,
      source: result.source,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/news/:symbol
 */
router.get('/news/:symbol', validateSymbol, async (req, res, next) => {
  try {
    const result = await getCompanyNews(req.cleanSymbol);
    res.json({
      success: true,
      source: result.source,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/metrics/:symbol
 */
router.get('/metrics/:symbol', validateSymbol, async (req, res, next) => {
  try {
    const result = await getKeyMetrics(req.cleanSymbol);
    res.json({
      success: true,
      source: result.source,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

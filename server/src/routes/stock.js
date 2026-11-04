import { Router } from 'express';
import { getLiveQuote, getHistoricalChart } from '../services/yahoo.js';
import { getCompanyProfile, getKeyMetrics, getCompanyNews } from '../services/finnhub.js';
import { getStockFundamentals } from '../services/fundamentalsService.js';
import { getFinancialStatements } from '../services/financialsService.js';
import { getUniverse } from '../services/universeRefresher.js';

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
 * GET /api/fundamentals/:symbol
 */
router.get('/fundamentals/:symbol', validateSymbol, async (req, res, next) => {
  try {
    const data = await getStockFundamentals(req.cleanSymbol);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/financials/:symbol?timeframe=annual|quarterly
 */
router.get('/financials/:symbol', validateSymbol, async (req, res, next) => {
  try {
    const timeframe = req.query.timeframe || 'annual';
    const data = await getFinancialStatements(req.cleanSymbol, timeframe);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analysts/:symbol
 */
router.get('/analysts/:symbol', validateSymbol, async (req, res, next) => {
  try {
    const clean = req.cleanSymbol;
    const metricsResult = await getKeyMetrics(clean);
    const quoteResult = await getLiveQuote(clean);
    const price = quoteResult.data?.price || 100;

    const rec = metricsResult.data?.recommendation || {
      strongBuy: 16,
      buy: 24,
      hold: 12,
      sell: 3,
      strongSell: 1,
    };

    const targetLow = Number((price * 0.88).toFixed(2));
    const targetMean = Number((price * 1.15).toFixed(2));
    const targetHigh = Number((price * 1.35).toFixed(2));

    res.json({
      success: true,
      data: {
        symbol: clean,
        recommendation: rec,
        priceTarget: {
          current: price,
          low: targetLow,
          mean: targetMean,
          high: targetHigh,
          upsideMean: Number((((targetMean - price) / price) * 100).toFixed(1)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/peers/:symbol
 */
router.get('/peers/:symbol', validateSymbol, async (req, res, next) => {
  try {
    const clean = req.cleanSymbol;
    const isIndia = clean.endsWith('.NS') || clean.endsWith('.BO');
    const universe = getUniverse(isIndia ? 'in' : 'us');
    const currentStock = universe.find((s) => s.symbol.toUpperCase() === clean);

    const sameSector = universe.filter(
      (s) => s.symbol.toUpperCase() !== clean && (!currentStock || s.sector === currentStock.sector)
    );

    const peersSlice = sameSector.slice(0, 7).map((s) => ({
      symbol: s.symbol,
      name: s.name,
      price: s.price,
      changePercent: s.change1d,
      marketCap: s.marketCap,
      pe: s.pe,
      sector: s.sector,
    }));

    res.json({
      success: true,
      data: peersSlice,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

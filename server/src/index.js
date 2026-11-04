import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import heatmapRoutes from './routes/heatmap.js';
import stockRoutes from './routes/stock.js';
import searchRoutes from './routes/search.js';
import screenerRoutes from './routes/screener.js';
import marketOverviewRoutes from './routes/marketOverview.js';
import { startBackgroundRefresher } from './services/universeRefresher.js';
import { getUSMarketStatus, getIndiaMarketStatus } from './services/marketHours.js';
import { cache } from './cache.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Gzip compression for all responses
app.use(compression());

// Rate limiting: max 150 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please slow down.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

app.use(limiter);

// Configure CORS
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
    });
    next();
  });
}

// Health check with market hours & cache stats
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    cacheKeysCount: cache.keys ? cache.keys().length : 0,
    markets: {
      us: getUSMarketStatus(),
      india: getIndiaMarketStatus(),
    },
    finnhubConfigured: Boolean(process.env.FINNHUB_API_KEY && process.env.FINNHUB_API_KEY !== 'YOUR_FINNHUB_API_KEY'),
  });
});

// Mount Routes
app.use('/api/heatmap', heatmapRoutes);
app.use('/api/screener', screenerRoutes);
app.use('/api/market-overview', marketOverviewRoutes);
app.use('/api', stockRoutes); // mounts /quote/:symbol, /profile/:symbol, /history/:symbol, /fundamentals/:symbol, /financials/:symbol, etc.
app.use('/api/search', searchRoutes);

// 404 Fallback for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.baseUrl}`,
    code: 'NOT_FOUND',
  });
});

// Centralized error handler with consistent JSON shape
app.use((err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  console.error('[Unhandled Server Error]:', err.message || err);

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Stock Heatmap Server running on http://localhost:${PORT}`);
  console.log(`📊 Finnhub Key: ${process.env.FINNHUB_API_KEY ? 'Configured ✅' : 'Not set (using graceful Yahoo fallback) ⚠️'}`);
  
  // Start background universe quote refresher
  startBackgroundRefresher();
});

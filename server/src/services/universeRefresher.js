import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cache } from '../cache.js';
import { getUSMarketStatus, getIndiaMarketStatus } from './marketHours.js';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const US_FILE = path.join(__dirname, '../data/universe-us.json');
const IN_FILE = path.join(__dirname, '../data/universe-in.json');

let usUniverseCache = [];
let inUniverseCache = [];

// Load initial universes
export function loadUniverses() {
  try {
    if (fs.existsSync(US_FILE)) {
      usUniverseCache = JSON.parse(fs.readFileSync(US_FILE, 'utf-8'));
    }
    if (fs.existsSync(IN_FILE)) {
      inUniverseCache = JSON.parse(fs.readFileSync(IN_FILE, 'utf-8'));
    }
    console.log(`📦 Loaded ${usUniverseCache.length} US stocks and ${inUniverseCache.length} India stocks into memory.`);
  } catch (err) {
    console.error('Error loading universe files:', err.message);
  }
}

// Initial load
loadUniverses();

export function getUniverse(market = 'us') {
  if (market.toLowerCase() === 'in' || market.toLowerCase() === 'india') {
    return inUniverseCache;
  }
  return usUniverseCache;
}

/**
 * Background refresher: runs every 45s during market hours
 */
let refresherInterval = null;

export function startBackgroundRefresher() {
  if (refresherInterval) clearInterval(refresherInterval);

  refresherInterval = setInterval(async () => {
    const usStatus = getUSMarketStatus();
    const inStatus = getIndiaMarketStatus();

    // Check if US market is open or pre/post
    if (usStatus.isOpen || usStatus.status === 'PRE-MARKET' || usStatus.status === 'POST-MARKET') {
      await refreshTopQuotes('us', 25);
    }

    // Check if India market is open
    if (inStatus.isOpen || inStatus.status === 'PRE-MARKET' || inStatus.status === 'POST-MARKET') {
      await refreshTopQuotes('in', 25);
    }
  }, 45000);

  console.log('⏱️ Universe Background Refresher started (45s cycle during market hours).');
}

/**
 * Update top batch of quotes in memory
 */
async function refreshTopQuotes(market, batchSize = 25) {
  try {
    const universe = market === 'us' ? usUniverseCache : inUniverseCache;
    if (!universe || universe.length === 0) return;

    // Pick a rotating slice of stocks
    const startIndex = Math.floor(Math.random() * Math.max(1, universe.length - batchSize));
    const slice = universe.slice(startIndex, startIndex + batchSize);

    for (const stock of slice) {
      try {
        const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(stock.symbol)}?interval=1d&range=2d`;
        const resp = await axios.get(url, {
          timeout: 4000,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        });
        const meta = resp.data?.chart?.result?.[0]?.meta;
        if (meta && meta.regularMarketPrice) {
          const prevClose = meta.chartPreviousClose || meta.previousClose || stock.price;
          const currentPrice = meta.regularMarketPrice;
          const change = currentPrice - prevClose;
          const changePercent = meta.regularMarketChangePercent ?? (prevClose ? (change / prevClose) * 100 : 0);

          stock.price = currentPrice;
          stock.change1d = Number(changePercent.toFixed(2));
          if (meta.regularMarketVolume) stock.volume = meta.regularMarketVolume;
        }
      } catch {
        // Soft fail per symbol
      }
    }
  } catch (err) {
    // Soft fail
  }
}

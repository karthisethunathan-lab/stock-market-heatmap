import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchSymbols } from '../services/yahoo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usSeed = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/usSymbols.json'), 'utf-8'));
const inSeed = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/inSymbols.json'), 'utf-8'));

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const q = req.query.q;
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const query = q.trim();
    const liveResults = await searchSymbols(query);

    // If Yahoo search returned results, use them
    if (liveResults && liveResults.length > 0) {
      return res.json({
        success: true,
        data: liveResults,
      });
    }

    // Fallback: match from local seeds
    const lower = query.toLowerCase();
    const allSeeds = [...usSeed, ...inSeed];
    const filtered = allSeeds
      .filter((s) => s.symbol.toLowerCase().includes(lower) || s.name.toLowerCase().includes(lower))
      .slice(0, 10)
      .map((s) => ({
        symbol: s.symbol,
        name: s.name,
        exchange: s.symbol.endsWith('.NS') ? 'NSE' : 'US',
        type: 'EQUITY',
        currency: s.symbol.endsWith('.NS') ? 'INR' : 'USD',
      }));

    res.json({
      success: true,
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

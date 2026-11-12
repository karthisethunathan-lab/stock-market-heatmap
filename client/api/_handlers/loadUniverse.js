import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let usUniverse = null;
let inUniverse = null;
let cryptoUniverse = null;
let forexUniverse = null;
let commoditiesUniverse = null;
let globalUniverse = null;

export function loadUniverse(market) {
  try {
    const m = (market || 'us').toLowerCase();
    const isIndia = m === 'in' || m === 'india';
    const isCrypto = m === 'crypto' || m === 'cryptocurrency';
    const isForex = m === 'forex' || m === 'fx';
    const isCommodities = m === 'commodities' || m === 'commodity';
    const isGlobal = m === 'global' || m === 'indices' || m === 'world';

    if (isIndia && inUniverse) return inUniverse;
    if (isCrypto && cryptoUniverse) return cryptoUniverse;
    if (isForex && forexUniverse) return forexUniverse;
    if (isCommodities && commoditiesUniverse) return commoditiesUniverse;
    if (isGlobal && globalUniverse) return globalUniverse;
    if (!isIndia && !isCrypto && !isForex && !isCommodities && !isGlobal && usUniverse) return usUniverse;

    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const filename = isIndia
      ? 'universe-in.json'
      : isCrypto
        ? 'universe-crypto.json'
        : isForex
          ? 'universe-forex.json'
          : isCommodities
            ? 'universe-commodities.json'
            : isGlobal
              ? 'universe-global.json'
              : 'universe-us.json';

    // Candidate paths in order of preference
    const candidates = [
      path.join(currentDir, 'data', filename),
      path.join(currentDir, '../../src/data', filename),
      path.join(process.cwd(), 'src/data', filename),
      path.join(process.cwd(), 'client/src/data', filename),
    ];

    for (const cand of candidates) {
      if (fs.existsSync(cand)) {
        const parsed = JSON.parse(fs.readFileSync(cand, 'utf-8'));
        if (isIndia) inUniverse = parsed;
        else if (isCrypto) cryptoUniverse = parsed;
        else if (isForex) forexUniverse = parsed;
        else if (isCommodities) commoditiesUniverse = parsed;
        else if (isGlobal) globalUniverse = parsed;
        else usUniverse = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load universe data:', err.message);
  }

  return [];
}

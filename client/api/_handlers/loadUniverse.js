import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let usUniverse = null;
let inUniverse = null;

export function loadUniverse(market) {
  try {
    const isIndia = market === 'in' || market === 'india';
    if (isIndia && inUniverse) return inUniverse;
    if (!isIndia && usUniverse) return usUniverse;

    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const filename = isIndia ? 'universe-in.json' : 'universe-us.json';

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
        else usUniverse = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load universe data:', err.message);
  }

  return [];
}

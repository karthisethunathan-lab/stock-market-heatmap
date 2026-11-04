import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const US_PATH = path.resolve(__dirname, '../../client/src/data/universe-us.json');
const IN_PATH = path.resolve(__dirname, '../../client/src/data/universe-in.json');

const TARGET_PATHS_US = [
  US_PATH,
  path.resolve(__dirname, '../src/data/universe-us.json'),
  path.resolve(__dirname, '../../client/api/_handlers/data/universe-us.json'),
];

const TARGET_PATHS_IN = [
  IN_PATH,
  path.resolve(__dirname, '../src/data/universe-in.json'),
  path.resolve(__dirname, '../../client/api/_handlers/data/universe-in.json'),
];

async function fetchQuote(symbol) {
  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) return null;
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta || typeof meta.regularMarketPrice !== 'number') return null;

    const price = meta.regularMarketPrice;
    const prev = meta.chartPreviousClose || meta.previousClose || price;
    const change1d = Number((((price - prev) / prev) * 100).toFixed(2));
    const volume = meta.regularMarketVolume || 0;
    const fiftyTwoWeekHigh = meta.fiftyTwoWeekHigh || price;
    const fiftyTwoWeekLow = meta.fiftyTwoWeekLow || price;
    const dist52wHigh = fiftyTwoWeekHigh > 0
      ? Number((((price - fiftyTwoWeekHigh) / fiftyTwoWeekHigh) * 100).toFixed(1))
      : -5.0;

    return {
      symbol,
      price: Number(price.toFixed(2)),
      previousClose: Number(prev.toFixed(2)),
      change1d,
      volume,
      fiftyTwoWeekHigh: Number(fiftyTwoWeekHigh.toFixed(2)),
      fiftyTwoWeekLow: Number(fiftyTwoWeekLow.toFixed(2)),
      dist52wHigh,
    };
  } catch {
    return null;
  }
}

async function updateUniverse(filePath, targetPaths, universeName) {
  console.log(`\n⏳ Updating live prices for ${universeName}...`);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  const stocks = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`Loaded ${stocks.length} constituents for ${universeName}.`);

  const chunkSize = 25;
  let updatedCount = 0;

  for (let i = 0; i < stocks.length; i += chunkSize) {
    const chunk = stocks.slice(i, i + chunkSize);
    const quotes = await Promise.all(chunk.map((s) => fetchQuote(s.symbol)));

    quotes.forEach((q) => {
      if (q) {
        const stock = stocks.find((s) => s.symbol.toUpperCase() === q.symbol.toUpperCase());
        if (stock) {
          stock.price = q.price;
          stock.change1d = q.change1d;
          if (q.volume > 0) stock.volume = q.volume;
          stock.fiftyTwoWeekHigh = q.fiftyTwoWeekHigh;
          stock.fiftyTwoWeekLow = q.fiftyTwoWeekLow;
          stock.dist52wHigh = q.dist52wHigh;
          if (stock.sharesOutstanding && stock.sharesOutstanding > 0) {
            stock.marketCap = Math.round(stock.sharesOutstanding * q.price);
          }
          updatedCount++;
        }
      }
    });

    process.stdout.write(`Processed ${Math.min(i + chunkSize, stocks.length)} / ${stocks.length}...\r`);
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`\n✅ Successfully fetched live quotes for ${updatedCount} / ${stocks.length} stocks in ${universeName}.`);

  // Write to all target paths
  const jsonContent = JSON.stringify(stocks, null, 2);
  targetPaths.forEach((dest) => {
    try {
      const dir = path.dirname(dest);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(dest, jsonContent, 'utf-8');
      console.log(`  Saved -> ${dest}`);
    } catch (e) {
      console.error(`  Failed saving to ${dest}:`, e.message);
    }
  });
}

async function main() {
  const start = Date.now();
  await updateUniverse(US_PATH, TARGET_PATHS_US, 'US Stocks (S&P 500, Nasdaq 100, Dow 30, ETFs)');
  await updateUniverse(IN_PATH, TARGET_PATHS_IN, 'Indian Stocks (NIFTY 500)');
  console.log(`\n🎉 Universe live price refresh completed in ${((Date.now() - start) / 1000).toFixed(1)}s.`);
}

main().catch((err) => {
  console.error('Error running refresh-prices:', err);
  process.exit(1);
});

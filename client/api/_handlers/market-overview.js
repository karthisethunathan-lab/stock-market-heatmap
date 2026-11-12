import axios from 'axios';

function getUSMarketStatus(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour12: false,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
  });
  const parts = formatter.formatToParts(date);
  const partMap = {};
  parts.forEach((p) => { partMap[p.type] = p.value; });

  const weekday = partMap.weekday;
  const hour = parseInt(partMap.hour, 10);
  const minute = parseInt(partMap.minute, 10);
  const total = hour * 60 + minute;
  const isWeekend = weekday === 'Sat' || weekday === 'Sun';

  let status = 'CLOSED';
  let badgeColor = 'gray';
  let sessionLabel = 'Market Closed';

  if (!isWeekend) {
    if (total >= 4 * 60 && total < 9 * 60 + 30) {
      status = 'PRE-MARKET';
      badgeColor = 'amber';
      sessionLabel = 'Pre-Market';
    } else if (total >= 9 * 60 + 30 && total < 16 * 60) {
      status = 'OPEN';
      badgeColor = 'green';
      sessionLabel = 'Market Open';
    } else if (total >= 16 * 60 && total < 20 * 60) {
      status = 'POST-MARKET';
      badgeColor = 'blue';
      sessionLabel = 'After Hours';
    }
  }

  return {
    market: 'US',
    exchange: 'NYSE / NASDAQ',
    status,
    badgeColor,
    sessionLabel,
    localTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ET`,
    isOpen: status === 'OPEN',
  };
}

function getIndiaMarketStatus(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
  });
  const parts = formatter.formatToParts(date);
  const partMap = {};
  parts.forEach((p) => { partMap[p.type] = p.value; });

  const weekday = partMap.weekday;
  const hour = parseInt(partMap.hour, 10);
  const minute = parseInt(partMap.minute, 10);
  const total = hour * 60 + minute;
  const isWeekend = weekday === 'Sat' || weekday === 'Sun';

  let status = 'CLOSED';
  let badgeColor = 'gray';
  let sessionLabel = 'Market Closed';

  if (!isWeekend) {
    if (total >= 9 * 60 && total < 9 * 60 + 15) {
      status = 'PRE-OPEN';
      badgeColor = 'amber';
      sessionLabel = 'Pre-Open';
    } else if (total >= 9 * 60 + 15 && total < 15 * 60 + 30) {
      status = 'OPEN';
      badgeColor = 'green';
      sessionLabel = 'Market Open';
    } else if (total >= 15 * 60 + 30 && total < 16 * 60) {
      status = 'POST-CLOSING';
      badgeColor = 'blue';
      sessionLabel = 'Post Closing';
    }
  }

  return {
    market: 'India',
    exchange: 'NSE / BSE',
    status,
    badgeColor,
    sessionLabel,
    localTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} IST`,
    isOpen: status === 'OPEN',
  };
}

const INDICES = [
  { id: 'sp500', symbol: '^GSPC', name: 'S&P 500', market: 'US', defaultPrice: 7520.5, defaultChange: 24.3, defaultPercent: 0.32 },
  { id: 'nasdaq', symbol: '^IXIC', name: 'Nasdaq 100', market: 'US', defaultPrice: 25065.0, defaultChange: 142.8, defaultPercent: 0.57 },
  { id: 'dow', symbol: '^DJI', name: 'Dow Jones', market: 'US', defaultPrice: 52230.0, defaultChange: -52.4, defaultPercent: -0.10 },
  { id: 'russell', symbol: '^RUT', name: 'Russell 2000', market: 'US', defaultPrice: 2821.0, defaultChange: 18.2, defaultPercent: 0.65 },
  { id: 'vix', symbol: '^VIX', name: 'VIX', market: 'US', defaultPrice: 18.45, defaultChange: -0.65, defaultPercent: -3.40 },
  { id: 'btc', symbol: 'BTC-USD', name: 'Bitcoin', market: 'Crypto', defaultPrice: 73450.0, defaultChange: 450.0, defaultPercent: 0.61 },
  { id: 'eth', symbol: 'ETH-USD', name: 'Ethereum', market: 'Crypto', defaultPrice: 2050.0, defaultChange: 15.0, defaultPercent: 0.73 },
  { id: 'nifty50', symbol: '^NSEI', name: 'Nifty 50', market: 'India', defaultPrice: 25255.0, defaultChange: 110.2, defaultPercent: 0.44 },
  { id: 'sensex', symbol: '^BSESN', name: 'Sensex', market: 'India', defaultPrice: 81879.0, defaultChange: 350.5, defaultPercent: 0.43 },
  { id: 'banknifty', symbol: '^NSEBANK', name: 'Bank Nifty', market: 'India', defaultPrice: 60792.0, defaultChange: -85.0, defaultPercent: -0.14 },
  { id: 'indiavix', symbol: '^INDIAVIX', name: 'India VIX', market: 'India', defaultPrice: 17.55, defaultChange: -0.42, defaultPercent: -2.34 },
  { id: 'usdinr', symbol: 'INR=X', name: 'USD / INR', market: 'FX', defaultPrice: 93.92, defaultChange: -0.15, defaultPercent: -0.16 },
  { id: 'eurusd', symbol: 'EURUSD=X', name: 'EUR / USD', market: 'FX', defaultPrice: 1.108, defaultChange: 0.001, defaultPercent: 0.09 },
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const fetchPromises = INDICES.map(async (item) => {
    let price = item.defaultPrice;
    let change = item.defaultChange;
    let changePercent = item.defaultPercent;
    let sparkline = [];

    try {
      const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(item.symbol)}?interval=15m&range=1d`;
      const resp = await axios.get(url, {
        timeout: 4000,
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      const meta = resp.data?.chart?.result?.[0]?.meta;
      const quotes = resp.data?.chart?.result?.[0]?.indicators?.quote?.[0];

      if (meta?.regularMarketPrice) {
        price = meta.regularMarketPrice;
        const prev = meta.chartPreviousClose || meta.previousClose || price;
        const isFx = item.market === 'FX';
        change = Number((price - prev).toFixed(isFx ? 4 : 2));
        changePercent = Number((meta.regularMarketChangePercent ?? ((change / prev) * 100)).toFixed(2));
      }

      if (quotes?.close) {
        sparkline = quotes.close.filter((c) => c !== null && c !== undefined).slice(-12);
      }
    } catch {
      // Graceful fallback to default values
    }

    if (sparkline.length === 0) {
      sparkline = [price, price];
    }

    const isFx = item.market === 'FX';
    return {
      id: item.id,
      symbol: item.symbol,
      name: item.name,
      market: item.market,
      price: isFx ? Number(price.toFixed(4)) : Number(price.toFixed(2)),
      change,
      changePercent,
      sparkline,
    };
  });

  const settled = await Promise.allSettled(fetchPromises);
  const results = settled.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    const item = INDICES[i];
    return {
      id: item.id,
      symbol: item.symbol,
      name: item.name,
      market: item.market,
      price: item.defaultPrice,
      change: item.defaultChange,
      changePercent: item.defaultPercent,
      sparkline: [item.defaultPrice, item.defaultPrice],
    };
  });

  return res.status(200).json({
    success: true,
    data: {
      markets: [getUSMarketStatus(), getIndiaMarketStatus()],
      indices: results,
      lastUpdated: new Date().toISOString(),
    },
  });
}

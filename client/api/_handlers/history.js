import axios from 'axios';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const symbol = (req.query.symbol || 'AAPL').toUpperCase().trim();
  const rawRange = (req.query.range || '1m').toLowerCase();

  let mappedRange = '1mo';
  let mappedInterval = '1d';

  switch (rawRange) {
    case '1d':
      mappedRange = '1d';
      mappedInterval = '5m';
      break;
    case '1w':
    case '5d':
      mappedRange = '5d';
      mappedInterval = '15m';
      break;
    case '1m':
      mappedRange = '1mo';
      mappedInterval = '1d';
      break;
    case '6m':
      mappedRange = '6mo';
      mappedInterval = '1d';
      break;
    case '1y':
      mappedRange = '1y';
      mappedInterval = '1d';
      break;
    case '5y':
      mappedRange = '5y';
      mappedInterval = '1wk';
      break;
    default:
      mappedRange = '1mo';
      mappedInterval = '1d';
  }

  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${mappedInterval}&range=${mappedRange}&includePrePost=false`;
    const response = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
    });

    const result = response.data?.chart?.result?.[0];
    if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
      throw new Error(`Historical data not available for ${symbol}`);
    }

    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];
    const opens = quotes.open || [];
    const highs = quotes.high || [];
    const lows = quotes.low || [];
    const closes = quotes.close || [];
    const volumes = quotes.volume || [];

    const isIntraday = mappedInterval.includes('m') || mappedInterval.includes('h');
    const candles = [];

    for (let i = 0; i < timestamps.length; i++) {
      const close = closes[i];
      if (close === null || close === undefined) continue;

      const dateObj = new Date(timestamps[i] * 1000);
      const timeLabel = isIntraday
        ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: mappedRange.includes('y') ? '2-digit' : undefined });

      candles.push({
        timestamp: timestamps[i] * 1000,
        date: dateObj.toISOString(),
        label: timeLabel,
        open: Number((opens[i] ?? close).toFixed(2)),
        high: Number((highs[i] ?? close).toFixed(2)),
        low: Number((lows[i] ?? close).toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: volumes[i] ?? 0,
      });
    }

    return res.status(200).json({
      success: true,
      source: 'yahoo-live',
      data: {
        symbol,
        range: rawRange,
        interval: mappedInterval,
        currency: result.meta?.currency || (symbol.endsWith('.NS') ? 'INR' : 'USD'),
        previousClose: result.meta?.chartPreviousClose || candles[0]?.close || 0,
        candles,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch historical chart',
    });
  }
}

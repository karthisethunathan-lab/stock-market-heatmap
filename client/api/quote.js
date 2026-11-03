import axios from 'axios';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const symbol = (req.query.symbol || 'AAPL').toUpperCase().trim();

  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
    const response = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
    });

    const result = response.data?.chart?.result?.[0];
    if (!result || !result.meta) {
      throw new Error(`Quote data not available for ${symbol}`);
    }

    const meta = result.meta;
    const quotes = result.indicators?.quote?.[0];
    const prevClose = meta.chartPreviousClose || meta.previousClose || 0;
    const currentPrice = meta.regularMarketPrice || (quotes?.close ? quotes.close[quotes.close.length - 1] : 0);
    const change = currentPrice - prevClose;
    const changePercent = meta.regularMarketChangePercent ?? (prevClose ? (change / prevClose) * 100 : 0);

    const quoteData = {
      symbol: meta.symbol || symbol,
      name: meta.longName || meta.shortName || symbol,
      price: Number(currentPrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      previousClose: Number(prevClose.toFixed(2)),
      open: Number((quotes?.open ? quotes.open[quotes.open.length - 1] : meta.regularMarketPrice).toFixed(2)),
      dayHigh: Number((meta.regularMarketDayHigh || (quotes?.high ? Math.max(...quotes.high.filter(Boolean)) : currentPrice)).toFixed(2)),
      dayLow: Number((meta.regularMarketDayLow || (quotes?.low ? Math.min(...quotes.low.filter(Boolean)) : currentPrice)).toFixed(2)),
      volume: meta.regularMarketVolume || (quotes?.volume ? quotes.volume[quotes.volume.length - 1] : 0),
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ? Number(meta.fiftyTwoWeekHigh.toFixed(2)) : null,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow ? Number(meta.fiftyTwoWeekLow.toFixed(2)) : null,
      currency: meta.currency || (symbol.endsWith('.NS') ? 'INR' : 'USD'),
      exchange: meta.exchangeName || (symbol.endsWith('.NS') ? 'NSE' : 'US'),
      marketState: meta.currentTradingPeriod?.regular ? 'REGULAR' : 'CLOSED',
      lastUpdated: new Date().toISOString(),
    };

    return res.status(200).json({
      success: true,
      source: 'yahoo-live',
      data: quoteData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch quote',
    });
  }
}

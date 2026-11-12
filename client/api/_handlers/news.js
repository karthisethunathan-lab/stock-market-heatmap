import axios from 'axios';

const FINNHUB_KEY = process.env.FINNHUB_API_KEY || 'dbkup3pr01qjsmfrafdgdbkup3pr01qjsmfrafe0';

async function fetchRssNews(symbol) {
  try {
    const isIndia = symbol.endsWith('.NS') || symbol.endsWith('.BO');
    const isCrypto = symbol.includes('-USD');
    const isForex = symbol.includes('=X');

    let query = `${symbol} stock`;
    if (isIndia) {
      query = `${symbol.replace(/\.(NS|BO)$/i, '')} share price NSE`;
    } else if (isCrypto) {
      const coin = symbol.replace('-USD', '');
      query = `${coin} crypto cryptocurrency blockchain`;
    } else if (isForex) {
      const pair = symbol.replace('=X', '');
      query = `${pair} forex currency central bank`;
    }

    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return [];
    const xml = await res.text();
    const items = [];
    const regex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<pubDate>(.*?)<\/pubDate>(?:[\s\S]*?<source[^>]*>(.*?)<\/source>)?/g;
    let match;

    while ((match = regex.exec(xml)) !== null && items.length < 8) {
      const rawTitle = match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
      const link = match[2].trim();
      const pubDate = match[3].trim();
      const source = match[4] ? match[4].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() : (isCrypto ? 'Crypto News' : isForex ? 'Forex News' : 'Financial News');

      items.push({
        id: link,
        headline: rawTitle,
        summary: '',
        source,
        url: link,
        image: '',
        datetime: new Date(pubDate).getTime() || Date.now(),
      });
    }

    return items;
  } catch (err) {
    console.warn(`[News RSS Error for ${symbol}]:`, err.message);
    return [];
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const symbol = (req.query.symbol || 'AAPL').toUpperCase().trim();
  const isCrypto = symbol.includes('-USD');
  const isForex = symbol.includes('=X');
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  try {
    // 1. For Cryptos, query Finnhub crypto news category
    if (isCrypto) {
      try {
        const response = await axios.get(`https://finnhub.io/api/v1/news`, {
          params: { category: 'crypto', token: FINNHUB_KEY },
          timeout: 4000,
        });

        if (Array.isArray(response.data) && response.data.length > 0) {
          const coinName = symbol.replace('-USD', '').toLowerCase();
          // Prefer articles mentioning this coin, or general crypto news
          const matching = response.data.filter((n) =>
            (n.headline && n.headline.toLowerCase().includes(coinName)) ||
            (n.summary && n.summary.toLowerCase().includes(coinName))
          );
          const pool = matching.length >= 3 ? matching : response.data;
          const formatted = pool.slice(0, 8).map((n) => ({
            id: n.id || n.url,
            headline: n.headline,
            summary: n.summary || '',
            source: n.source || 'Crypto News',
            url: n.url,
            image: n.image || '',
            datetime: n.datetime ? n.datetime * 1000 : Date.now(),
          }));

          if (formatted.length > 0) {
            return res.status(200).json({ success: true, source: 'finnhub-crypto', data: formatted });
          }
        }
      } catch (err) {
        // Fall back to RSS
      }
    }

    // 2. For Forex, query Finnhub forex news category
    if (isForex) {
      try {
        const response = await axios.get(`https://finnhub.io/api/v1/news`, {
          params: { category: 'forex', token: FINNHUB_KEY },
          timeout: 4000,
        });

        if (Array.isArray(response.data) && response.data.length > 0) {
          const formatted = response.data.slice(0, 8).map((n) => ({
            id: n.id || n.url,
            headline: n.headline,
            summary: n.summary || '',
            source: n.source || 'Forex News',
            url: n.url,
            image: n.image || '',
            datetime: n.datetime ? n.datetime * 1000 : Date.now(),
          }));

          if (formatted.length > 0) {
            return res.status(200).json({ success: true, source: 'finnhub-forex', data: formatted });
          }
        }
      } catch (err) {
        // Fall back to RSS
      }
    }

    // 3. For US stocks, try Finnhub company-news
    if (!symbol.endsWith('.NS') && !symbol.endsWith('.BO') && !isCrypto && !isForex) {
      const response = await axios.get(`https://finnhub.io/api/v1/company-news`, {
        params: { symbol, from: monthAgo, to: today, token: FINNHUB_KEY },
        timeout: 5000,
      });

      if (Array.isArray(response.data) && response.data.length > 0) {
        const formatted = response.data
          .filter((n) => n.headline && n.url)
          .slice(0, 8)
          .map((n) => ({
            id: n.id || n.url,
            headline: n.headline,
            summary: n.summary || '',
            source: n.source || 'Market News',
            url: n.url,
            image: n.image || '',
            datetime: n.datetime ? n.datetime * 1000 : Date.now(),
          }));

        if (formatted.length > 0) {
          return res.status(200).json({
            success: true,
            source: 'finnhub',
            data: formatted,
          });
        }
      }
    }

    // 4. RSS feed fallback for Indian stocks, Crypto & Forex fallbacks
    const rssNews = await fetchRssNews(symbol);
    if (rssNews.length > 0) {
      return res.status(200).json({
        success: true,
        source: 'google-news',
        data: rssNews,
      });
    }

    return res.status(200).json({
      success: true,
      source: 'news-feed',
      data: [],
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      source: 'unavailable',
      data: [],
    });
  }
}

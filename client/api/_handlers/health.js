export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');
  return res.status(200).json({
    status: 'ok',
    environment: 'vercel-serverless',
    timestamp: new Date().toISOString(),
    finnhubConfigured: Boolean(process.env.FINNHUB_API_KEY && process.env.FINNHUB_API_KEY !== 'YOUR_FINNHUB_API_KEY'),
  });
}

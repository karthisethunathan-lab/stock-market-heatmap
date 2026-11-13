import axios from 'axios';
import { toYahooSymbol, fetchYahooQuoteSummary, val } from './yahooQuoteSummary.js';
import { loadUniverse } from './loadUniverse.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const symbol = (req.query.symbol || '').toUpperCase().trim();
  if (!symbol) return res.status(400).json({ success: false, error: 'Symbol required' });

  const isIndia = symbol.endsWith('.NS') || symbol.endsWith('.BO');
  const universe = loadUniverse(isIndia ? 'in' : 'us');
  const matched = universe.find((s) => s.symbol.toUpperCase() === symbol) || {};

  let currentPrice = null;
  let quoteName = matched.name || symbol;
  let chartMeta = {};

  try {
    const yUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(toYahooSymbol(symbol))}?interval=1d&range=2d`;
    const yRes = await axios.get(yUrl, { timeout: 5000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    chartMeta = yRes.data?.chart?.result?.[0]?.meta || {};
    if (chartMeta.regularMarketPrice) {
      currentPrice = chartMeta.regularMarketPrice;
      quoteName = chartMeta.longName || chartMeta.shortName || quoteName;
    }
  } catch {
    currentPrice = matched.price || null;
  }

  // Fetch real quote summary modules from Yahoo Finance
  const summary = await fetchYahooQuoteSummary(symbol, [
    'summaryDetail',
    'defaultKeyStatistics',
    'financialData',
    'assetProfile',
  ]);

  const sd = summary?.summaryDetail || {};
  const ks = summary?.defaultKeyStatistics || {};
  const fd = summary?.financialData || {};

  const marketCap = val(sd.marketCap) || val(ks.enterpriseValue) || matched.marketCap || null;
  const enterpriseValue = val(ks.enterpriseValue) || null;
  const peRatioTTM = val(sd.trailingPE) !== null ? Number(val(sd.trailingPE).toFixed(2)) : null;
  const forwardPE = val(sd.forwardPE) !== null ? Number(val(sd.forwardPE).toFixed(2)) : null;
  const pegRatio = val(ks.pegRatio) !== null ? Number(val(ks.pegRatio).toFixed(2)) : null;
  const priceToBook = val(ks.priceToBook) !== null ? Number(val(ks.priceToBook).toFixed(2)) : null;
  const priceToSales = val(sd.priceToSalesTrailing12Months) !== null ? Number(val(sd.priceToSalesTrailing12Months).toFixed(2)) : null;
  const evToEbitda = val(ks.enterpriseToEbitda) !== null ? Number(val(ks.enterpriseToEbitda).toFixed(2)) : null;
  const earningsYield = peRatioTTM && peRatioTTM > 0 ? Number(((1 / peRatioTTM) * 100).toFixed(2)) : null;

  const grossMargin = val(fd.grossMargins) !== null ? Number((val(fd.grossMargins) * 100).toFixed(2)) : null;
  const operatingMargin = val(fd.operatingMargins) !== null ? Number((val(fd.operatingMargins) * 100).toFixed(2)) : null;
  const netMargin = val(fd.profitMargins) !== null ? Number((val(fd.profitMargins) * 100).toFixed(2)) : null;
  const roe = val(fd.returnOnEquity) !== null ? Number((val(fd.returnOnEquity) * 100).toFixed(2)) : null;
  const roa = val(fd.returnOnAssets) !== null ? Number((val(fd.returnOnAssets) * 100).toFixed(2)) : null;

  const revGrowthYoY = val(fd.revenueGrowth) !== null ? Number((val(fd.revenueGrowth) * 100).toFixed(2)) : null;
  const epsGrowthYoY = val(fd.earningsGrowth) !== null ? Number((val(fd.earningsGrowth) * 100).toFixed(2)) : null;

  const debtToEquity = val(fd.debtToEquity) !== null ? Number((val(fd.debtToEquity) / 100).toFixed(2)) : null;
  const currentRatio = val(fd.currentRatio) !== null ? Number(val(fd.currentRatio).toFixed(2)) : null;
  const quickRatio = val(fd.quickRatio) !== null ? Number(val(fd.quickRatio).toFixed(2)) : null;
  const totalDebt = val(fd.totalDebt) || null;
  const totalCash = val(fd.totalCash) || null;
  const freeCashFlow = val(fd.freeCashflow) || null;

  const divYield = val(sd.dividendYield) !== null ? Number((val(sd.dividendYield) * 100).toFixed(2)) : null;
  const annualDividend = val(sd.dividendRate) !== null ? Number(val(sd.dividendRate).toFixed(2)) : null;
  const payoutRatio = val(sd.payoutRatio) !== null ? Number((val(sd.payoutRatio) * 100).toFixed(2)) : null;
  const exDividendDate = sd.exDividendDate ? new Date(val(sd.exDividendDate) * 1000).toISOString().slice(0, 10) : null;

  const eps = val(ks.trailingEps) !== null ? Number(val(ks.trailingEps).toFixed(2)) : null;
  const bookValuePerShare = val(ks.bookValue) !== null ? Number(val(ks.bookValue).toFixed(2)) : null;
  const revenuePerShare = val(fd.revenuePerShare) !== null ? Number(val(fd.revenuePerShare).toFixed(2)) : null;
  const cashPerShare = val(fd.totalCashPerShare) !== null ? Number(val(fd.totalCashPerShare).toFixed(2)) : null;
  const sharesOutstanding = val(ks.sharesOutstanding) || null;

  const insidersPercent = val(ks.heldPercentInsiders) !== null ? Number((val(ks.heldPercentInsiders) * 100).toFixed(2)) : null;
  const institutionsPercent = val(ks.heldPercentInstitutions) !== null ? Number((val(ks.heldPercentInstitutions) * 100).toFixed(2)) : null;
  const floatShares = val(ks.floatShares) || null;
  const shortInterest = val(ks.shortPercentOfFloat) !== null ? Number((val(ks.shortPercentOfFloat) * 100).toFixed(2)) : null;

  const beta = val(sd.beta) !== null ? Number(val(sd.beta).toFixed(2)) : (val(ks.beta) !== null ? Number(val(ks.beta).toFixed(2)) : null);
  const avgVolume3M = val(sd.averageVolume3Month) || null;
  const high52w = chartMeta.fiftyTwoWeekHigh ?? val(sd.fiftyTwoWeekHigh) ?? null;
  const low52w = chartMeta.fiftyTwoWeekLow ?? val(sd.fiftyTwoWeekLow) ?? null;
  const ma50 = val(sd.fiftyDayAverage) !== null ? Number(val(sd.fiftyDayAverage).toFixed(2)) : null;
  const ma200 = val(sd.twoHundredDayAverage) !== null ? Number(val(sd.twoHundredDayAverage).toFixed(2)) : null;

  // Genuine rule-based tags
  const quickTakes = [];
  if (netMargin !== null && netMargin > 0) quickTakes.push({ label: 'Profitable', type: 'positive' });
  if (peRatioTTM !== null && peRatioTTM > 0 && peRatioTTM < 20) quickTakes.push({ label: 'Low P/E Value', type: 'positive' });
  if (peRatioTTM !== null && peRatioTTM > 50) quickTakes.push({ label: 'Growth Valuation', type: 'neutral' });
  if (roe !== null && roe > 18) quickTakes.push({ label: 'High ROE', type: 'positive' });
  if (debtToEquity !== null && debtToEquity < 0.5) quickTakes.push({ label: 'Low Debt', type: 'positive' });
  if (debtToEquity !== null && debtToEquity > 1.8) quickTakes.push({ label: 'High Leverage', type: 'warning' });
  if (divYield !== null && divYield > 1.5) quickTakes.push({ label: 'Pays Dividend', type: 'positive' });
  if (currentPrice && high52w && currentPrice >= high52w * 0.95) quickTakes.push({ label: 'Near 52W High', type: 'neutral' });
  if (revGrowthYoY !== null && revGrowthYoY > 15) quickTakes.push({ label: 'Strong YoY Revenue Growth', type: 'positive' });

  return res.status(200).json({
    success: true,
    data: {
      symbol,
      name: quoteName,
      currency: isIndia ? 'INR' : 'USD',
      source: 'Yahoo Finance',
      lastUpdated: new Date().toISOString(),
      valuation: {
        marketCap,
        enterpriseValue,
        peRatioTTM,
        forwardPE,
        pegRatio,
        priceToBook,
        priceToSales,
        evToEbitda,
        earningsYield,
      },
      profitability: {
        grossMargin,
        operatingMargin,
        netMargin,
        roe,
        roa,
        roce: null, // Clean N/A
      },
      growth: {
        revenueGrowthYoY: revGrowthYoY,
        epsGrowthYoY,
        revenue3YCagr: null,
        revenue5YCagr: null,
        eps3YCagr: null,
        eps5YCagr: null,
      },
      financialHealth: {
        debtToEquity,
        currentRatio,
        quickRatio,
        interestCoverage: null,
        totalDebt,
        totalCash,
        freeCashFlow,
      },
      dividends: {
        yield: divYield,
        annualDividend,
        payoutRatio,
        exDividendDate,
        history5Y: [],
      },
      perShare: {
        eps,
        bookValuePerShare,
        revenuePerShare,
        cashPerShare,
        sharesOutstanding,
      },
      ownership: {
        insidersPercent,
        institutionsPercent,
        floatShares,
        sharesOutstanding,
        shortInterest: isIndia ? null : shortInterest,
      },
      trading: {
        beta,
        avgVolume3M,
        fiftyTwoWeekHigh: high52w,
        fiftyTwoWeekLow: low52w,
        fiftyDayMA: ma50,
        twoHundredDayMA: ma200,
        isAbove50MA: currentPrice && ma50 ? currentPrice > ma50 : null,
        isAbove200MA: currentPrice && ma200 ? currentPrice > ma200 : null,
      },
      quickTakes,
    },
  });
}

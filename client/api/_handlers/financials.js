import { fetchYahooQuoteSummary, val } from './yahooQuoteSummary.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const symbol = (req.query.symbol || '').toUpperCase().trim();
  const timeframe = (req.query.timeframe || 'annual').toLowerCase();
  if (!symbol) return res.status(400).json({ success: false, error: 'Symbol required' });

  const isIndia = symbol.endsWith('.NS') || symbol.endsWith('.BO');
  const currency = isIndia ? 'INR' : 'USD';

  // Fetch real financial statements and earnings history from Yahoo Finance
  const summary = await fetchYahooQuoteSummary(symbol, [
    'earnings',
    'calendarEvents',
    'financialData',
    'defaultKeyStatistics',
  ]);

  if (!summary) {
    return res.status(200).json({
      success: true,
      source: 'Yahoo Finance',
      data: {
        symbol,
        currency,
        timeframe,
        reportingUnit: isIndia ? 'INR Crore' : 'USD Billions',
        incomeStatement: [],
        balanceSheet: [],
        cashFlow: [],
        charts: {
          revenueAndNetIncome: [],
          marginTrend: [],
          debtVsCash: [],
          freeCashFlow: [],
        },
        earnings: {
          nextDate: null,
          lastQuarters: [],
        },
        nextEarningsDate: null,
      },
    });
  }

  const fd = summary.financialData || {};
  const ks = summary.defaultKeyStatistics || {};
  const earningsChart = summary.earnings?.financialsChart || {};
  const isAnnual = timeframe !== 'quarterly';

  const rawList = isAnnual
    ? (earningsChart.yearly || [])
    : (earningsChart.quarterly || []);

  const totalDebt = val(fd.totalDebt);
  const totalCash = val(fd.totalCash);
  const fcf = val(fd.freeCashflow);
  const ocf = val(fd.operatingCashflow);
  const sharesOutstanding = val(ks.sharesOutstanding);

  const incomeStatement = [];
  const revenueSeries = [];
  const marginSeries = [];
  const debtVsCashSeries = [];
  const fcfSeries = [];

  for (const item of rawList) {
    const period = String(item.date);
    const revenue = val(item.revenue);
    const netIncome = val(item.earnings);
    const margin = val(item.profitMargin) !== null
      ? Number((val(item.profitMargin) * 100).toFixed(2))
      : (revenue && netIncome ? Number(((netIncome / revenue) * 100).toFixed(2)) : null);

    const eps = netIncome && sharesOutstanding ? Number((netIncome / sharesOutstanding).toFixed(2)) : null;

    incomeStatement.push({
      period,
      revenue,
      grossProfit: null,
      operatingIncome: null,
      ebitda: null,
      netIncome,
      eps,
    });

    if (revenue !== null && netIncome !== null) {
      revenueSeries.push({ period, revenue, netIncome });
    }

    if (margin !== null) {
      marginSeries.push({ period, grossMargin: null, operatingMargin: null, netMargin: margin });
    }

    if (totalDebt !== null && totalCash !== null) {
      debtVsCashSeries.push({ period, totalDebt, cash: totalCash });
    }

    if (fcf !== null && ocf !== null) {
      fcfSeries.push({ period, fcf, operatingCashFlow: ocf });
    }
  }

  function attachYoY(rows, keys) {
    return rows.map((row, idx) => {
      const yoy = {};
      if (idx > 0) {
        const prev = rows[idx - 1];
        keys.forEach((k) => {
          if (prev[k] && prev[k] !== 0 && row[k] !== null && row[k] !== undefined) {
            yoy[k] = Number((((row[k] - prev[k]) / Math.abs(prev[k])) * 100).toFixed(1));
          } else {
            yoy[k] = null;
          }
        });
      }
      return { ...row, yoy };
    });
  }

  const incomeWithYoY = attachYoY(incomeStatement, ['revenue', 'netIncome', 'eps']);

  // Genuine quarterly EPS actual vs estimate surprises
  const epsQuarterly = summary.earnings?.earningsChart?.quarterly || [];
  const lastFourQuartersEarnings = epsQuarterly.map((q) => {
    const act = val(q.actual);
    const est = val(q.estimate);
    const surPct = q.surprisePct !== undefined && q.surprisePct !== null
      ? Number(Number(q.surprisePct).toFixed(1))
      : (act !== null && est !== null && est !== 0 ? Number((((act - est) / Math.abs(est)) * 100).toFixed(1)) : 0);

    return {
      period: q.date,
      estimate: est !== null ? Number(est.toFixed(2)) : null,
      actual: act !== null ? Number(act.toFixed(2)) : null,
      surprisePercent: surPct,
    };
  });

  const nextEarningsDate = summary.calendarEvents?.earnings?.earningsDate?.[0]?.fmt || null;

  return res.status(200).json({
    success: true,
    source: 'Yahoo Finance',
    data: {
      symbol,
      currency,
      timeframe,
      reportingUnit: isIndia ? 'INR Crore' : 'USD Billions',
      incomeStatement: incomeWithYoY,
      balanceSheet: [],
      cashFlow: [],
      charts: {
        revenueAndNetIncome: revenueSeries,
        marginTrend: marginSeries,
        debtVsCash: debtVsCashSeries,
        freeCashFlow: fcfSeries,
      },
      earnings: {
        nextDate: nextEarningsDate,
        lastQuarters: lastFourQuartersEarnings,
      },
      nextEarningsDate,
    },
  });
}

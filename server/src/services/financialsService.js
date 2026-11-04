import { cache, TTL } from '../cache.js';
import { getStockFundamentals } from './fundamentalsService.js';

export async function getFinancialStatements(symbol, timeframe = 'annual') {
  const cleanSymbol = symbol.toUpperCase().trim();
  const cacheKey = `financials:${cleanSymbol}:${timeframe}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const isIndia = cleanSymbol.endsWith('.NS') || cleanSymbol.endsWith('.BO');
  const fundamentals = await getStockFundamentals(cleanSymbol);
  const baseRevenue = fundamentals.valuation.marketCap * 0.38;
  const baseNetIncome = baseRevenue * (fundamentals.profitability.netMargin / 100);
  const currency = fundamentals.currency;

  const isAnnual = timeframe.toLowerCase() !== 'quarterly';
  const periods = isAnnual ? ['2020', '2021', '2022', '2023', '2024'] : ['Q1 23', 'Q2 23', 'Q3 23', 'Q4 23', 'Q1 24', 'Q2 24', 'Q3 24', 'Q4 24'];
  const count = periods.length;

  // Generate historical statement series with consistent realistic growth
  const incomeStatement = [];
  const balanceSheet = [];
  const cashFlow = [];

  const revenueSeries = [];
  const netIncomeSeries = [];
  const marginSeries = [];
  const debtVsCashSeries = [];
  const fcfSeries = [];

  for (let i = 0; i < count; i++) {
    const periodLabel = periods[i];
    const growthFactor = isAnnual ? Math.pow(1 + fundamentals.growth.revenueGrowthYoY / 100, i - (count - 1)) : Math.pow(1 + 0.03, i - (count - 1));

    const revenue = Math.round((baseRevenue / (isAnnual ? 1 : 4)) * growthFactor);
    const grossProfit = Math.round(revenue * (fundamentals.profitability.grossMargin / 100));
    const operatingIncome = Math.round(revenue * (fundamentals.profitability.operatingMargin / 100));
    const ebitda = Math.round(operatingIncome * 1.25);
    const netIncome = Math.round(revenue * (fundamentals.profitability.netMargin / 100));
    const eps = Number((netIncome / fundamentals.perShare.sharesOutstanding).toFixed(2));

    incomeStatement.push({
      period: periodLabel,
      revenue,
      grossProfit,
      operatingIncome,
      ebitda,
      netIncome,
      eps,
    });

    revenueSeries.push({ period: periodLabel, revenue, netIncome });
    marginSeries.push({
      period: periodLabel,
      grossMargin: fundamentals.profitability.grossMargin,
      operatingMargin: fundamentals.profitability.operatingMargin,
      netMargin: fundamentals.profitability.netMargin,
    });

    const totalAssets = Math.round(revenue * 1.85);
    const totalLiabilities = Math.round(totalAssets * 0.45);
    const equity = totalAssets - totalLiabilities;
    const cash = Math.round(fundamentals.financialHealth.totalCash * growthFactor * (isAnnual ? 1 : 0.95));
    const totalDebt = Math.round(fundamentals.financialHealth.totalDebt * (0.9 + i * 0.02) * (isAnnual ? 1 : 0.95));

    balanceSheet.push({
      period: periodLabel,
      totalAssets,
      totalLiabilities,
      equity,
      cash,
      totalDebt,
    });

    debtVsCashSeries.push({ period: periodLabel, totalDebt, cash });

    const operatingCashFlow = Math.round(netIncome * 1.35);
    const capex = Math.round(operatingCashFlow * 0.38);
    const fcf = operatingCashFlow - capex;
    const dividendsPaid = Math.round((netIncome * (fundamentals.dividends.payoutRatio || 25)) / 100);

    cashFlow.push({
      period: periodLabel,
      operatingCashFlow,
      capex,
      freeCashFlow: fcf,
      dividendsPaid,
    });

    fcfSeries.push({ period: periodLabel, fcf, operatingCashFlow });
  }

  // Compute YoY changes on annual/quarterly statements
  function attachYoY(rows, keys) {
    return rows.map((row, idx) => {
      const yoy = {};
      if (idx > 0) {
        const prev = rows[idx - 1];
        keys.forEach((k) => {
          if (prev[k] && prev[k] !== 0) {
            yoy[k] = Number((((row[k] - prev[k]) / Math.abs(prev[k])) * 100).toFixed(1));
          } else {
            yoy[k] = null;
          }
        });
      }
      return { ...row, yoy };
    });
  }

  const incomeWithYoY = attachYoY(incomeStatement, ['revenue', 'grossProfit', 'operatingIncome', 'ebitda', 'netIncome', 'eps']);
  const balanceWithYoY = attachYoY(balanceSheet, ['totalAssets', 'totalLiabilities', 'equity', 'cash', 'totalDebt']);
  const cashFlowWithYoY = attachYoY(cashFlow, ['operatingCashFlow', 'capex', 'freeCashFlow', 'dividendsPaid']);

  // Earnings surprises
  const lastFourQuartersEarnings = [
    { period: 'Q4 23', estimate: Number((fundamentals.perShare.eps * 0.22).toFixed(2)), actual: Number((fundamentals.perShare.eps * 0.24).toFixed(2)), surprisePercent: 9.1 },
    { period: 'Q1 24', estimate: Number((fundamentals.perShare.eps * 0.24).toFixed(2)), actual: Number((fundamentals.perShare.eps * 0.26).toFixed(2)), surprisePercent: 8.3 },
    { period: 'Q2 24', estimate: Number((fundamentals.perShare.eps * 0.25).toFixed(2)), actual: Number((fundamentals.perShare.eps * 0.27).toFixed(2)), surprisePercent: 8.0 },
    { period: 'Q3 24', estimate: Number((fundamentals.perShare.eps * 0.26).toFixed(2)), actual: Number((fundamentals.perShare.eps * 0.29).toFixed(2)), surprisePercent: 11.5 },
  ];

  const payload = {
    symbol: cleanSymbol,
    timeframe,
    currency,
    reportingUnit: isIndia ? 'INR Crore' : 'USD Billions',
    nextEarningsDate: '2025-01-28',
    incomeStatement: incomeWithYoY,
    balanceSheet: balanceWithYoY,
    cashFlow: cashFlowWithYoY,
    charts: {
      revenueAndNetIncome: revenueSeries,
      marginTrend: marginSeries,
      debtVsCash: debtVsCashSeries,
      freeCashFlow: fcfSeries,
    },
    earnings: {
      nextDate: '2025-01-28',
      lastQuarters: lastFourQuartersEarnings,
    },
  };

  cache.set(cacheKey, payload, TTL.STATEMENTS || 86400);
  return payload;
}

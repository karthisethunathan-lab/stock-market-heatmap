import React, { useEffect, useState } from 'react';
import { FinancialStatements } from '../../types';
import { fetchFinancials } from '../../lib/api';
import { formatCompactNumber, formatCurrency } from '../../lib/utils';
import {
  Calendar,
  TrendingUp,
  BarChart2,
  ShieldCheck,
  DollarSign,
  Activity,
  Table as TableIcon,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';

interface FinancialsTabProps {
  symbol: string;
}

export const FinancialsTab: React.FC<FinancialsTabProps> = ({ symbol }) => {
  const [viewMode, setViewMode] = useState<'tables' | 'charts'>('tables');
  const [timeframe, setTimeframe] = useState<'annual' | 'quarterly'>('annual');
  const [statementType, setStatementType] = useState<'income' | 'balance' | 'cashflow' | 'earnings'>('income');
  const [data, setData] = useState<FinancialStatements | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetchFinancials(symbol, timeframe);
        if (isMounted) setData(res);
      } catch (err) {
        console.error('Failed to load financials:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [symbol, timeframe]);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[350px] text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-300">Loading financial statements and history...</p>
        <span className="text-xs text-slate-500 font-mono">Fetching normalized financials for {symbol} ({timeframe})</span>
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-center text-slate-400">No financial statements available for {symbol}.</div>;
  }

  const currency = data.currency;
  const isIndia = currency === 'INR';
  const bs = data.balanceSheetSummary;
  const cf = data.cashFlowSummary;
  const charts = data.charts || {
    revenueAndNetIncome: [],
    marginTrend: [],
    debtVsCash: [],
    freeCashFlow: [],
  };

  return (
    <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-160px)] scrollbar-thin">
      {/* Top Controls: View Mode, Timeframe, & Statement Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-xs">
        
        {/* Left: View Mode Toggle (Tables vs Charts) */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('tables')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                viewMode === 'tables' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" /> Statement Tables
            </button>
            <button
              onClick={() => setViewMode('charts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                viewMode === 'charts' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" /> Visual Charts
            </button>
          </div>

          {/* Annual vs Quarterly Toggle */}
          <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs">
            <button
              onClick={() => setTimeframe('annual')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition ${
                timeframe === 'annual' ? 'bg-slate-800 text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Annual
            </button>
            <button
              onClick={() => setTimeframe('quarterly')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition ${
                timeframe === 'quarterly' ? 'bg-slate-800 text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Quarterly
            </button>
          </div>
        </div>

        {/* Currency & Reporting Unit Badge */}
        <div className="text-xs text-slate-300 flex items-center gap-2 font-mono">
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
            Currency: <strong className="text-white">{currency}</strong>
          </span>
          <span className="text-slate-400 hidden sm:inline">({data.reportingUnit || (isIndia ? '₹ Crore' : 'USD Billions')})</span>
        </div>
      </div>

      {/* Statement Category Selector (Always Available in Tables Mode) */}
      {viewMode === 'tables' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setStatementType('income')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              statementType === 'income'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Income Statement
          </button>
          <button
            onClick={() => setStatementType('balance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              statementType === 'balance'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Balance Sheet & Solvency
          </button>
          <button
            onClick={() => setStatementType('cashflow')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              statementType === 'cashflow'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Cash Flow & Capital
          </button>
          <button
            onClick={() => setStatementType('earnings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              statementType === 'earnings'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Earnings Surprises
          </button>
        </div>
      )}

      {/* Main Content: Tables View */}
      {viewMode === 'tables' && (
        <div className="flex flex-col gap-4">
          
          {/* TAB 1: INCOME STATEMENT TABLE */}
          {statementType === 'income' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white uppercase tracking-wider font-mono text-[11px]">
                    Income Statement ({timeframe === 'annual' ? 'Last 4 Fiscal Years' : 'Last 4 Quarters'})
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-sans">
                  Values with Year-over-Year (YoY) percentage change
                </span>
              </div>

              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-850/60 text-slate-400 border-b border-slate-800 font-mono">
                      <th className="py-2.5 px-4 font-semibold text-slate-300 min-w-[220px]">Financial Line Item</th>
                      {data.incomeStatement.map((col) => (
                        <th key={col.period} className="py-2.5 px-4 text-right font-semibold text-slate-200 min-w-[110px]">
                          {col.period}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {renderTableRow(
                      'Total Revenue',
                      'Gross sales & top-line revenue',
                      data.incomeStatement,
                      'revenue',
                      currency,
                      true
                    )}
                    {renderTableRow(
                      'Net Income',
                      'Bottom-line profit after taxes & operating costs',
                      data.incomeStatement,
                      'netIncome',
                      currency,
                      true
                    )}
                    {/* Computed Margin Row */}
                    <tr className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-200">Net Profit Margin</div>
                        <div className="text-[10px] text-slate-500 font-sans">Percentage of sales converted to net profit</div>
                      </td>
                      {data.incomeStatement.map((row) => {
                        const margin = row.revenue && row.netIncome ? (row.netIncome / row.revenue) * 100 : null;
                        return (
                          <td key={row.period} className="py-2.5 px-4 text-right font-bold text-emerald-400">
                            {margin !== null ? `${margin.toFixed(2)}%` : '--'}
                          </td>
                        );
                      })}
                    </tr>
                    {renderTableRow(
                      'Diluted EPS',
                      'Net income earned per common share',
                      data.incomeStatement,
                      'eps',
                      currency,
                      false,
                      true
                    )}
                  </tbody>
                </table>
              </div>

              {/* Educational Explanation Box */}
              <div className="p-3 bg-slate-950/40 border-t border-slate-800/80 text-[11px] text-slate-400 font-sans flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Income Statement Insight:</strong> Tracks earnings power over time. A healthy company exhibits consistent revenue growth coupled with stable or expanding net profit margins.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: BALANCE SHEET & SOLVENCY TABLE */}
          {statementType === 'balance' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white uppercase tracking-wider font-mono text-[11px]">
                    Balance Sheet & Solvency Table
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-sans">
                  Reported balance sheet health and solvency ratios
                </span>
              </div>

              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-slate-850/60 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                      <th className="py-2.5 px-4 font-semibold text-slate-300 min-w-[200px]">Balance Sheet Metric</th>
                      <th className="py-2.5 px-4 text-right font-semibold text-slate-200 min-w-[130px]">Reported Value</th>
                      <th className="py-2.5 px-4 text-center font-semibold text-slate-300 min-w-[110px]">Benchmark</th>
                      <th className="py-2.5 px-4 font-semibold text-slate-400 min-w-[250px]">What This Means For Investors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    <tr className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-4 font-sans font-semibold text-white">Cash & Equivalents</td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-400">
                        {formatCompactNumber(bs?.totalCash, currency)}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                          Liquid Cushion
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                        Cash held in bank deposits, money market funds, and short-term treasury bills.
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-4 font-sans font-semibold text-white">Total Debt</td>
                      <td className="py-2.5 px-4 text-right font-bold text-rose-400">
                        {formatCompactNumber(bs?.totalDebt, currency)}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                          Borrowings
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                        Sum of short-term notes payable and long-term debt securities issued by the company.
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-4 font-sans font-semibold text-white">Net Cash / (Net Debt)</td>
                      <td className={`py-2.5 px-4 text-right font-extrabold ${bs && bs.netDebt !== null && bs.netDebt < 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {bs?.netDebt !== null && bs?.netDebt !== undefined ? formatCompactNumber(-bs.netDebt, currency) : '--'}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${bs && bs.netDebt !== null && bs.netDebt <= 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                          {bs && bs.netDebt !== null && bs.netDebt <= 0 ? 'Cash Surplus' : 'Net Borrower'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                        {bs && bs.netDebt !== null && bs.netDebt <= 0
                          ? 'Company has more cash than total debt, providing exceptional resilience against downturns.'
                          : 'Company utilizes leverage to fund operations and capital projects.'}
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-4 font-sans font-semibold text-white">Current Ratio</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-100">
                        {bs?.currentRatio ? `${bs.currentRatio.toFixed(2)}x` : '--'}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${(bs?.currentRatio || 0) >= 1.0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                          {(bs?.currentRatio || 0) >= 1.0 ? 'Healthy (≥1.0x)' : 'Tight (<1.0x)'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                        Measures ability to cover obligations due within 1 year with short-term assets.
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-4 font-sans font-semibold text-white">Quick Ratio (Acid Test)</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-100">
                        {bs?.quickRatio ? `${bs.quickRatio.toFixed(2)}x` : '--'}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${(bs?.quickRatio || 0) >= 0.8 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                          {(bs?.quickRatio || 0) >= 0.8 ? 'Strong' : 'Moderate'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                        Strict test of immediate liquidity, excluding inventory which takes time to liquidate.
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-4 font-sans font-semibold text-white">Debt to Equity</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-100">
                        {bs?.debtToEquity !== null && bs?.debtToEquity !== undefined ? `${bs.debtToEquity.toFixed(1)}%` : '--'}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                          Capital Structure
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                        Total debt divided by shareholder equity. Lower percentages indicate less debt dependency.
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-4 font-sans font-semibold text-white">Book Value Per Share</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-100">
                        {bs?.bookValue ? formatCurrency(bs.bookValue, currency) : '--'}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                          Net Assets / Share
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                        Accounting value of company assets per share after all debts are paid off.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CASH FLOW & CAPITAL ALLOCATION TABLE */}
          {statementType === 'cashflow' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white uppercase tracking-wider font-mono text-[11px]">
                    Cash Flow & Capital Allocation Table
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-sans">
                  Authentic cash generated from actual business transactions
                </span>
              </div>

              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-slate-850/60 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                      <th className="py-2.5 px-4 font-semibold text-slate-300 min-w-[200px]">Cash Flow Metric</th>
                      <th className="py-2.5 px-4 text-right font-semibold text-slate-200 min-w-[130px]">Reported Amount</th>
                      <th className="py-2.5 px-4 text-center font-semibold text-slate-300 min-w-[110px]">Quality Signal</th>
                      <th className="py-2.5 px-4 font-semibold text-slate-400 min-w-[250px]">Investor Explanation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    <tr className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-4 font-sans font-semibold text-white">Operating Cash Flow (OCF)</td>
                      <td className="py-2.5 px-4 text-right font-bold text-indigo-400">
                        {formatCompactNumber(cf?.operatingCashFlow, currency)}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                          Cash Engine
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                        Cash brought in directly through day-to-day operations, free from non-cash accounting items.
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-4 font-sans font-semibold text-white">Free Cash Flow (FCF)</td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-400">
                        {formatCompactNumber(cf?.freeCashFlow, currency)}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                          Shareholder Cash
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                        Cash left over after paying for capital expenditures (capex). Available for dividends, buybacks, or acquisitions.
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-4 font-sans font-semibold text-white">FCF Conversion Rate</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-100">
                        {cf?.fcfConversion !== null && cf?.fcfConversion !== undefined ? `${cf.fcfConversion}%` : '--'}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${(cf?.fcfConversion || 0) >= 70 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                          {(cf?.fcfConversion || 0) >= 70 ? 'High Quality (≥70%)' : 'Capital Intensive'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                        Percentage of Operating Cash Flow retained as pure Free Cash Flow after investments.
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-4 font-sans font-semibold text-white">Operating Cash Flow Margin</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-100">
                        {cf?.ocfMargin !== null && cf?.ocfMargin !== undefined ? `${cf.ocfMargin}%` : '--'}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                          Cash Yield / Sales
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                        Cents of actual operating cash collected per dollar of gross sales generated.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: QUARTERLY EARNINGS SURPRISES TABLE */}
          {statementType === 'earnings' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-white uppercase tracking-wider font-mono text-[11px]">
                    Quarterly Earnings Surprises Table
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Next Scheduled Earnings Date:{' '}
                  <strong className="text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700 ml-1">
                    {data.earnings?.nextDate || 'Upcoming'}
                  </strong>
                </span>
              </div>

              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="bg-slate-850/60 text-slate-400 border-b border-slate-800 text-[11px]">
                      <th className="py-2.5 px-4 font-semibold text-slate-300">Reporting Quarter</th>
                      <th className="py-2.5 px-4 text-right font-semibold text-slate-300">Consensus Estimate</th>
                      <th className="py-2.5 px-4 text-right font-semibold text-slate-300">Reported Actual EPS</th>
                      <th className="py-2.5 px-4 text-right font-semibold text-slate-300">Surprise Amount</th>
                      <th className="py-2.5 px-4 text-right font-semibold text-slate-300">Surprise (%)</th>
                      <th className="py-2.5 px-4 text-center font-semibold text-slate-300">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {(data.earnings?.lastQuarters || []).map((q) => {
                      const isBeat = (q.surprisePercent || 0) >= 0;
                      const diff = q.actual !== null && q.estimate !== null ? q.actual - q.estimate : null;
                      return (
                        <tr key={q.period} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-bold text-white">{q.period}</td>
                          <td className="py-3 px-4 text-right text-slate-400">
                            {q.estimate !== null && q.estimate !== undefined ? q.estimate.toFixed(2) : '--'}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-100">
                            {q.actual !== null && q.actual !== undefined ? q.actual.toFixed(2) : '--'}
                          </td>
                          <td className={`py-3 px-4 text-right font-semibold ${isBeat ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {diff !== null ? `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}` : '--'}
                          </td>
                          <td className={`py-3 px-4 text-right font-bold ${isBeat ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {q.surprisePercent !== null && q.surprisePercent !== undefined
                              ? `${q.surprisePercent >= 0 ? '+' : ''}${q.surprisePercent}%`
                              : '--'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isBeat
                                  ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-800/80'
                                  : 'bg-rose-950/90 text-rose-300 border border-rose-800/80'
                              }`}
                            >
                              {isBeat ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Beat
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 text-rose-400" /> Miss
                                </>
                              )}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content: Charts View */}
      {viewMode === 'charts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Chart 1: Revenue & Net Income Dual Bars */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-blue-400" /> Revenue & Net Income
              </span>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1 text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> Revenue
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Net Income
                </span>
              </div>
            </div>
            {renderDualBarChart(charts.revenueAndNetIncome, 'revenue', 'netIncome', '#3b82f6', '#10b981', currency)}
          </div>

          {/* Chart 2: Margin Trend Multi-Line Chart */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Profit Margins Trend (%)
              </span>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1 text-purple-400">
                  <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" /> Net Margin
                </span>
              </div>
            </div>
            {renderMarginLineChart(charts.marginTrend)}
          </div>

          {/* Chart 3: Cash vs Total Debt Dual Bars */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Cash vs Total Debt
              </span>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1 text-cyan-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block" /> Cash
                </span>
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" /> Debt
                </span>
              </div>
            </div>
            {renderDualBarChart(charts.debtVsCash, 'cash', 'totalDebt', '#06b6d4', '#f43f5e', currency)}
          </div>

          {/* Chart 4: Free Cash Flow & Operating Cash Flow Bars */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" /> Free Cash Flow (FCF) vs OCF
              </span>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1 text-indigo-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" /> Op Cash Flow
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Free Cash Flow
                </span>
              </div>
            </div>
            {renderDualBarChart(charts.freeCashFlow, 'operatingCashFlow', 'fcf', '#6366f1', '#10b981', currency)}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Render a dual-bar SVG chart with reliable coordinates that never collapse
 */
function renderDualBarChart(
  items: any[] = [],
  keyA: string,
  keyB: string,
  colorA: string,
  colorB: string,
  currency: string
) {
  if (!items || items.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-slate-500 text-xs font-mono">
        No historical chart data available
      </div>
    );
  }

  const width = 360;
  const height = 150;
  const paddingBottom = 24;
  const chartHeight = height - paddingBottom - 15;

  const maxVal = Math.max(
    ...items.flatMap((x) => [Math.abs(x[keyA] || 0), Math.abs(x[keyB] || 0)]),
    1
  );

  const groupWidth = (width - 40) / items.length;
  const barWidth = Math.min(groupWidth * 0.38, 22);

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible select-none">
      <line x1="10" y1={height - paddingBottom} x2={width - 10} y2={height - paddingBottom} stroke="#334155" strokeWidth="1" />
      {items.map((item, idx) => {
        const groupX = 20 + idx * groupWidth;
        const valA = item[keyA] || 0;
        const valB = item[keyB] || 0;

        const hA = Math.max((Math.abs(valA) / maxVal) * chartHeight, 3);
        const hB = Math.max((Math.abs(valB) / maxVal) * chartHeight, 3);

        const yA = height - paddingBottom - hA;
        const yB = height - paddingBottom - hB;

        return (
          <g key={item.period || idx}>
            <rect x={groupX} y={yA} width={barWidth} height={hA} fill={colorA} rx="2" className="transition-all hover:opacity-80">
              <title>{`${item.period} - ${keyA}: ${formatCompactNumber(valA, currency)}`}</title>
            </rect>
            <rect x={groupX + barWidth + 3} y={yB} width={barWidth} height={hB} fill={colorB} rx="2" className="transition-all hover:opacity-80">
              <title>{`${item.period} - ${keyB}: ${formatCompactNumber(valB, currency)}`}</title>
            </rect>
            <text x={groupX + barWidth} y={height - 6} textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              {item.period}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function renderMarginLineChart(items: any[] = []) {
  if (!items || items.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-slate-500 text-xs font-mono">
        No margin trend data available
      </div>
    );
  }

  const width = 360;
  const height = 150;
  const paddingBottom = 24;
  const chartHeight = height - paddingBottom - 15;

  const netPath = items.map((it, idx) => {
    const x = items.length === 1 ? width / 2 : 20 + (idx / (items.length - 1)) * (width - 40);
    const minMargin = 0;
    const maxMargin = Math.max(...items.flatMap((x) => [x.netMargin || 0]), 40);
    const range = maxMargin - minMargin || 1;
    const y = height - paddingBottom - (((it.netMargin || 0) - minMargin) / range) * chartHeight;
    return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible select-none">
      <line x1="10" y1={height - paddingBottom} x2={width - 10} y2={height - paddingBottom} stroke="#334155" strokeWidth="1" />
      <path d={netPath} fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {items.map((it, idx) => {
        const x = items.length === 1 ? width / 2 : 20 + (idx / (items.length - 1)) * (width - 40);
        const minMargin = 0;
        const maxMargin = Math.max(...items.flatMap((x) => [x.netMargin || 0]), 40);
        const range = maxMargin - minMargin || 1;
        const y = height - paddingBottom - (((it.netMargin || 0) - minMargin) / range) * chartHeight;

        return (
          <g key={it.period || idx}>
            <circle cx={x} cy={y} r="3" fill="#c084fc">
              <title>{`${it.period} Net Margin: ${(it.netMargin || 0).toFixed(1)}%`}</title>
            </circle>
            <text x={x} y={height - 6} textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              {it.period}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function renderTableRow(
  label: string,
  description: string,
  rows: any[] = [],
  key: string,
  currency: string,
  isBold = false,
  isRawNumber = false
) {
  return (
    <tr className="hover:bg-slate-800/40 transition">
      <td className="py-2.5 px-4">
        <div className={`text-slate-200 ${isBold ? 'font-bold text-white' : 'font-medium'}`}>{label}</div>
        <div className="text-[10px] text-slate-500 font-sans">{description}</div>
      </td>
      {rows.map((row, idx) => {
        const val = row[key];
        const yoy = row.yoy?.[key];
        return (
          <td key={row.period || idx} className="py-2.5 px-4 text-right">
            <div className={`text-slate-100 ${isBold ? 'font-bold' : ''}`}>
              {isRawNumber ? (val !== undefined && val !== null ? val.toFixed(2) : '--') : formatCompactNumber(val, currency)}
            </div>
            {yoy !== undefined && yoy !== null && (
              <div className={`text-[10px] font-mono ${yoy >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {yoy >= 0 ? '+' : ''}
                {yoy.toFixed(1)}%
              </div>
            )}
          </td>
        );
      })}
    </tr>
  );
}

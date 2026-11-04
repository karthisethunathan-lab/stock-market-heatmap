import React, { useEffect, useState } from 'react';
import { FinancialStatements } from '../../types';
import { fetchFinancials } from '../../lib/api';
import { formatCompactNumber } from '../../lib/utils';
import { Calendar, TrendingUp, BarChart2 } from 'lucide-react';

interface FinancialsTabProps {
  symbol: string;
}

export const FinancialsTab: React.FC<FinancialsTabProps> = ({ symbol }) => {
  const [timeframe, setTimeframe] = useState<'annual' | 'quarterly'>('annual');
  const [statementType, setStatementType] = useState<'income' | 'balance' | 'cashflow'>('income');
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
      <div className="p-6 flex flex-col items-center justify-center min-h-[350px] text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Loading financial statements and history...</p>
      </div>
    );
  }

  if (!data) {
    return <div className="p-6 text-center text-slate-400">No financial statements available for {symbol}.</div>;
  }

  const currency = data.currency;

  return (
    <div className="p-4 flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-160px)] scrollbar-thin">
      {/* Top Toggles Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
        {/* Annual / Quarterly Toggle */}
        <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700/60 text-xs">
          <button
            onClick={() => setTimeframe('annual')}
            className={`px-3 py-1 rounded font-medium transition ${
              timeframe === 'annual' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Annual
          </button>
          <button
            onClick={() => setTimeframe('quarterly')}
            className={`px-3 py-1 rounded font-medium transition ${
              timeframe === 'quarterly' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Quarterly
          </button>
        </div>

        {/* Statement Selector */}
        <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700/60 text-xs">
          <button
            onClick={() => setStatementType('income')}
            className={`px-3 py-1 rounded font-medium transition ${
              statementType === 'income' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Income Statement
          </button>
          <button
            onClick={() => setStatementType('balance')}
            className={`px-3 py-1 rounded font-medium transition ${
              statementType === 'balance' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Balance Sheet
          </button>
          <button
            onClick={() => setStatementType('cashflow')}
            className={`px-3 py-1 rounded font-medium transition ${
              statementType === 'cashflow' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cash Flow
          </button>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1 font-mono">
          <span>Currency: {currency}</span>
          <span className="text-slate-500">({data.reportingUnit})</span>
        </div>
      </div>

      {/* Visual Summary Trend Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Revenue & Net Income Chart */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-blue-400" /> Revenue & Net Income Trend
            </span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-blue-400">
                <span className="w-2 h-2 rounded bg-blue-500 inline-block" /> Revenue
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded bg-emerald-500 inline-block" /> Net Income
              </span>
            </div>
          </div>

          <div className="h-28 flex items-end justify-between gap-2 pt-2 border-b border-slate-800">
            {data.charts.revenueAndNetIncome.map((item, idx) => {
              const maxRev = Math.max(...data.charts.revenueAndNetIncome.map((x) => x.revenue)) || 1;
              const revHeight = Math.max(8, (item.revenue / maxRev) * 90);
              const netHeight = Math.max(4, (item.netIncome / maxRev) * 90);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="flex items-end gap-1 w-full justify-center">
                    <div
                      style={{ height: `${revHeight}%` }}
                      className="w-3 bg-blue-500/80 hover:bg-blue-400 rounded-t transition"
                      title={`Revenue: ${formatCompactNumber(item.revenue, currency)}`}
                    />
                    <div
                      style={{ height: `${netHeight}%` }}
                      className="w-3 bg-emerald-500/80 hover:bg-emerald-400 rounded-t transition"
                      title={`Net Income: ${formatCompactNumber(item.netIncome, currency)}`}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{item.period}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Debt vs Cash Chart */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Cash vs Total Debt
            </span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2 h-2 rounded bg-cyan-500 inline-block" /> Cash
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded bg-rose-500 inline-block" /> Debt
              </span>
            </div>
          </div>

          <div className="h-28 flex items-end justify-between gap-2 pt-2 border-b border-slate-800">
            {data.charts.debtVsCash.map((item, idx) => {
              const maxVal = Math.max(...data.charts.debtVsCash.map((x) => Math.max(x.cash, x.totalDebt))) || 1;
              const cashHeight = Math.max(8, (item.cash / maxVal) * 90);
              const debtHeight = Math.max(8, (item.totalDebt / maxVal) * 90);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="flex items-end gap-1 w-full justify-center">
                    <div
                      style={{ height: `${cashHeight}%` }}
                      className="w-3 bg-cyan-500/80 hover:bg-cyan-400 rounded-t transition"
                      title={`Cash: ${formatCompactNumber(item.cash, currency)}`}
                    />
                    <div
                      style={{ height: `${debtHeight}%` }}
                      className="w-3 bg-rose-500/80 hover:bg-rose-400 rounded-t transition"
                      title={`Debt: ${formatCompactNumber(item.totalDebt, currency)}`}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{item.period}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Financial Statement Table with YoY % change */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-200">
          <span className="capitalize">{statementType} Statement</span>
          <span className="text-[11px] text-slate-500">Values with YoY % Change</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/40 text-slate-400 border-b border-slate-800">
                <th className="py-2.5 px-3 font-medium">Metric</th>
                {statementType === 'income' &&
                  data.incomeStatement.map((col) => (
                    <th key={col.period} className="py-2.5 px-3 font-mono text-right font-medium">
                      {col.period}
                    </th>
                  ))}
                {statementType === 'balance' &&
                  data.balanceSheet.map((col) => (
                    <th key={col.period} className="py-2.5 px-3 font-mono text-right font-medium">
                      {col.period}
                    </th>
                  ))}
                {statementType === 'cashflow' &&
                  data.cashFlow.map((col) => (
                    <th key={col.period} className="py-2.5 px-3 font-mono text-right font-medium">
                      {col.period}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {statementType === 'income' && (
                <>
                  {renderTableRow('Total Revenue', data.incomeStatement, 'revenue', currency, true)}
                  {renderTableRow('Gross Profit', data.incomeStatement, 'grossProfit', currency)}
                  {renderTableRow('Operating Income', data.incomeStatement, 'operatingIncome', currency)}
                  {renderTableRow('EBITDA', data.incomeStatement, 'ebitda', currency)}
                  {renderTableRow('Net Income', data.incomeStatement, 'netIncome', currency, true)}
                  {renderTableRow('Diluted EPS', data.incomeStatement, 'eps', currency, false, true)}
                </>
              )}
              {statementType === 'balance' && (
                <>
                  {renderTableRow('Total Assets', data.balanceSheet, 'totalAssets', currency, true)}
                  {renderTableRow('Total Liabilities', data.balanceSheet, 'totalLiabilities', currency)}
                  {renderTableRow('Shareholders Equity', data.balanceSheet, 'equity', currency, true)}
                  {renderTableRow('Cash & Equivalents', data.balanceSheet, 'cash', currency)}
                  {renderTableRow('Total Debt', data.balanceSheet, 'totalDebt', currency)}
                </>
              )}
              {statementType === 'cashflow' && (
                <>
                  {renderTableRow('Operating Cash Flow', data.cashFlow, 'operatingCashFlow', currency, true)}
                  {renderTableRow('Capital Expenditures', data.cashFlow, 'capex', currency)}
                  {renderTableRow('Free Cash Flow (FCF)', data.cashFlow, 'freeCashFlow', currency, true)}
                  {renderTableRow('Dividends Paid', data.cashFlow, 'dividendsPaid', currency)}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Earnings Surprise & Dates */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-400" /> Quarterly Earnings History & Surprises
          </span>
          <span className="text-slate-400">
            Next Earnings: <strong className="text-slate-200">{data.earnings.nextDate}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {data.earnings.lastQuarters.map((q) => {
            const isBeat = q.surprisePercent >= 0;
            return (
              <div
                key={q.period}
                className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5 flex flex-col gap-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">{q.period}</span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded font-mono ${
                      isBeat ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {isBeat ? `+${q.surprisePercent}%` : `${q.surprisePercent}%`}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Actual: <span className="text-slate-200 font-bold">{q.actual}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Est: {q.estimate}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function renderTableRow(
  label: string,
  rows: any[],
  key: string,
  currency: string,
  isBold = false,
  isRawNumber = false
) {
  return (
    <tr className="hover:bg-slate-800/40 transition">
      <td className={`py-2 px-3 text-slate-300 ${isBold ? 'font-bold text-white' : ''}`}>
        {label}
      </td>
      {rows.map((row) => {
        const val = row[key];
        const yoy = row.yoy?.[key];
        return (
          <td key={row.period} className="py-2 px-3 text-right">
            <div className={`text-slate-100 ${isBold ? 'font-bold' : ''}`}>
              {isRawNumber ? val?.toFixed(2) : formatCompactNumber(val, currency)}
            </div>
            {yoy !== undefined && yoy !== null && (
              <div
                className={`text-[10px] ${
                  yoy >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
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

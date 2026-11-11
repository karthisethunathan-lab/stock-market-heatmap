import React, { useEffect, useState } from 'react';
import { FinancialStatements } from '../../types';
import { fetchFinancials } from '../../lib/api';
import { formatCompactNumber } from '../../lib/utils';
import { Calendar, TrendingUp, BarChart2, ShieldCheck, DollarSign, Activity } from 'lucide-react';

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
  const charts = data.charts || {
    revenueAndNetIncome: [],
    marginTrend: [],
    debtVsCash: [],
    freeCashFlow: [],
  };

  return (
    <div className="p-4 flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-160px)] scrollbar-thin">
      {/* Top Toggles & Period Metadata Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
        {/* Annual / Quarterly Toggle */}
        <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700/60 text-xs">
          <button
            onClick={() => setTimeframe('annual')}
            className={`px-3 py-1.5 rounded font-semibold transition ${
              timeframe === 'annual' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Annual Statements
          </button>
          <button
            onClick={() => setTimeframe('quarterly')}
            className={`px-3 py-1.5 rounded font-semibold transition ${
              timeframe === 'quarterly' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Quarterly Statements
          </button>
        </div>

        {/* Statement Selector */}
        <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700/60 text-xs">
          <button
            onClick={() => setStatementType('income')}
            className={`px-3 py-1.5 rounded font-semibold transition ${
              statementType === 'income' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Income Statement
          </button>
          <button
            onClick={() => setStatementType('balance')}
            className={`px-3 py-1.5 rounded font-semibold transition ${
              statementType === 'balance' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Balance Sheet
          </button>
          <button
            onClick={() => setStatementType('cashflow')}
            className={`px-3 py-1.5 rounded font-semibold transition ${
              statementType === 'cashflow' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cash Flow
          </button>
        </div>

        <div className="text-xs text-slate-300 flex items-center gap-2 font-mono">
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
            Currency: <strong className="text-white">{currency}</strong>
          </span>
          <span className="text-slate-400">({data.reportingUnit || (isIndia ? '₹ Crore' : 'USD Billions')})</span>
        </div>
      </div>

      {/* Visual Summary Trend Charts (4 Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chart 1: Revenue & Net Income Dual Bars */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
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
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Profit Margins Trend (%)
            </span>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Gross
              </span>
              <span className="flex items-center gap-1 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Operating
              </span>
              <span className="flex items-center gap-1 text-purple-400">
                <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" /> Net
              </span>
            </div>
          </div>
          {renderMarginLineChart(charts.marginTrend)}
        </div>

        {/* Chart 3: Cash vs Total Debt Dual Bars */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
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
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
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

      {/* Financial Statement Table with YoY % change */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-200">
          <span className="capitalize flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            {statementType} Statement ({timeframe === 'annual' ? 'Last 5 Years' : 'Last 8 Quarters'})
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            Reporting currency: <strong className="text-slate-200 font-mono">{currency}</strong> (Values with YoY % Change)
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 border-b border-slate-800">
                <th className="py-2.5 px-3 font-semibold text-slate-300 min-w-[180px]">Line Item</th>
                {statementType === 'income' &&
                  data.incomeStatement.map((col) => (
                    <th key={col.period} className="py-2.5 px-3 font-mono text-right font-semibold text-slate-300 min-w-[90px]">
                      {col.period}
                    </th>
                  ))}
                {statementType === 'balance' &&
                  data.balanceSheet.map((col) => (
                    <th key={col.period} className="py-2.5 px-3 font-mono text-right font-semibold text-slate-300 min-w-[90px]">
                      {col.period}
                    </th>
                  ))}
                {statementType === 'cashflow' &&
                  data.cashFlow.map((col) => (
                    <th key={col.period} className="py-2.5 px-3 font-mono text-right font-semibold text-slate-300 min-w-[90px]">
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
                data.balanceSheet.length > 0 ? (
                  <>
                    {renderTableRow('Total Assets', data.balanceSheet, 'totalAssets', currency, true)}
                    {renderTableRow('Total Liabilities', data.balanceSheet, 'totalLiabilities', currency)}
                    {renderTableRow('Shareholders Equity', data.balanceSheet, 'equity', currency, true)}
                    {renderTableRow('Cash & Equivalents', data.balanceSheet, 'cash', currency)}
                    {renderTableRow('Total Debt', data.balanceSheet, 'totalDebt', currency)}
                  </>
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 font-sans text-xs">
                      Detailed balance sheet table is not provided by the public feed for this ticker. See Cash vs Total Debt above and the Fundamentals tab.
                    </td>
                  </tr>
                )
              )}
              {statementType === 'cashflow' && (
                data.cashFlow.length > 0 ? (
                  <>
                    {renderTableRow('Operating Cash Flow', data.cashFlow, 'operatingCashFlow', currency, true)}
                    {renderTableRow('Capital Expenditures', data.cashFlow, 'capex', currency)}
                    {renderTableRow('Free Cash Flow (FCF)', data.cashFlow, 'freeCashFlow', currency, true)}
                    {renderTableRow('Dividends Paid', data.cashFlow, 'dividendsPaid', currency)}
                  </>
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 font-sans text-xs">
                      Detailed cash flow statement table is not provided by the public feed for this ticker. See Free Cash Flow (FCF) vs OCF above.
                    </td>
                  </tr>
                )
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
            Next Earnings Date: <strong className="text-white font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700 ml-1">{data.earnings?.nextDate || 'Upcoming'}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {(data.earnings?.lastQuarters || []).map((q) => {
            const isBeat = (q.surprisePercent || 0) >= 0;
            return (
              <div
                key={q.period}
                className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5 flex flex-col gap-1.5 text-xs hover:border-slate-600 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 font-mono">{q.period}</span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded font-mono ${
                      isBeat
                        ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-800/70'
                        : 'bg-rose-950/90 text-rose-400 border border-rose-800/70'
                    }`}
                  >
                    {isBeat ? `+${q.surprisePercent}%` : `${q.surprisePercent}%`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Actual:</span>
                  <span className="text-slate-100 font-bold">{q.actual !== undefined ? q.actual : '--'}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Estimate:</span>
                  <span>{q.estimate !== undefined ? q.estimate : '--'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
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
      <div className="h-32 flex items-center justify-center text-xs text-slate-500 font-mono">
        No historical chart data available
      </div>
    );
  }

  const width = 360;
  const height = 130;
  const paddingBottom = 22;
  const paddingTop = 12;
  const chartHeight = height - paddingBottom - paddingTop;

  const allVals = items.flatMap((x) => [Number(x[keyA]) || 0, Number(x[keyB]) || 0]);
  const maxVal = Math.max(...allVals, 1);

  const groupWidth = width / items.length;
  const barWidth = Math.min(14, (groupWidth - 8) / 2);

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible select-none">
      {/* Baseline */}
      <line
        x1="0"
        y1={height - paddingBottom}
        x2={width}
        y2={height - paddingBottom}
        stroke="#334155"
        strokeWidth="1"
      />

      {items.map((item, idx) => {
        const valA = Math.max(0, Number(item[keyA]) || 0);
        const valB = Math.max(0, Number(item[keyB]) || 0);

        const hA = Math.max(3, (valA / maxVal) * chartHeight);
        const hB = Math.max(3, (valB / maxVal) * chartHeight);

        const groupCenter = idx * groupWidth + groupWidth / 2;
        const xA = groupCenter - barWidth - 1;
        const xB = groupCenter + 1;
        const yA = height - paddingBottom - hA;
        const yB = height - paddingBottom - hB;

        return (
          <g key={item.period || idx}>
            {/* Bar A */}
            <rect
              x={xA}
              y={yA}
              width={barWidth}
              height={hA}
              fill={colorA}
              rx="2"
              className="hover:opacity-80 transition cursor-pointer"
            >
              <title>{`${item.period} - ${keyA}: ${formatCompactNumber(valA, currency)}`}</title>
            </rect>

            {/* Bar B */}
            <rect
              x={xB}
              y={yB}
              width={barWidth}
              height={hB}
              fill={colorB}
              rx="2"
              className="hover:opacity-80 transition cursor-pointer"
            >
              <title>{`${item.period} - ${keyB}: ${formatCompactNumber(valB, currency)}`}</title>
            </rect>

            {/* Period Label */}
            <text
              x={groupCenter}
              y={height - 6}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="9"
              fontFamily="monospace"
            >
              {item.period}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Render Margin Multi-Line SVG Chart with point dots and labels
 */
function renderMarginLineChart(items: any[] = []) {
  if (!items || items.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-xs text-slate-500 font-mono">
        No margin trend data available
      </div>
    );
  }

  const width = 360;
  const height = 130;
  const paddingBottom = 22;
  const paddingTop = 14;
  const chartHeight = height - paddingBottom - paddingTop;

  const minMargin = 0;
  const maxMargin = Math.max(...items.flatMap((x) => [x.grossMargin || 0, x.operatingMargin || 0, x.netMargin || 0]), 60);
  const range = maxMargin - minMargin || 1;

  const getX = (idx: number) => {
    if (items.length === 1) return width / 2;
    return 20 + (idx / (items.length - 1)) * (width - 40);
  };

  const getY = (val: number) => {
    return height - paddingBottom - ((val - minMargin) / range) * chartHeight;
  };

  const grossPath = items.map((it, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx).toFixed(1)} ${getY(it.grossMargin || 0).toFixed(1)}`).join(' ');
  const opPath = items.map((it, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx).toFixed(1)} ${getY(it.operatingMargin || 0).toFixed(1)}`).join(' ');
  const netPath = items.map((it, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx).toFixed(1)} ${getY(it.netMargin || 0).toFixed(1)}`).join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible select-none">
      {/* Grid Lines */}
      <line x1="10" y1={height - paddingBottom} x2={width - 10} y2={height - paddingBottom} stroke="#334155" strokeWidth="1" />
      <line x1="10" y1={getY(25)} x2={width - 10} y2={getY(25)} stroke="#1e293b" strokeDasharray="2 2" strokeWidth="1" />
      <line x1="10" y1={getY(50)} x2={width - 10} y2={getY(50)} stroke="#1e293b" strokeDasharray="2 2" strokeWidth="1" />

      {/* Paths */}
      <path d={grossPath} fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={opPath} fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={netPath} fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Points & Labels */}
      {items.map((it, idx) => {
        const x = getX(idx);
        const yGross = getY(it.grossMargin || 0);
        const yNet = getY(it.netMargin || 0);

        return (
          <g key={it.period || idx}>
            {/* Gross Dot */}
            <circle cx={x} cy={yGross} r="3" fill="#34d399">
              <title>{`${it.period} Gross Margin: ${(it.grossMargin || 0).toFixed(1)}%`}</title>
            </circle>

            {/* Net Dot */}
            <circle cx={x} cy={yNet} r="3" fill="#c084fc">
              <title>{`${it.period} Net Margin: ${(it.netMargin || 0).toFixed(1)}%`}</title>
            </circle>

            {/* Label below axis */}
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
  rows: any[] = [],
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
      {rows.map((row, idx) => {
        const val = row[key];
        const yoy = row.yoy?.[key];
        return (
          <td key={row.period || idx} className="py-2 px-3 text-right">
            <div className={`text-slate-100 ${isBold ? 'font-bold' : ''}`}>
              {isRawNumber ? (val !== undefined && val !== null ? val.toFixed(2) : '--') : formatCompactNumber(val, currency)}
            </div>
            {yoy !== undefined && yoy !== null && (
              <div
                className={`text-[10px] font-mono ${
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

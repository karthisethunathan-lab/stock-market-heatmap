import React, { useEffect, useState } from 'react';
import { StockFundamentals } from '../../types';
import { fetchFundamentals } from '../../lib/api';
import { formatCompactNumber, formatCurrency, formatPercent } from '../../lib/utils';
import {
  TrendingUp,
  ShieldCheck,
  DollarSign,
  PieChart,
  Activity,
  Layers,
  HelpCircle,
  Tag,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface FundamentalsTabProps {
  symbol: string;
}

export const FundamentalsTab: React.FC<FundamentalsTabProps> = ({ symbol }) => {
  const [data, setData] = useState<StockFundamentals | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetchFundamentals(symbol);
        if (isMounted) setData(res);
      } catch (err) {
        console.error('Failed to load fundamentals:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [symbol]);

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[350px] text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Loading comprehensive fundamentals...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-slate-400">
        No fundamental metrics available for {symbol}.
      </div>
    );
  }

  const isIndia = symbol.endsWith('.NS') || symbol.endsWith('.BO');
  const currency = data.currency;

  const MetricItem: React.FC<{
    label: string;
    value: React.ReactNode;
    tooltip?: string;
  }> = ({ label, value, tooltip }) => (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60 last:border-0 text-xs">
      <div className="flex items-center gap-1 text-slate-400">
        <span>{label}</span>
        {tooltip && (
          <span title={tooltip} className="cursor-help text-slate-600 hover:text-slate-400">
            <HelpCircle className="w-3 h-3" />
          </span>
        )}
      </div>
      <div className="font-mono font-medium text-slate-100">{value ?? 'N/A'}</div>
    </div>
  );

  return (
    <div className="p-4 flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-160px)] scrollbar-thin">
      {/* Quick Take Strip */}
      {data.quickTakes && data.quickTakes.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Tag className="w-3.5 h-3.5 text-blue-400" /> Quick Take Analysis
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {data.quickTakes.map((tag, idx) => {
              const isPos = tag.type === 'positive';
              const isWarn = tag.type === 'warning';
              return (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    isPos
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                      : isWarn
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                      : 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                  }`}
                >
                  {isPos && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  {isWarn && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                  {tag.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid of Grouped Fundamentals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Valuation Card */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 flex flex-col gap-2">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <PieChart className="w-4 h-4 text-blue-400" /> Valuation
          </h4>
          <div className="flex flex-col">
            <MetricItem
              label="Market Cap"
              value={formatCompactNumber(data.valuation.marketCap, currency)}
              tooltip="Total market value of all outstanding shares."
            />
            <MetricItem
              label="Enterprise Value (EV)"
              value={formatCompactNumber(data.valuation.enterpriseValue, currency)}
              tooltip="Market Cap + Total Debt - Cash & Equivalents."
            />
            <MetricItem
              label="P/E Ratio (TTM)"
              value={data.valuation.peRatioTTM?.toFixed(2)}
              tooltip="Price to Earnings ratio over trailing 12 months."
            />
            <MetricItem
              label="Forward P/E"
              value={data.valuation.forwardPE?.toFixed(2)}
              tooltip="Price divided by projected forward 12-month earnings."
            />
            <MetricItem
              label="PEG Ratio"
              value={data.valuation.pegRatio?.toFixed(2)}
              tooltip="P/E divided by growth rate. < 1.0 is traditionally undervalued."
            />
            <MetricItem
              label="Price / Book (P/B)"
              value={data.valuation.priceToBook?.toFixed(2)}
              tooltip="Market price per share compared to book value per share."
            />
            <MetricItem
              label="Price / Sales (P/S)"
              value={data.valuation.priceToSales?.toFixed(2)}
              tooltip="Market cap compared to total revenue."
            />
            <MetricItem
              label="EV / EBITDA"
              value={data.valuation.evToEbitda?.toFixed(2)}
              tooltip="Enterprise value divided by earnings before interest, tax, depreciation & amortization."
            />
            <MetricItem
              label="Earnings Yield"
              value={`${data.valuation.earningsYield?.toFixed(2)}%`}
              tooltip="Earnings per share divided by stock price (inverse of P/E)."
            />
          </div>
        </div>

        {/* Profitability Card */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 flex flex-col gap-2">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Profitability
          </h4>
          <div className="flex flex-col">
            <MetricItem
              label="Gross Margin"
              value={`${data.profitability.grossMargin?.toFixed(2)}%`}
              tooltip="Gross Profit divided by Total Revenue."
            />
            <MetricItem
              label="Operating Margin"
              value={`${data.profitability.operatingMargin?.toFixed(2)}%`}
              tooltip="Operating Income divided by Total Revenue."
            />
            <MetricItem
              label="Net Profit Margin"
              value={`${data.profitability.netMargin?.toFixed(2)}%`}
              tooltip="Net Income divided by Total Revenue."
            />
            <MetricItem
              label="Return on Equity (ROE)"
              value={`${data.profitability.roe?.toFixed(2)}%`}
              tooltip="Net income returned as a percentage of shareholders equity."
            />
            <MetricItem
              label="Return on Assets (ROA)"
              value={`${data.profitability.roa?.toFixed(2)}%`}
              tooltip="Net income returned as a percentage of total assets."
            />
            <MetricItem
              label="ROCE"
              value={`${data.profitability.roce?.toFixed(2)}%`}
              tooltip="Return on Capital Employed (operating profit / capital employed)."
            />
          </div>
        </div>

        {/* Growth Card */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 flex flex-col gap-2">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Activity className="w-4 h-4 text-purple-400" /> Growth & CAGR
          </h4>
          <div className="flex flex-col">
            <MetricItem
              label="Revenue Growth (YoY)"
              value={formatPercent(data.growth.revenueGrowthYoY)}
              tooltip="Year-over-year revenue expansion rate."
            />
            <MetricItem
              label="EPS Growth (YoY)"
              value={formatPercent(data.growth.epsGrowthYoY)}
              tooltip="Year-over-year earnings per share expansion."
            />
            <MetricItem
              label="3-Year Revenue CAGR"
              value={formatPercent(data.growth.revenue3YCagr)}
              tooltip="Compound annual growth rate of top-line revenue over 3 years."
            />
            <MetricItem
              label="5-Year Revenue CAGR"
              value={formatPercent(data.growth.revenue5YCagr)}
              tooltip="Compound annual growth rate of top-line revenue over 5 years."
            />
            <MetricItem
              label="3-Year EPS CAGR"
              value={formatPercent(data.growth.eps3YCagr)}
              tooltip="Compound annual growth rate of earnings per share over 3 years."
            />
          </div>
        </div>

        {/* Financial Health Card */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 flex flex-col gap-2">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-cyan-400" /> Financial Health
          </h4>
          <div className="flex flex-col">
            <MetricItem
              label="Debt / Equity"
              value={data.financialHealth.debtToEquity?.toFixed(2)}
              tooltip="Total Debt divided by Shareholders Equity. Lower is less leveraged."
            />
            <MetricItem
              label="Current Ratio"
              value={data.financialHealth.currentRatio?.toFixed(2)}
              tooltip="Current Assets / Current Liabilities. > 1.0 indicates short-term solvency."
            />
            <MetricItem
              label="Quick Ratio"
              value={data.financialHealth.quickRatio?.toFixed(2)}
              tooltip="(Cash + Receivables) / Current Liabilities (acid test)."
            />
            <MetricItem
              label="Interest Coverage"
              value={`${data.financialHealth.interestCoverage?.toFixed(1)}x`}
              tooltip="Operating Income / Interest Expense. Higher means easier debt servicing."
            />
            <MetricItem
              label="Total Debt"
              value={formatCompactNumber(data.financialHealth.totalDebt, currency)}
              tooltip="Total short and long-term interest-bearing debt."
            />
            <MetricItem
              label="Total Cash & Equiv."
              value={formatCompactNumber(data.financialHealth.totalCash, currency)}
              tooltip="Cash, bank balances, and liquid short-term investments."
            />
            <MetricItem
              label="Free Cash Flow (FCF)"
              value={formatCompactNumber(data.financialHealth.freeCashFlow, currency)}
              tooltip="Operating Cash Flow minus Capital Expenditures."
            />
          </div>
        </div>

        {/* Dividends Card */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 flex flex-col gap-2">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <DollarSign className="w-4 h-4 text-amber-400" /> Dividends
          </h4>
          <div className="flex flex-col">
            <MetricItem
              label="Dividend Yield"
              value={`${data.dividends.yield?.toFixed(2)}%`}
              tooltip="Annual dividend payment divided by current stock price."
            />
            <MetricItem
              label="Annual Dividend"
              value={formatCurrency(data.dividends.annualDividend, currency)}
              tooltip="Annualized cash payout per share."
            />
            <MetricItem
              label="Payout Ratio"
              value={`${data.dividends.payoutRatio?.toFixed(1)}%`}
              tooltip="Percentage of net earnings distributed as dividends."
            />
            <MetricItem
              label="Ex-Dividend Date"
              value={data.dividends.exDividendDate || 'N/A'}
              tooltip="Date on or after which newly bought shares are not eligible for the dividend."
            />
          </div>
        </div>

        {/* Per Share Card */}
        {data.perShare && (
          <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 flex flex-col gap-2">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Per Share Metrics
            </h4>
            <div className="flex flex-col">
              <MetricItem
                label="EPS (Diluted)"
                value={formatCurrency(data.perShare.eps, currency)}
                tooltip="Earnings per share attributed to each common share."
              />
              <MetricItem
                label="Book Value / Share"
                value={formatCurrency(data.perShare.bookValuePerShare, currency)}
                tooltip="Shareholder equity divided by common shares outstanding."
              />
              <MetricItem
                label="Revenue / Share"
                value={formatCurrency(data.perShare.revenuePerShare, currency)}
                tooltip="Total revenue divided by shares outstanding."
              />
              <MetricItem
                label="Cash / Share"
                value={formatCurrency(data.perShare.cashPerShare, currency)}
                tooltip="Total cash and equivalents divided by shares outstanding."
              />
            </div>
          </div>
        )}

        {/* Ownership Card */}
        {(() => {
          if (isIndia) {
            if (!data.ownership?.promoterHolding && !data.ownership?.institutionalHolding) {
              return null;
            }
            return (
              <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 flex flex-col gap-2">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <PieChart className="w-4 h-4 text-purple-400" /> Shareholding Pattern (India)
                </h4>
                <div className="flex flex-col">
                  {data.ownership.promoterHolding !== undefined && (
                    <MetricItem
                      label="Promoter Holding"
                      value={`${data.ownership.promoterHolding.toFixed(2)}%`}
                      tooltip="Percentage of equity held by company promoters."
                    />
                  )}
                  {data.ownership.institutionalHolding !== undefined && (
                    <MetricItem
                      label="Institutional Holding"
                      value={`${data.ownership.institutionalHolding.toFixed(2)}%`}
                      tooltip="Percentage held by mutual funds, FIIs, DIIs, and banks."
                    />
                  )}
                  {data.ownership.publicHolding !== undefined && (
                    <MetricItem
                      label="Public & Others"
                      value={`${data.ownership.publicHolding.toFixed(2)}%`}
                      tooltip="Percentage held by retail public and non-promoters."
                    />
                  )}
                  <MetricItem
                    label="Shares Outstanding"
                    value={formatCompactNumber(data.ownership.sharesOutstanding)}
                    tooltip="Total issued shares floating and restricted."
                  />
                </div>
              </div>
            );
          } else {
            return (
              <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 flex flex-col gap-2">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <PieChart className="w-4 h-4 text-purple-400" /> Ownership Structure
                </h4>
                <div className="flex flex-col">
                  <MetricItem
                    label="Insiders Holding"
                    value={data.ownership?.insidersPercent !== undefined ? `${data.ownership.insidersPercent.toFixed(2)}%` : 'N/A'}
                    tooltip="Percentage of shares owned by executives and board members."
                  />
                  <MetricItem
                    label="Institutions Holding"
                    value={data.ownership?.institutionsPercent !== undefined ? `${data.ownership.institutionsPercent.toFixed(2)}%` : 'N/A'}
                    tooltip="Percentage of shares owned by investment firms and pension funds."
                  />
                  <MetricItem
                    label="Float"
                    value={formatCompactNumber(data.ownership?.floatShares)}
                    tooltip="Number of shares freely traded by the public."
                  />
                  <MetricItem
                    label="Shares Outstanding"
                    value={formatCompactNumber(data.ownership?.sharesOutstanding)}
                    tooltip="Total equity shares issued."
                  />
                  {data.ownership?.shortInterest !== undefined && (
                    <MetricItem
                      label="Short Interest"
                      value={`${data.ownership.shortInterest.toFixed(2)}%`}
                      tooltip="Percentage of float shares sold short."
                    />
                  )}
                </div>
              </div>
            );
          }
        })()}

        {/* Trading & Moving Averages Card */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 flex flex-col gap-2">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-blue-400" /> Trading & Moving Averages
          </h4>
          <div className="flex flex-col">
            <MetricItem
              label="Beta (Volatility)"
              value={data.trading.beta?.toFixed(2)}
              tooltip="Measure of stock volatility relative to the broader market (1.0 = market)."
            />
            <MetricItem
              label="3-Month Avg Volume"
              value={formatCompactNumber(data.trading.avgVolume3M)}
              tooltip="Average daily shares traded over the last 90 days."
            />
            <MetricItem
              label="52-Week High"
              value={formatCurrency(data.trading.fiftyTwoWeekHigh, currency)}
              tooltip="Highest recorded traded price in the past 52 weeks."
            />
            <MetricItem
              label="52-Week Low"
              value={formatCurrency(data.trading.fiftyTwoWeekLow, currency)}
              tooltip="Lowest recorded traded price in the past 52 weeks."
            />
            <MetricItem
              label="50-Day Moving Avg"
              value={
                <span className="flex items-center gap-1">
                  {formatCurrency(data.trading.fiftyDayMA, currency)}
                  <span
                    className={`text-[10px] px-1 py-0.2 rounded font-semibold ${
                      data.trading.isAbove50MA
                        ? 'bg-emerald-950 text-emerald-400'
                        : 'bg-rose-950 text-rose-400'
                    }`}
                  >
                    {data.trading.isAbove50MA ? '▲ Above' : '▼ Below'}
                  </span>
                </span>
              }
              tooltip="Arithmetic average of closing prices over the preceding 50 trading days."
            />
            <MetricItem
              label="200-Day Moving Avg"
              value={
                <span className="flex items-center gap-1">
                  {formatCurrency(data.trading.twoHundredDayMA, currency)}
                  <span
                    className={`text-[10px] px-1 py-0.2 rounded font-semibold ${
                      data.trading.isAbove200MA
                        ? 'bg-emerald-950 text-emerald-400'
                        : 'bg-rose-950 text-rose-400'
                    }`}
                  >
                    {data.trading.isAbove200MA ? '▲ Above' : '▼ Below'}
                  </span>
                </span>
              }
              tooltip="Long-term trend benchmark indicator."
            />
          </div>
        </div>
      </div>

      {/* Attribution Footer */}
      <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800">
        <span>{data.source}</span>
        <span>Updated: {new Date(data.lastUpdated).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  ReferenceLine,
} from 'recharts';
import { HistoricalCandle, ChartTimeframe, ChartType, ColorMode } from '../../types';
import { formatCurrency, formatCompactNumber } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface StockChartProps {
  candles: HistoricalCandle[];
  currency: string;
  previousClose?: number;
  timeframe: ChartTimeframe;
  onTimeframeChange: (tf: ChartTimeframe) => void;
  chartType: ChartType;
  onChartTypeChange: (ct: ChartType) => void;
  loading: boolean;
  colorMode?: ColorMode;
}

export const StockChart: React.FC<StockChartProps> = ({
  candles,
  currency,
  previousClose,
  timeframe,
  onTimeframeChange,
  chartType,
  onChartTypeChange,
  loading,
  colorMode = 'standard',
}) => {
  const timeframes: ChartTimeframe[] = ['1D', '1W', '1M', '6M', '1Y', '5Y'];

  const firstCandle = candles[0];
  const lastCandle = candles[candles.length - 1];
  const baseline = previousClose || firstCandle?.close || 0;
  const isPositive = (lastCandle?.close || 0) >= baseline;

  // Colors
  const strokeColor = colorMode === 'colorblind'
    ? isPositive ? '#3b82f6' : '#f97316'
    : isPositive ? '#10b981' : '#ef4444';

  const minPrice = candles.length > 0 ? Math.min(...candles.map((c) => c.low)) : 0;
  const maxPrice = candles.length > 0 ? Math.max(...candles.map((c) => c.high)) : 100;
  const padding = (maxPrice - minPrice) * 0.08 || 1;

  // Custom Candlestick formatting helper for Bar chart
  const candleChartData = candles.map((c) => ({
    ...c,
    candleBottom: Math.min(c.open, c.close),
    candleBody: Math.abs(c.close - c.open) || 0.05,
    isUp: c.close >= c.open,
  }));

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
      
      {/* Header toolbar: Timeframe buttons & Chart type toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                timeframe === tf
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-medium">
          <button
            onClick={() => onChartTypeChange('area')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              chartType === 'area'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Line / Area
          </button>
          <button
            onClick={() => onChartTypeChange('candle')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              chartType === 'candle'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Candlestick
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative w-full h-72">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs rounded-lg">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          </div>
        )}

        {candles.length === 0 && !loading ? (
          <div className="w-full h-full flex items-center justify-center text-sm text-slate-500 font-mono">
            No chart data available for this range
          </div>
        ) : chartType === 'area' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={candles} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis
                domain={[minPrice - padding, maxPrice + padding]}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatCompactNumber(val, currency)}
                orientation="right"
              />
              {baseline > 0 && (
                <ReferenceLine
                  y={baseline}
                  stroke="#475569"
                  strokeDasharray="3 3"
                  strokeOpacity={0.7}
                />
              )}
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as HistoricalCandle;
                    return (
                      <div className="bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 shadow-xl text-xs font-mono text-white">
                        <div className="text-slate-400 text-[10px] mb-1">{data.date ? new Date(data.date).toLocaleString() : data.label}</div>
                        <div className="text-sm font-bold text-emerald-400">
                          {formatCurrency(data.close, currency)}
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-1 text-[11px] text-slate-300">
                          <div>O: {formatCurrency(data.open, currency)}</div>
                          <div>H: {formatCurrency(data.high, currency)}</div>
                          <div>L: {formatCurrency(data.low, currency)}</div>
                          <div>Vol: {formatCompactNumber(data.volume)}</div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={strokeColor}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#chartGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={candleChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <XAxis
                dataKey="label"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis
                domain={[minPrice - padding, maxPrice + padding]}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatCompactNumber(val, currency)}
                orientation="right"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as HistoricalCandle & { isUp: boolean };
                    return (
                      <div className="bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 shadow-xl text-xs font-mono text-white">
                        <div className="text-slate-400 text-[10px] mb-1">{new Date(data.date).toLocaleDateString()}</div>
                        <div className={`text-sm font-bold ${data.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                          Close: {formatCurrency(data.close, currency)}
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-1 text-[11px] text-slate-300">
                          <div>Open: {formatCurrency(data.open, currency)}</div>
                          <div>High: {formatCurrency(data.high, currency)}</div>
                          <div>Low: {formatCurrency(data.low, currency)}</div>
                          <div>Vol: {formatCompactNumber(data.volume)}</div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="close"
                fill={strokeColor}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

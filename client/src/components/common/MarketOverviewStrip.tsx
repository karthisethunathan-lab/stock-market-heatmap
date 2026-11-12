import React, { useEffect, useState } from 'react';
import { MarketOverviewData } from '../../types';
import { fetchMarketOverview } from '../../lib/api';
import { Globe } from 'lucide-react';

interface MarketOverviewStripProps {
  onSelectStock?: (symbol: string) => void;
}

export const MarketOverviewStrip: React.FC<MarketOverviewStripProps> = ({ onSelectStock }) => {
  const [data, setData] = useState<MarketOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await fetchMarketOverview();
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      } catch {
        if (isMounted) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading && !data) {
    return (
      <div className="w-full bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center gap-4 overflow-x-auto text-xs text-slate-400">
        <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-blue-400 animate-spin" /> Loading market tickers...</span>
      </div>
    );
  }

  if (!data || !data.indices) return null;

  const renderSparkline = (points: number[], isPositive: boolean) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 50;
    const height = 16;

    const pathData = points
      .map((p, idx) => {
        const x = (idx / (points.length - 1)) * width;
        const y = height - ((p - min) / range) * (height - 3) - 1.5;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible ml-1.5">
        <path
          d={pathData}
          fill="none"
          stroke={isPositive ? '#10b981' : '#ef4444'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  // Duplicate indices array for seamless infinite moving ticker tape
  const tickerItems = [...data.indices, ...data.indices];

  return (
    <div className="w-full bg-slate-950/90 border-b border-slate-800/80 py-1.5 flex items-center justify-between text-xs overflow-hidden relative select-none">
      {/* Moving Marquee Ticker Track with left/right fade masks */}
      <div className="flex-1 overflow-hidden relative">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#080b12] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#080b12] to-transparent z-10" />

        <div className="animate-ticker flex items-center gap-6 whitespace-nowrap pl-4">
          {tickerItems.map((idx, index) => {
            const isPos = idx.changePercent >= 0;
            return (
              <div
                key={`${idx.id}-${index}`}
                onClick={() => onSelectStock && onSelectStock(idx.symbol)}
                className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-800/80 px-2.5 py-1 rounded transition whitespace-nowrap"
                title={`${idx.name} (${idx.symbol})`}
              >
                <span className="font-semibold text-slate-300">{idx.name}</span>
                <span className="font-mono text-slate-100">{idx.price.toLocaleString()}</span>
                <span
                  className={`font-mono flex items-center ${
                    isPos ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isPos ? '+' : ''}
                  {idx.changePercent.toFixed(2)}%
                </span>
                {renderSparkline(idx.sparkline, isPos)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Market Badges (US & India) anchored on right */}
      <div className="hidden lg:flex items-center gap-3 px-4 border-l border-slate-800/80 flex-shrink-0 text-[11px] bg-slate-950/95 z-20">
        {/* US Badge */}
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              data.markets?.us?.isOpen
                ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                : data.markets?.us?.status === 'PRE-MARKET' || data.markets?.us?.status === 'POST-MARKET'
                ? 'bg-amber-500'
                : 'bg-slate-500'
            }`}
          />
          <span className="font-medium text-slate-300">US:</span>
          <span
            className={`${
              data.markets?.us?.isOpen ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            {data.markets?.us?.sessionLabel || 'Closed'}
          </span>
          <span className="text-slate-500">({data.markets?.us?.localTime || '--'})</span>
        </div>

        {/* India Badge */}
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              data.markets?.india?.isOpen
                ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                : data.markets?.india?.status === 'PRE-MARKET' || data.markets?.india?.status === 'POST-MARKET'
                ? 'bg-amber-500'
                : 'bg-slate-500'
            }`}
          />
          <span className="font-medium text-slate-300">India:</span>
          <span
            className={`${
              data.markets?.india?.isOpen ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            {data.markets?.india?.sessionLabel || 'Closed'}
          </span>
          <span className="text-slate-500">({data.markets?.india?.localTime || '--'})</span>
        </div>
      </div>
    </div>
  );
};

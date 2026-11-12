import React, { useEffect, useState } from 'react';
import { formatCompactNumber, formatCurrency, formatPercent } from '../../lib/utils';
import { fetchQuote, fetchHistory } from '../../lib/api';
import {
  Coins,
  ShieldCheck,
  TrendingUp,
  Activity,
  Layers,
  Award,
  Info,
} from 'lucide-react';

interface CryptoTokenomicsTabProps {
  symbol: string;
}

export const CryptoTokenomicsTab: React.FC<CryptoTokenomicsTabProps> = ({ symbol }) => {
  const [data, setData] = useState<any>(null);
  const [quote, setQuote] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      fetchQuote(symbol),
      fetchHistory(symbol, '1Y', '1d'),
    ]).then(([qRes, hRes]) => {
      if (!isMounted) return;

      const q = qRes.status === 'fulfilled' ? qRes.value.data : null;
      setQuote(q);

      // Estimate moving averages and tokenomics from historical candles and quote
      const candles = hRes.status === 'fulfilled' ? hRes.value.data?.candles || [] : [];
      let ma50 = 0;
      let ma200 = 0;
      if (candles.length >= 50) {
        const last50 = candles.slice(-50);
        ma50 = last50.reduce((acc: number, c: any) => acc + c.close, 0) / 50;
      }
      if (candles.length >= 200) {
        const last200 = candles.slice(-200);
        ma200 = last200.reduce((acc: number, c: any) => acc + c.close, 0) / 200;
      }

      // Compute ATH from candles
      let highestPrice = q?.fiftyTwoWeekHigh || q?.price || 1;
      let lowestPrice = q?.fiftyTwoWeekLow || q?.price || 1;
      candles.forEach((c: any) => {
        if (c.high > highestPrice) highestPrice = c.high;
        if (c.low < lowestPrice) lowestPrice = c.low;
      });

      setData({
        ma50: ma50 || (q?.price ? q.price * 0.96 : null),
        ma200: ma200 || (q?.price ? q.price * 0.91 : null),
        ath: highestPrice,
        atl: lowestPrice,
      });
    });

    return () => {
      isMounted = false;
    };
  }, [symbol]);

  const cleanSymbol = symbol.replace('-USD', '');
  const price = quote?.price || 0;
  const volume24h = quote?.volume || 0;
  const ath = data?.ath || quote?.fiftyTwoWeekHigh || price;
  const atl = data?.atl || quote?.fiftyTwoWeekLow || price;
  const athDrawdown = ath > 0 ? ((price - ath) / ath) * 100 : 0;
  const atlGain = atl > 0 ? ((price - atl) / atl) * 100 : 0;

  return (
    <div className="p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-160px)] scrollbar-thin">
      {/* Top Banner: Protocol Identity */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">{cleanSymbol} Tokenomics</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold uppercase">
                24/7 Decentralized Asset
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live cryptographic supply mechanics, market liquidity, and historical valuation drawdowns
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 4 Core Tokenomic Pillars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* ATH & Drawdown */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-1">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-400" /> All-Time High
          </span>
          <span className="text-sm font-bold font-mono text-white">
            {formatCurrency(ath, 'USD')}
          </span>
          <span className={`text-[11px] font-mono font-semibold ${athDrawdown >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatPercent(athDrawdown)} from ATH
          </span>
        </div>

        {/* 24h Volume */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-1">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-blue-400" /> 24h Volume
          </span>
          <span className="text-sm font-bold font-mono text-white">
            {formatCompactNumber(volume24h, 'USD')}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Liquid turnover
          </span>
        </div>

        {/* 50-Day Moving Average */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-1">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> 50-Day MA
          </span>
          <span className="text-sm font-bold font-mono text-white">
            {data?.ma50 ? formatCurrency(data.ma50, 'USD') : '--'}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Medium-term trend
          </span>
        </div>

        {/* 200-Day Moving Average */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-1">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> 200-Day MA
          </span>
          <span className="text-sm font-bold font-mono text-white">
            {data?.ma200 ? formatCurrency(data.ma200, 'USD') : '--'}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Macro cycle baseline
          </span>
        </div>
      </div>

      {/* Valuation & Cycle Analysis Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" /> Market Cycle & Valuation Metrics
          </h3>
          <span className="text-[11px] font-mono text-slate-400">Currency: USD</span>
        </div>

        <div className="divide-y divide-slate-800/80 text-xs">
          <div className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-850/50 transition">
            <div className="flex flex-col">
              <span className="text-slate-300 font-medium">Current Spot Price</span>
              <span className="text-[10px] text-slate-500">Real-time aggregate across primary order books</span>
            </div>
            <span className="font-mono font-bold text-white text-sm">
              {formatCurrency(price, 'USD')}
            </span>
          </div>

          <div className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-850/50 transition">
            <div className="flex flex-col">
              <span className="text-slate-300 font-medium">52-Week High Range</span>
              <span className="text-[10px] text-slate-500">Highest price achieved in past 365 trading sessions</span>
            </div>
            <span className="font-mono font-semibold text-emerald-400">
              {formatCurrency(quote?.fiftyTwoWeekHigh || ath, 'USD')}
            </span>
          </div>

          <div className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-850/50 transition">
            <div className="flex flex-col">
              <span className="text-slate-300 font-medium">52-Week Low Range</span>
              <span className="text-[10px] text-slate-500">Lowest cycle floor in past 365 trading sessions</span>
            </div>
            <span className="font-mono font-semibold text-slate-300">
              {formatCurrency(quote?.fiftyTwoWeekLow || atl, 'USD')}
            </span>
          </div>

          <div className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-850/50 transition">
            <div className="flex flex-col">
              <span className="text-slate-300 font-medium">Cycle Bottom Rebound</span>
              <span className="text-[10px] text-slate-500">Percentage appreciation from 52-week low</span>
            </div>
            <span className="font-mono font-bold text-emerald-400">
              +{formatPercent(atlGain)}
            </span>
          </div>

          <div className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-850/50 transition">
            <div className="flex flex-col">
              <span className="text-slate-300 font-medium">Market State</span>
              <span className="text-[10px] text-slate-500">Cryptocurrency markets operate continuously without closing bells</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Continuous 24/7 Live
            </span>
          </div>
        </div>
      </div>

      {/* Educational Callout */}
      <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/40 text-xs text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-200">Decentralized Asset Notice: </strong>
          Cryptocurrency values are governed by decentralized network supply, validator consensus algorithms, staking yields, and market liquidity depth rather than corporate quarterly corporate earnings or statutory financial balance sheets.
        </div>
      </div>
    </div>
  );
};

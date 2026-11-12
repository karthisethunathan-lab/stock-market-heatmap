import React, { useEffect, useState } from 'react';
import { fetchQuote, fetchHistory } from '../../lib/api';
import {
  Calculator,
  TrendingUp,
  ShieldCheck,
  Layers,
  Info,
  Globe,
} from 'lucide-react';

interface ForexMechanicsTabProps {
  symbol: string;
}

export const ForexMechanicsTab: React.FC<ForexMechanicsTabProps> = ({ symbol }) => {
  const [quote, setQuote] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [convertAmount, setConvertAmount] = useState<string>('1000');
  const [pipAmount, setPipAmount] = useState<string>('10');

  // Extract base and quote currency e.g. EURUSD=X -> EUR and USD
  const clean = symbol.replace('=X', '').toUpperCase();
  const baseCurrency = clean.slice(0, 3);
  const quoteCurrency = clean.slice(3, 6) || 'USD';

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      fetchQuote(symbol),
      fetchHistory(symbol, '1Y', '1d'),
    ]).then(([qRes, hRes]) => {
      if (!isMounted) return;

      const q = qRes.status === 'fulfilled' ? qRes.value.data : null;
      setQuote(q);

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

      setData({
        ma50: ma50 || (q?.price ? q.price * 0.995 : null),
        ma200: ma200 || (q?.price ? q.price * 0.985 : null),
      });
    });

    return () => {
      isMounted = false;
    };
  }, [symbol]);

  const rate = quote?.price || 1.0;
  const isJPY = quoteCurrency === 'JPY';
  const pipSize = isJPY ? 0.01 : 0.0001;

  // Calculate live conversion
  const parsedAmount = parseFloat(convertAmount) || 0;
  const convertedTotal = (parsedAmount * rate).toFixed(isJPY ? 2 : 4);

  // Calculate pip movement value
  const parsedPips = parseFloat(pipAmount) || 0;
  const pipImpact = (parsedPips * pipSize * parsedAmount).toFixed(2);

  // Spread calculation (simulated interbank standard 0.8 - 1.5 pips)
  const spreadPips = 1.2;
  const bidPrice = (rate - (spreadPips * pipSize) / 2).toFixed(isJPY ? 2 : 4);
  const askPrice = (rate + (spreadPips * pipSize) / 2).toFixed(isJPY ? 2 : 4);

  return (
    <div className="p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-160px)] scrollbar-thin">
      {/* Top Banner: Currency Pair Identity */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 rounded-xl p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                {baseCurrency} / {quoteCurrency} Currency Mechanics
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold uppercase">
                Interbank Forex
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Base ({baseCurrency}) priced in terms of Counter/Quote currency ({quoteCurrency})
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Tool: Live Currency Converter & Pip Calculator */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-cyan-400" /> Live Currency & Pip Movement Calculator
          </h3>
          <span className="text-[11px] font-mono text-cyan-400">
            1 {baseCurrency} = {rate.toFixed(isJPY ? 2 : 4)} {quoteCurrency}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Currency Converter */}
          <div className="flex flex-col gap-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <label className="text-[11px] text-slate-400 font-medium">
              Amount to Convert ({baseCurrency})
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={convertAmount}
                onChange={(e) => setConvertAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:ring-1 focus:ring-cyan-500 outline-none"
                placeholder="1000"
              />
              <span className="text-xs font-mono font-bold text-slate-300 px-2">
                {baseCurrency}
              </span>
            </div>

            <div className="mt-1 flex items-center justify-between text-xs bg-slate-900/80 p-2 rounded border border-slate-800/80">
              <span className="text-slate-400">Yields:</span>
              <span className="font-mono font-bold text-cyan-400 text-sm">
                {convertedTotal} {quoteCurrency}
              </span>
            </div>
          </div>

          {/* Pip Value & Impact */}
          <div className="flex flex-col gap-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <label className="text-[11px] text-slate-400 font-medium">
              Pip Price Movement Impact
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={pipAmount}
                onChange={(e) => setPipAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:ring-1 focus:ring-cyan-500 outline-none"
                placeholder="10"
              />
              <span className="text-xs font-mono font-bold text-slate-300 px-2 whitespace-nowrap">
                Pips (±)
              </span>
            </div>

            <div className="mt-1 flex items-center justify-between text-xs bg-slate-900/80 p-2 rounded border border-slate-800/80">
              <span className="text-slate-400">Total Value Impact:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                ±{pipImpact} {quoteCurrency}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 4 Core Forex Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Bid Price */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-1">
          <span className="text-[11px] text-slate-400 font-medium">Interbank Bid</span>
          <span className="text-sm font-bold font-mono text-white">{bidPrice}</span>
          <span className="text-[10px] text-slate-500">Sell rate</span>
        </div>

        {/* Ask Price */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-1">
          <span className="text-[11px] text-slate-400 font-medium">Interbank Ask</span>
          <span className="text-sm font-bold font-mono text-white">{askPrice}</span>
          <span className="text-[10px] text-slate-500">Buy rate</span>
        </div>

        {/* 50-Day Moving Average */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-1">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> 50-Day MA
          </span>
          <span className="text-sm font-bold font-mono text-white">
            {data?.ma50 ? data.ma50.toFixed(isJPY ? 2 : 4) : '--'}
          </span>
          <span className="text-[10px] text-slate-500">Medium trend</span>
        </div>

        {/* 200-Day Moving Average */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-1">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> 200-Day MA
          </span>
          <span className="text-sm font-bold font-mono text-white">
            {data?.ma200 ? data.ma200.toFixed(isJPY ? 2 : 4) : '--'}
          </span>
          <span className="text-[10px] text-slate-500">Macro trend</span>
        </div>
      </div>

      {/* Currency Mechanics Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" /> Currency Specifications & Trading Windows
          </h3>
          <span className="text-[11px] font-mono text-slate-400">Asset Class: FX</span>
        </div>

        <div className="divide-y divide-slate-800/80 text-xs">
          <div className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-850/50 transition">
            <span className="text-slate-300 font-medium">Standard Pip Size</span>
            <span className="font-mono font-bold text-white">{pipSize} ({isJPY ? '2 Decimals' : '4 Decimals'})</span>
          </div>

          <div className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-850/50 transition">
            <span className="text-slate-300 font-medium">Day Range</span>
            <span className="font-mono text-slate-200">
              {quote?.dayLow?.toFixed(isJPY ? 2 : 4) || '--'} — {quote?.dayHigh?.toFixed(isJPY ? 2 : 4) || '--'}
            </span>
          </div>

          <div className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-850/50 transition">
            <span className="text-slate-300 font-medium">52-Week Range</span>
            <span className="font-mono text-slate-200">
              {quote?.fiftyTwoWeekLow?.toFixed(isJPY ? 2 : 4) || '--'} — {quote?.fiftyTwoWeekHigh?.toFixed(isJPY ? 2 : 4) || '--'}
            </span>
          </div>

          <div className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-850/50 transition">
            <span className="text-slate-300 font-medium">Market Trading Hours</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" /> Global 24/5 (Sun 5PM – Fri 5PM ET)
            </span>
          </div>
        </div>
      </div>

      {/* Educational Callout */}
      <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/40 text-xs text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-200">Foreign Exchange Notice: </strong>
          Currency pairs measure the exchange ratio between sovereign nation currencies. They fluctuate according to central bank policy interest rate differentials, inflation, trade balances, and geopolitical capital flows rather than corporate equity statements.
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { RecommendationTrend } from '../../types';

interface AnalystBarProps {
  recommendation?: RecommendationTrend | null;
}

export const AnalystBar: React.FC<AnalystBarProps> = ({ recommendation }) => {
  if (!recommendation) return null;

  const rec = recommendation;
  const total = (rec.strongBuy || 0) + (rec.buy || 0) + (rec.hold || 0) + (rec.sell || 0) + (rec.strongSell || 0);
  if (total === 0) return null;
  const buyTotal = (rec.strongBuy || 0) + (rec.buy || 0);
  const buyPercent = Math.round((buyTotal / total) * 100);

  const pStrongBuy = ((rec.strongBuy || 0) / total) * 100;
  const pBuy = ((rec.buy || 0) / total) * 100;
  const pHold = ((rec.hold || 0) / total) * 100;
  const pSell = (((rec.sell || 0) + (rec.strongSell || 0)) / total) * 100;

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Analyst Consensus
        </h4>
        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          {buyPercent >= 70 ? 'Strong Buy' : buyPercent >= 50 ? 'Moderate Buy' : 'Hold'} ({buyPercent}% Positive)
        </span>
      </div>

      {/* Multi-segmented color bar */}
      <div className="w-full h-3 bg-slate-950 rounded-full flex overflow-hidden">
        <div style={{ width: `${pStrongBuy}%` }} className="bg-emerald-500 h-full" title={`Strong Buy: ${rec.strongBuy}`} />
        <div style={{ width: `${pBuy}%` }} className="bg-teal-400 h-full" title={`Buy: ${rec.buy}`} />
        <div style={{ width: `${pHold}%` }} className="bg-amber-400 h-full" title={`Hold: ${rec.hold}`} />
        <div style={{ width: `${pSell}%` }} className="bg-rose-500 h-full" title={`Sell: ${(rec.sell || 0) + (rec.strongSell || 0)}`} />
      </div>

      {/* Legend & Counts */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
        <div className="p-1.5 rounded bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] text-emerald-400 block font-semibold">Strong Buy</span>
          <span className="font-bold text-white">{rec.strongBuy || 0}</span>
        </div>
        <div className="p-1.5 rounded bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] text-teal-400 block font-semibold">Buy</span>
          <span className="font-bold text-white">{rec.buy || 0}</span>
        </div>
        <div className="p-1.5 rounded bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] text-amber-400 block font-semibold">Hold</span>
          <span className="font-bold text-white">{rec.hold || 0}</span>
        </div>
        <div className="p-1.5 rounded bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] text-rose-400 block font-semibold">Sell</span>
          <span className="font-bold text-white">{(rec.sell || 0) + (rec.strongSell || 0)}</span>
        </div>
      </div>
    </div>
  );
};

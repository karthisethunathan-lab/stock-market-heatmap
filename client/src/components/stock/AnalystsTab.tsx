import React, { useEffect, useState } from 'react';
import { fetchAnalysts } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { Target, Award } from 'lucide-react';

interface AnalystsTabProps {
  symbol: string;
}

export const AnalystsTab: React.FC<AnalystsTabProps> = ({ symbol }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetchAnalysts(symbol);
        if (isMounted) setData(res);
      } catch (err) {
        console.error(err);
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
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px] text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Loading analyst recommendations and price targets...</p>
      </div>
    );
  }

  if (!data) return <div className="p-6 text-center text-slate-400">No analyst estimates available.</div>;

  const rec = data.recommendation;
  const totalRecs = rec
    ? (rec.strongBuy || 0) + (rec.buy || 0) + (rec.hold || 0) + (rec.sell || 0) + (rec.strongSell || 0)
    : 0;
  const target = data.priceTarget;

  if (!rec && !target) {
    return (
      <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
        <Target className="w-8 h-8 text-slate-600 mb-1" />
        <p className="text-sm font-medium text-slate-300">No Analyst Coverage Available</p>
        <p className="text-xs text-slate-500">Wall Street consensus and 12-month price targets are not tracked for this symbol.</p>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-160px)] scrollbar-thin">
      {/* Price Target Range Card */}
      {target && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Target className="w-4 h-4 text-blue-400" /> 12-Month Analyst Price Targets
            </h4>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                target.upsideMean >= 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}
            >
              {target.upsideMean >= 0 ? `+${target.upsideMean}%` : `${target.upsideMean}%`} Implied Upside
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center py-2 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Current</div>
              <div className="font-mono text-sm font-bold text-white">{formatCurrency(target.current)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Low</div>
              <div className="font-mono text-sm font-bold text-rose-400">{formatCurrency(target.low)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Average (Mean)</div>
              <div className="font-mono text-sm font-bold text-blue-400">{formatCurrency(target.mean)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">High</div>
              <div className="font-mono text-sm font-bold text-emerald-400">{formatCurrency(target.high)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Stacked Recommendation Trend Bar */}
      {rec && totalRecs > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-400" /> Wall Street Consensus Breakdown ({totalRecs} Analysts)
          </h4>

          {/* Stacked Bar */}
          <div className="h-5 rounded-lg overflow-hidden flex items-center w-full">
            <div
              style={{ width: `${(rec.strongBuy / totalRecs) * 100}%` }}
              className="h-full bg-emerald-600 hover:brightness-110 transition"
              title={`Strong Buy: ${rec.strongBuy}`}
            />
            <div
              style={{ width: `${(rec.buy / totalRecs) * 100}%` }}
              className="h-full bg-emerald-400 hover:brightness-110 transition"
              title={`Buy: ${rec.buy}`}
            />
            <div
              style={{ width: `${(rec.hold / totalRecs) * 100}%` }}
              className="h-full bg-amber-400 hover:brightness-110 transition"
              title={`Hold: ${rec.hold}`}
            />
            <div
              style={{ width: `${(rec.sell / totalRecs) * 100}%` }}
              className="h-full bg-rose-400 hover:brightness-110 transition"
              title={`Sell: ${rec.sell}`}
            />
            <div
              style={{ width: `${(rec.strongSell / totalRecs) * 100}%` }}
              className="h-full bg-rose-600 hover:brightness-110 transition"
              title={`Strong Sell: ${rec.strongSell}`}
            />
          </div>

          {/* Legend */}
          <div className="grid grid-cols-5 gap-2 text-center text-xs pt-1">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-emerald-400 font-semibold">Strong Buy</span>
              <span className="font-mono text-white font-bold">{rec.strongBuy}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-emerald-300 font-semibold">Buy</span>
              <span className="font-mono text-white font-bold">{rec.buy}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-amber-400 font-semibold">Hold</span>
              <span className="font-mono text-white font-bold">{rec.hold}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-rose-300 font-semibold">Sell</span>
              <span className="font-mono text-white font-bold">{rec.sell}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-rose-500 font-semibold">Strong Sell</span>
              <span className="font-mono text-white font-bold">{rec.strongSell}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

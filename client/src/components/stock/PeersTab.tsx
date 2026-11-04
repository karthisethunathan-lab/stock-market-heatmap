import React, { useEffect, useState } from 'react';
import { fetchPeers } from '../../lib/api';
import { formatCompactNumber, formatCurrency, formatPercent } from '../../lib/utils';
import { Users, ArrowRight } from 'lucide-react';

interface PeersTabProps {
  symbol: string;
  onSelectStock: (symbol: string) => void;
}

export const PeersTab: React.FC<PeersTabProps> = ({ symbol, onSelectStock }) => {
  const [peers, setPeers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetchPeers(symbol);
        if (isMounted) setPeers(res || []);
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
        <p className="text-sm">Finding comparable sector peers...</p>
      </div>
    );
  }

  if (peers.length === 0) {
    return <div className="p-6 text-center text-slate-400">No peers found in this sector.</div>;
  }

  const isIndia = symbol.endsWith('.NS') || symbol.endsWith('.BO');
  const currency = isIndia ? 'INR' : 'USD';

  return (
    <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-160px)] scrollbar-thin">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-blue-400" /> Sector Peers & Competitors
        </span>
        <span>Click any stock to inspect</span>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-800/40 text-slate-400 border-b border-slate-800">
              <th className="py-2.5 px-3">Symbol</th>
              <th className="py-2.5 px-3">Company</th>
              <th className="py-2.5 px-3 text-right">Price</th>
              <th className="py-2.5 px-3 text-right">1D %</th>
              <th className="py-2.5 px-3 text-right">Market Cap</th>
              <th className="py-2.5 px-3 text-right">P/E</th>
              <th className="py-2.5 px-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {peers.map((p) => {
              const isPos = p.changePercent >= 0;
              return (
                <tr
                  key={p.symbol}
                  onClick={() => onSelectStock(p.symbol)}
                  className="hover:bg-slate-800/50 cursor-pointer transition"
                >
                  <td className="py-2.5 px-3 font-bold text-blue-400">{p.symbol}</td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans truncate max-w-[120px]">
                    {p.name}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-100 font-medium">
                    {formatCurrency(p.price, currency)}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-semibold ${
                      isPos ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatPercent(p.changePercent)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400">
                    {formatCompactNumber(p.marketCap, currency)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">
                    {p.pe ? p.pe.toFixed(1) : 'N/A'}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span className="p-1 rounded bg-slate-800 text-slate-400 group-hover:text-white">
                      <ArrowRight className="w-3 h-3 inline" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

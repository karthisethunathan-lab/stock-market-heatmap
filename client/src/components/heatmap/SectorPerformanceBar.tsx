import React from 'react';
import { SectorGroup } from '../../types';
import { BarChart3 } from 'lucide-react';

interface SectorPerformanceBarProps {
  sectors: SectorGroup[];
  onSelectSector?: (sectorName: string) => void;
  selectedSector?: string;
}

export const SectorPerformanceBar: React.FC<SectorPerformanceBarProps> = ({
  sectors,
  onSelectSector,
  selectedSector,
}) => {
  if (!sectors || sectors.length === 0) return null;

  // Calculate average % change for each sector
  const performance = sectors
    .map((sec) => {
      const validStocks = sec.stocks.filter((s) => s.changePercent !== undefined && s.changePercent !== null);
      const totalChange = validStocks.reduce((sum, s) => sum + s.changePercent, 0);
      const avgChange = validStocks.length > 0 ? totalChange / validStocks.length : 0;
      return {
        name: sec.name,
        avgChange: Number(avgChange.toFixed(2)),
        stocksCount: sec.stocks.length,
      };
    })
    .sort((a, b) => b.avgChange - a.avgChange);

  const maxAbs = Math.max(0.1, ...performance.map((p) => Math.abs(p.avgChange)));

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2.5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-blue-400" /> Sector Performance
        </h3>
        <span className="text-[10px] text-slate-500">Avg % Move</span>
      </div>

      <div className="flex flex-col gap-1.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
        {performance.map((sec) => {
          const isPos = sec.avgChange >= 0;
          const barWidthPercent = Math.min(100, (Math.abs(sec.avgChange) / maxAbs) * 100);
          const isSelected = selectedSector === sec.name;

          return (
            <div
              key={sec.name}
              onClick={() => onSelectSector && onSelectSector(sec.name)}
              className={`flex items-center justify-between text-xs px-2 py-1 rounded cursor-pointer transition ${
                isSelected ? 'bg-blue-900/40 border border-blue-500/50' : 'hover:bg-slate-800/60'
              }`}
            >
              <span className="text-slate-300 font-medium truncate max-w-[110px]" title={sec.name}>
                {sec.name}
              </span>

              {/* Centered zero mini-bar */}
              <div className="flex-1 mx-2.5 h-2 bg-slate-800 rounded-full overflow-hidden flex items-center relative">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isPos ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${barWidthPercent}%` }}
                />
              </div>

              <span
                className={`font-mono text-[11px] font-semibold w-12 text-right ${
                  isPos ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPos ? '+' : ''}
                {sec.avgChange.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

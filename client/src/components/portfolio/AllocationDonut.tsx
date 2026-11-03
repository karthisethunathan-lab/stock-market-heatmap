import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatCurrency } from '../../lib/utils';

interface AllocationDonutProps {
  stockAllocations: { name: string; value: number }[];
  sectorAllocations: { name: string; value: number }[];
  currency: string;
}

const PALETTE = [
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#84cc16', // lime
  '#f97316', // orange
];

export const AllocationDonut: React.FC<AllocationDonutProps> = ({
  stockAllocations,
  sectorAllocations,
  currency = 'USD',
}) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'sector'>('stock');

  const data = activeTab === 'stock' ? stockAllocations : sectorAllocations;
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (data.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Portfolio Allocation
        </h4>

        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'stock'
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            By Stock
          </button>
          <button
            onClick={() => setActiveTab('sector')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'sector'
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            By Sector
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Donut Chart */}
        <div className="relative w-full sm:w-56 h-56 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PALETTE[index % PALETTE.length]}
                    stroke="#0f172a"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0];
                    const percent = total > 0 ? (((item.value as number) / total) * 100).toFixed(1) : 0;
                    return (
                      <div className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs font-mono text-white shadow-xl">
                        <div className="font-bold text-emerald-400">{item.name}</div>
                        <div>{formatCurrency(item.value as number, currency)}</div>
                        <div className="text-slate-400 text-[10px]">{percent}% allocation</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Holdings</span>
            <span className="text-sm font-mono font-bold text-white">{data.length}</span>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 w-full max-h-56 overflow-y-auto space-y-1.5 pr-2 font-mono text-xs">
          {data.map((item, idx) => {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
            const color = PALETTE[idx % PALETTE.length];

            return (
              <div
                key={item.name}
                className="flex items-center justify-between p-1.5 rounded bg-slate-950/40 border border-slate-800/40"
              >
                <div className="flex items-center gap-2 truncate max-w-[150px]">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-slate-200 truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-semibold">{pct}%</span>
                  <span className="text-slate-500 text-[11px] hidden sm:inline">
                    {formatCurrency(item.value, currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

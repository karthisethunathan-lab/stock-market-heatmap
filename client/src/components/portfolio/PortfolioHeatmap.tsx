import React from 'react';
import { SectorGroup } from '../../types';
import { TreemapD3 } from '../heatmap/TreemapD3';
import { useApp } from '../../context/ThemeContext';

interface PortfolioHeatmapProps {
  portfolioSectors: SectorGroup[];
}

export const PortfolioHeatmap: React.FC<PortfolioHeatmapProps> = ({ portfolioSectors }) => {
  const { openStock, colorMode } = useApp();

  if (portfolioSectors.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400 font-mono text-xs">
        Add holdings to see your custom portfolio heatmap visualization.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Portfolio Heatmap (Tile Size = Holding Value)
        </h4>
        <span className="text-[11px] text-slate-500 font-mono">
          Click any holding tile to view full stock details
        </span>
      </div>

      <div className="h-[480px]">
        <TreemapD3
          sectors={portfolioSectors}
          onSelectStock={openStock}
          colorMode={colorMode}
        />
      </div>
    </div>
  );
};

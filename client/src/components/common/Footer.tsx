import React from 'react';
import { ShieldAlert, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#070a10] py-6 px-4 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Disclaimer required by specification */}
        <div className="flex items-center gap-2 text-slate-400 text-center md:text-left">
          <ShieldAlert className="w-4 h-4 text-amber-500/80 shrink-0" />
          <span>
            <strong className="text-slate-300">Disclaimer:</strong> Data may be delayed. Not investment advice. For educational and portfolio tracking purposes only.
          </span>
        </div>

        {/* Right: Data Sources & Attribution */}
        <div className="flex items-center gap-4 text-slate-500 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Yahoo Finance OHLC</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            <span>Finnhub Metrics</span>
          </div>
          <span>•</span>
          <a
            href="https://finnhub.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-300 transition-colors flex items-center gap-0.5"
          >
            Finnhub API <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
};

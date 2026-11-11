import React from 'react';
import { NewsItem } from '../../types';
import { ExternalLink, Newspaper } from 'lucide-react';

interface NewsListProps {
  news: NewsItem[];
}

export const NewsList: React.FC<NewsListProps> = ({ news }) => {
  if (!news || news.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
        <Newspaper className="w-8 h-8 text-slate-600 mb-1" />
        <p className="text-sm font-medium text-slate-300">No Recent News Available</p>
        <p className="text-xs text-slate-500">There are no market news articles indexed for this symbol right now.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
      <div className="flex items-center gap-2">
        <Newspaper className="w-4 h-4 text-emerald-400" />
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Latest Market News
        </h4>
      </div>

      <div className="divide-y divide-slate-800/80">
        {news.slice(0, 8).map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start justify-between gap-4 py-3 group hover:bg-slate-850/50 rounded-lg px-2 -mx-2 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mb-1">
                <span className="text-emerald-400 font-semibold">{item.source}</span>
                <span>•</span>
                <span>
                  {item.datetime
                    ? new Date(item.datetime).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Recent'}
                </span>
              </div>
              <h5 className="text-xs font-medium text-slate-200 group-hover:text-emerald-300 transition-colors line-clamp-2 leading-relaxed">
                {item.headline}
              </h5>
              {item.summary && (
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                  {item.summary}
                </p>
              )}
            </div>

            {item.image && (
              <img
                src={item.image}
                alt=""
                className="w-16 h-16 rounded object-cover border border-slate-800 shrink-0 hidden sm:block"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}

            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 shrink-0 transition-colors mt-1" />
          </a>
        ))}
      </div>
    </div>
  );
};

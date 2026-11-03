import React from 'react';
import { CompanyProfile as IProfile } from '../../types';
import { Globe, Building2, MapPin } from 'lucide-react';

interface CompanyProfileProps {
  profile: IProfile | null;
}

export const CompanyProfile: React.FC<CompanyProfileProps> = ({ profile }) => {
  if (!profile) return null;

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
        About Company
      </h4>

      <p className="text-xs text-slate-300 leading-relaxed font-sans">
        {profile.description || `${profile.name} is a leading enterprise in the ${profile.industry} sector.`}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <span className="text-[10px] block uppercase font-mono">Industry</span>
            <span className="text-slate-200 font-medium truncate block max-w-[130px]">{profile.industry || 'Equities'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <span className="text-[10px] block uppercase font-mono">Exchange</span>
            <span className="text-slate-200 font-medium">{profile.exchange || 'NYSE/NASDAQ'}</span>
          </div>
        </div>

        {profile.website && (
          <div className="flex items-center gap-2 text-slate-400">
            <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] block uppercase font-mono">Website</span>
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline font-medium truncate block max-w-[130px]"
              >
                {profile.website.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

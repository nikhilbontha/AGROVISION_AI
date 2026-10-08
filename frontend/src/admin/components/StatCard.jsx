import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, change, changeLabel, icon: Icon, color = 'emerald' }) => {
  const isPositive = change && !String(change).startsWith('-');

  const colorVariants = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  const badgeClass = colorVariants[color] || colorVariants.emerald;

  return (
    <div className="bg-farm-card/90 backdrop-blur-md rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all duration-300 shadow-xl group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border transition-transform duration-300 group-hover:scale-110 ${badgeClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {value}
        </span>

        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
            isPositive
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}>
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            <span>{change}</span>
          </div>
        )}
      </div>

      {changeLabel && (
        <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-slate-500" />
          <span>{changeLabel}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;

import React from 'react';

const STATUS_STYLES = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  healthy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  resolved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  deployed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',

  inactive: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  archived: 'bg-slate-500/15 text-slate-400 border-slate-500/30',

  infected: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  high: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  bug: 'bg-rose-500/15 text-rose-400 border-rose-500/30',

  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  suggestion: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',

  low: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/30'
};

const StatusBadge = ({ status, customLabel }) => {
  const key = String(status || '').toLowerCase();
  const styleClass = STATUS_STYLES[key] || 'bg-slate-500/15 text-slate-300 border-slate-500/30';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styleClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {customLabel || status}
    </span>
  );
};

export default StatusBadge;

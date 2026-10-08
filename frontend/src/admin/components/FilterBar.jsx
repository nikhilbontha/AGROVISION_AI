import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

const FilterBar = ({ filters = [], values = {}, onChange, onReset }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map(filter => (
        <select
          key={filter.key}
          value={values[filter.key] || ''}
          onChange={e => onChange(filter.key, e.target.value)}
          className="bg-farm-dark/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-farm-green transition-colors"
        >
          <option value="">All {filter.label}</option>
          {filter.options.map(opt => (
            <option key={typeof opt === 'object' ? opt.value : opt} value={typeof opt === 'object' ? opt.value : opt}>
              {typeof opt === 'object' ? opt.label : opt}
            </option>
          ))}
        </select>
      ))}

      {onReset && (
        <button
          onClick={onReset}
          className="p-1.5 rounded-xl bg-farm-dark/80 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Reset Filters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default FilterBar;

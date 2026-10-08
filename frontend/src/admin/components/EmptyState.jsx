import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'No records found', description = 'Try adjusting your search or filters to find what you are looking for.', icon: Icon = Inbox, actionText, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-farm-dark/50 rounded-2xl border border-dashed border-slate-800 my-4">
      <div className="p-4 rounded-full bg-slate-800/80 text-farm-green mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-farm-green text-black font-semibold rounded-xl hover:bg-emerald-400 transition-colors text-sm shadow-lg shadow-emerald-500/20"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

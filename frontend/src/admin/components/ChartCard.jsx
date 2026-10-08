import React from 'react';

const ChartCard = ({ title, subtitle, children, action }) => {
  return (
    <div className="bg-farm-card/90 backdrop-blur-md rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="w-full h-64 sm:h-72">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;

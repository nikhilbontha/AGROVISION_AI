import React from 'react';

const LoadingState = ({ rows = 5 }) => {
  return (
    <div className="w-full space-y-4 p-4 animate-pulse">
      <div className="h-10 bg-slate-800/80 rounded-xl w-full"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 bg-slate-800/40 rounded-xl w-full"></div>
      ))}
    </div>
  );
};

export default LoadingState;

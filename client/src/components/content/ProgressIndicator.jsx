import React from 'react';

const ProgressIndicator = ({ percentage = 0, label, size = 'md', color = 'blue' }) => {
  const clampedPercent = Math.min(100, Math.max(0, percentage));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5'
  };

  const bgClasses = {
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-500',
    indigo: 'bg-indigo-600',
    amber: 'bg-amber-500'
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
          <span>{label}</span>
          <span className="font-mono text-gray-500">{clampedPercent}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className={`${bgClasses[color] || 'bg-blue-600'} h-full rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressIndicator;

import React from 'react';
import { Calendar } from 'lucide-react';

const TimeframeSelector = ({ selected = '30d', onChange }) => {
  const options = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'all', label: 'All Time' }
  ];

  return (
    <div className="inline-flex items-center gap-1.5 p-1 bg-gray-100/80 border border-gray-200/80 rounded-xl">
      <div className="pl-2 pr-1 text-gray-400">
        <Calendar size={13} />
      </div>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            selected === opt.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default TimeframeSelector;

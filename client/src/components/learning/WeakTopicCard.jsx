import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';

const WeakTopicCard = ({ weakTopic, onStartPractice }) => {
  const { topic, weakScore, reason, status } = weakTopic;

  const isCritical = status === 'Weak' || weakScore < 40;

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${isCritical ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
            <AlertCircle size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">{topic}</h4>
            <span className={`text-[11px] font-semibold ${isCritical ? 'text-rose-600' : 'text-amber-600'}`}>
              {status || 'Needs Focus'} ({weakScore}%)
            </span>
          </div>
        </div>
      </div>

      {/* Score Progress Bar */}
      <div className="space-y-1">
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${isCritical ? 'bg-rose-500' : 'bg-amber-500'}`}
            style={{ width: `${Math.max(10, weakScore)}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-400 leading-tight">{reason}</p>
      </div>

      <button
        onClick={() => onStartPractice && onStartPractice(weakTopic)}
        className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
      >
        <span>Practice & Revise</span>
        <ArrowRight size={13} />
      </button>
    </div>
  );
};

export default WeakTopicCard;

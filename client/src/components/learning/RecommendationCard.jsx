import React from 'react';
import { Sparkles, ArrowUpRight, CheckCircle } from 'lucide-react';

const RecommendationCard = ({ recommendation, onAction }) => {
  const { type, topic, reason, priority, courseId } = recommendation;

  const getPriorityStyle = (p) => {
    switch (p) {
      case 'High':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getPriorityStyle(priority)}`}>
            {priority} Priority
          </span>
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
            {type}
          </span>
        </div>

        <h4 className="text-base font-bold text-gray-900 leading-snug">{topic}</h4>
        <p className="text-xs text-gray-500 leading-relaxed">{reason}</p>

        {courseId?.title && (
          <p className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit">
            {courseId.title}
          </p>
        )}
      </div>

      <button
        onClick={() => onAction && onAction(recommendation)}
        className="w-full py-2 px-3 bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-700 font-semibold text-xs rounded-xl border border-gray-200 hover:border-blue-600 flex items-center justify-center gap-1.5 transition-all group"
      >
        <span>Review Recommendation</span>
        <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </div>
  );
};

export default RecommendationCard;

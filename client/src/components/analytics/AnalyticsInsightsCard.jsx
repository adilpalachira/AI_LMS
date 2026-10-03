import React from 'react';
import { Sparkles, CheckCircle, AlertCircle, Info } from 'lucide-react';

const AnalyticsInsightsCard = ({ insights = [], title = "Data-Driven Analytical Insights" }) => {
  if (!insights || insights.length === 0) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Sparkles size={16} className="text-gray-900" />
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        </div>
        <p className="text-xs text-gray-400 font-medium italic">
          No statistical insights recorded for this dataset.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gray-900 text-white rounded-lg">
            <Sparkles size={14} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">{title}</h3>
            <p className="text-[11px] text-gray-400">Calculated strictly from real coursework and engagement data</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
          {insights.length} Insight{insights.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((insight, idx) => {
          const isWarning = insight.toLowerCase().includes('late') || 
                            insight.toLowerCase().includes('incorrect') || 
                            insight.toLowerCase().includes('at-risk') ||
                            insight.toLowerCase().includes('inactive');
          
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                isWarning
                  ? 'bg-amber-50/50 border-amber-200/70 text-amber-950'
                  : 'bg-gray-50/70 border-gray-200/70 text-gray-900'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isWarning ? (
                  <AlertCircle size={15} className="text-amber-600" />
                ) : (
                  <CheckCircle size={15} className="text-gray-700" />
                )}
              </div>
              <p className="text-xs font-medium leading-relaxed">
                {insight}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalyticsInsightsCard;

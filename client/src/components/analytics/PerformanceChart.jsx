import React from 'react';
import { TrendingUp, BarChart2, PieChart, Activity } from 'lucide-react';

/**
 * Radial Gauge Chart for Predicted Score
 */
export const ScoreGauge = ({ score = 0, title = "Predicted Score", subtitle = "ML Model Estimate" }) => {
  const percentage = Math.max(0, Math.min(100, score));
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let colorClass = "text-emerald-500";
  if (percentage < 50) colorClass = "text-red-500";
  else if (percentage < 70) colorClass = "text-amber-500";

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="text-gray-100"
            strokeWidth="14"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold text-gray-950 tracking-tight">{percentage}%</span>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Est. Grade</span>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-bold text-gray-900">{title}</h4>
        <p className="text-xs text-gray-400 font-medium mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
};

/**
 * Multi-Feature Horizontal Bar Comparison Chart
 */
export const FeatureBarChart = ({ features = {} }) => {
  const items = [
    { label: 'Quiz Avg Score', value: features.quizAvgScore || 0, max: 100, color: 'bg-blue-500' },
    { label: 'Assignment Avg Score', value: features.assignmentAvgScore || 0, max: 100, color: 'bg-indigo-500' },
    { label: 'Submission Rate', value: features.assignmentSubmissionRate || 0, max: 100, color: 'bg-teal-500' },
    { label: 'Course Progress', value: features.courseProgress || 0, max: 100, color: 'bg-emerald-500' },
    { label: 'Quiz Pass Rate', value: features.quizPassRate || 0, max: 100, color: 'bg-purple-500' },
  ];

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-800">
            <BarChart2 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Performance Metrics Breakdown</h3>
            <p className="text-xs text-gray-400">Feature values extracted from student history</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-700">{item.label}</span>
              <span className="text-gray-900 font-extrabold">{item.value}%</span>
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color} rounded-full transition-all duration-700`}
                style={{ width: `${Math.min(100, Math.max(0, item.value))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Risk Distribution Breakdown Ring Chart
 */
export const RiskDistributionChart = ({ breakdown = { high: 0, medium: 0, low: 0, unevaluated: 0 } }) => {
  const total = (breakdown.high || 0) + (breakdown.medium || 0) + (breakdown.low || 0) + (breakdown.unevaluated || 0);

  const getPercentage = (val) => (total > 0 ? Math.round((val / total) * 100) : 0);

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
        <div className="p-2 bg-slate-100 rounded-lg text-slate-800">
          <PieChart size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">Class Risk Distribution</h3>
          <p className="text-xs text-gray-400">Categorized student cohort risk</p>
        </div>
      </div>

      {/* Progress Bar Visualizer */}
      <div className="h-4 w-full bg-gray-100 rounded-full flex overflow-hidden">
        <div style={{ width: `${getPercentage(breakdown.high)}%` }} className="bg-red-500 h-full transition-all" title="High Risk" />
        <div style={{ width: `${getPercentage(breakdown.medium)}%` }} className="bg-amber-500 h-full transition-all" title="Medium Risk" />
        <div style={{ width: `${getPercentage(breakdown.low)}%` }} className="bg-emerald-500 h-full transition-all" title="Low Risk" />
        <div style={{ width: `${getPercentage(breakdown.unevaluated)}%` }} className="bg-slate-300 h-full transition-all" title="Unevaluated" />
      </div>

      {/* Grid Legend */}
      <div className="grid grid-cols-2 gap-3 text-xs font-semibold pt-1">
        <div className="flex items-center justify-between p-2.5 bg-red-50/70 border border-red-100 rounded-xl text-red-900">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>High Risk</span>
          </div>
          <span className="font-extrabold text-sm">{breakdown.high}</span>
        </div>

        <div className="flex items-center justify-between p-2.5 bg-amber-50/70 border border-amber-100 rounded-xl text-amber-900">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Medium Risk</span>
          </div>
          <span className="font-extrabold text-sm">{breakdown.medium}</span>
        </div>

        <div className="flex items-center justify-between p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl text-emerald-900">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Low Risk</span>
          </div>
          <span className="font-extrabold text-sm">{breakdown.low}</span>
        </div>

        <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>Unevaluated</span>
          </div>
          <span className="font-extrabold text-sm">{breakdown.unevaluated}</span>
        </div>
      </div>
    </div>
  );
};

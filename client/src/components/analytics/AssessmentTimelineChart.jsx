import React from 'react';
import { TrendingUp, Award, Clock } from 'lucide-react';

const AssessmentTimelineChart = ({ quizTrend = [] }) => {
  if (!quizTrend || quizTrend.length === 0) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <TrendingUp size={16} className="text-gray-900" />
          <h3 className="text-sm font-bold text-gray-900">Quiz Performance Progression</h3>
        </div>
        <div className="py-12 text-center text-gray-400 space-y-1">
          <Clock size={28} className="mx-auto text-gray-300 stroke-[1.5]" />
          <p className="text-xs font-semibold text-gray-500">No quiz attempts recorded in this period</p>
          <p className="text-[11px] text-gray-400">Complete course quizzes to see your chronological score trend.</p>
        </div>
      </div>
    );
  }

  const height = 180;
  const paddingX = 40;
  const paddingY = 30;
  const chartHeight = height - paddingY * 2;

  // Render points
  const points = quizTrend.map((item, idx) => {
    const x = quizTrend.length === 1 
      ? 250 
      : paddingX + (idx / (quizTrend.length - 1)) * (500 - paddingX * 2);
    const score = Math.max(0, Math.min(100, item.percentage || 0));
    const y = height - paddingY - (score / 100) * chartHeight;
    return { x, y, score, ...item };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gray-100 text-gray-900 rounded-lg">
            <TrendingUp size={15} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Quiz Performance Progression</h3>
            <p className="text-[11px] text-gray-400">Chronological test scores and pass status</p>
          </div>
        </div>
        <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
          {quizTrend.length} Attempt{quizTrend.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="min-w-[480px]">
          <svg viewBox="0 0 500 180" className="w-full h-44 overflow-visible">
            {/* Grid background lines */}
            <line x1="30" y1={paddingY} x2="480" y2={paddingY} stroke="#f1f5f9" strokeDasharray="3 3" />
            <line x1="30" y1={paddingY + chartHeight / 2} x2="480" y2={paddingY + chartHeight / 2} stroke="#f1f5f9" strokeDasharray="3 3" />
            <line x1="30" y1={height - paddingY} x2="480" y2={height - paddingY} stroke="#e2e8f0" />

            {/* Y axis labels */}
            <text x="10" y={paddingY + 4} fontSize="9" fill="#94a3b8" fontWeight="600">100%</text>
            <text x="15" y={paddingY + chartHeight / 2 + 3} fontSize="9" fill="#94a3b8" fontWeight="600">50%</text>
            <text x="20" y={height - paddingY + 3} fontSize="9" fill="#94a3b8" fontWeight="600">0%</text>

            {/* Gradient area under line */}
            <defs>
              <linearGradient id="scoreTrendGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0f172a" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {points.length > 1 && (
              <path
                d={`${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`}
                fill="url(#scoreTrendGrad)"
              />
            )}

            {/* Score line */}
            {points.length > 1 && (
              <path
                d={pathD}
                fill="none"
                stroke="#0f172a"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data point dots */}
            {points.map((pt, idx) => (
              <g key={idx} className="group cursor-pointer">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill={pt.passed ? "#10b981" : "#ef4444"}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all group-hover:r-7"
                />
                {/* Score value above point */}
                <text
                  x={pt.x}
                  y={pt.y - 10}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="#0f172a"
                >
                  {pt.score}%
                </text>
                {/* Date / label below */}
                <text
                  x={pt.x}
                  y={height - paddingY + 14}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="600"
                  fill="#64748b"
                >
                  {pt.date}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default AssessmentTimelineChart;

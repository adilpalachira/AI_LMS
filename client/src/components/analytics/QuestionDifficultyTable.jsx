import React, { useState } from 'react';
import { HelpCircle, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

const QuestionDifficultyTable = ({ items = [] }) => {
  const [expandedId, setExpandedId] = useState(null);

  if (!items || items.length === 0) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <HelpCircle size={16} className="text-gray-900" />
          <h3 className="text-sm font-bold text-gray-900">Question Item Difficulty Analysis</h3>
        </div>
        <div className="py-8 text-center text-gray-400 space-y-1">
          <p className="text-xs font-semibold text-gray-500">No question response data available yet</p>
          <p className="text-[11px] text-gray-400">Question difficulty tiers will appear once students attempt quizzes in this course.</p>
        </div>
      </div>
    );
  }

  const getBadgeStyle = (tag) => {
    switch (tag) {
      case 'Frequently Incorrect':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Challenging':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Well-Mastered':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gray-100 text-gray-900 rounded-lg">
            <HelpCircle size={15} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Assessment Item Analysis</h3>
            <p className="text-[11px] text-gray-400">Statistical difficulty determined by student error rates</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> ≥50% Error
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> 30-49% Error
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> &lt;30% Error
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-200/80 text-gray-400 uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3 font-bold">Question Text</th>
              <th className="py-2.5 px-3 font-bold text-center">Attempts</th>
              <th className="py-2.5 px-3 font-bold text-center">Incorrect</th>
              <th className="py-2.5 px-3 font-bold text-center">Error Rate</th>
              <th className="py-2.5 px-3 font-bold text-right">Difficulty Tier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, idx) => (
              <React.Fragment key={item.questionId || idx}>
                <tr className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-3 font-semibold text-gray-900 max-w-md">
                    <p className="line-clamp-2">{item.questionText}</p>
                  </td>
                  <td className="py-3 px-3 text-center text-gray-600 font-medium">
                    {item.totalAttempts}
                  </td>
                  <td className="py-3 px-3 text-center text-red-600 font-bold">
                    {item.incorrectCount}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-gray-100 h-2 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className={`h-full ${
                            item.errorRate >= 50
                              ? 'bg-red-500'
                              : item.errorRate >= 30
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${item.errorRate}%` }}
                        />
                      </div>
                      <span className="font-extrabold text-gray-900">{item.errorRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${getBadgeStyle(
                        item.difficultyTag
                      )}`}
                    >
                      {item.difficultyTag}
                    </span>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuestionDifficultyTable;

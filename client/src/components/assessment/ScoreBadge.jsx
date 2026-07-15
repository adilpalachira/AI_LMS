import React from 'react';
import { Award, CheckCircle2, XCircle } from 'lucide-react';

const ScoreBadge = ({ score, maxScore, percentage, passed }) => {
  const isPassed = passed !== undefined ? passed : percentage >= 50;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border shadow-2xs ${
        isPassed
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-rose-50 text-rose-700 border-rose-200'
      }`}
    >
      {isPassed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
      <span>
        {score} / {maxScore} ({percentage}%)
      </span>
      <span className="font-extrabold uppercase text-[10px] tracking-wider ml-1">
        {isPassed ? 'Passed' : 'Failed'}
      </span>
    </div>
  );
};

export default ScoreBadge;

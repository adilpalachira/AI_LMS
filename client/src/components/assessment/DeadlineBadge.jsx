import React from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

const DeadlineBadge = ({ deadline }) => {
  if (!deadline) return null;

  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffHours = (deadlineDate - now) / (1000 * 60 * 60);

  const formattedDate = deadlineDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  if (diffHours < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
        <AlertTriangle size={12} /> Overdue: {formattedDate}
      </span>
    );
  }

  if (diffHours <= 24) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
        <Clock size={12} /> Due Soon: {formattedDate}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
      <Clock size={12} /> Due: {formattedDate}
    </span>
  );
};

export default DeadlineBadge;

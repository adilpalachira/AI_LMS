import React from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

const DeadlineBadge = ({ deadline, isSubmitted = false, submissionStatus }) => {
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

  const hasSubmitted = isSubmitted || submissionStatus === 'Submitted' || submissionStatus === 'Graded';

  // If student has already submitted, never show Overdue
  if (hasSubmitted) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
        <Clock size={12} /> Deadline: {formattedDate}
      </span>
    );
  }

  // If not submitted and deadline has passed -> Overdue
  if (diffHours < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
        <AlertTriangle size={12} /> Overdue: {formattedDate}
      </span>
    );
  }

  // If not submitted and due within 24 hours -> Due Soon
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

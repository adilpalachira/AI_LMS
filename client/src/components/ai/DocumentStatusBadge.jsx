import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';

export default function DocumentStatusBadge({ status }) {
  switch (status) {
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Processed</span>
        </span>
      );
    case 'PROCESSING':
      return (
        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-1 rounded-full">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Processing</span>
        </span>
      );
    case 'FAILED':
      return (
        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold px-2.5 py-1 rounded-full">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Failed</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 border border-slate-200 text-xs font-semibold px-2.5 py-1 rounded-full">
          <Clock className="w-3.5 h-3.5" />
          <span>Pending</span>
        </span>
      );
  }
}

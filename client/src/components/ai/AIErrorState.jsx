import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function AIErrorState({ message, onRetry }) {
  return (
    <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-950 my-4 flex items-start gap-3 shadow-2xs">
      <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
        <AlertCircle className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
          AI Assistant Notice
        </h4>
        <p className="text-xs text-amber-800 leading-relaxed font-medium">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-200/70 hover:bg-amber-200 px-3.5 py-1.5 rounded-xl transition-all shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
}

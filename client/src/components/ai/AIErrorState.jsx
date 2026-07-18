import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function AIErrorState({ message, onRetry }) {
  return (
    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 my-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-semibold mb-1">AI Assistant Notice</h4>
        <p className="text-xs text-amber-800 leading-relaxed">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-200/60 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
}

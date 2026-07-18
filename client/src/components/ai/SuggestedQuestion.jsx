import React from 'react';
import { Sparkles } from 'lucide-react';

export default function SuggestedQuestion({ questions, onSelectQuestion }) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="p-4 bg-slate-50 border-t border-slate-200">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>Suggested Questions</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelectQuestion(q)}
            className="text-xs bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-medium px-3 py-1.5 rounded-full border border-slate-200 hover:border-blue-200 transition-all shadow-2xs"
          >
            "{q}"
          </button>
        ))}
      </div>
    </div>
  );
}

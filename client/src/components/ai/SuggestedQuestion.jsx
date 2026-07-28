import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function SuggestedQuestion({ questions, onSelectQuestion }) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="px-6 py-4 bg-[#F8FAFC]/80 border-t border-gray-200/80">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">
        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
        <span>Suggested Prompts</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelectQuestion(q)}
            className="group flex items-center gap-2 text-xs bg-white hover:bg-slate-900 text-gray-700 hover:text-white font-medium px-3.5 py-2 rounded-xl border border-gray-200 hover:border-slate-900 transition-all shadow-2xs"
          >
            <span>"{q}"</span>
            <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}

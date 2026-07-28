import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 my-4">
      <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
        <Bot className="w-4.5 h-4.5 text-blue-400" />
      </div>
      <div className="bg-white border border-gray-200/90 text-gray-700 px-4 py-3 rounded-2xl rounded-tl-xs flex items-center gap-2 shadow-2xs">
        <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
        <span className="text-xs font-semibold text-gray-800">AI Tutor is searching course materials</span>
        <div className="flex items-center gap-1 ml-1">
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
        </div>
      </div>
    </div>
  );
}

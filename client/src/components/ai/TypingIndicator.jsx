import React from 'react';
import { Bot } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 my-3">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-xs">
        <Bot className="w-4 h-4" />
      </div>
      <div className="bg-slate-100 text-slate-600 px-4 py-3 rounded-2xl rounded-tl-xs flex items-center gap-1.5 shadow-2xs">
        <span className="text-xs font-medium mr-1">AI Tutor is searching course materials</span>
        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
      </div>
    </div>
  );
}

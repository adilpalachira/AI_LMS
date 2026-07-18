import React from 'react';
import { User, Bot } from 'lucide-react';
import SourceReference from './SourceReference';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-xs ${
          isUser ? 'bg-slate-800' : 'bg-blue-600'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Content Container */}
      <div className={`max-w-[82%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-2xs ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-xs font-normal'
              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs font-normal'
          }`}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>

          {/* Sources for Assistant Messages */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <SourceReference sources={message.sources} />
          )}
        </div>

        {/* Timestamp */}
        <div className={`text-[10px] text-slate-400 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
        </div>
      </div>
    </div>
  );
}

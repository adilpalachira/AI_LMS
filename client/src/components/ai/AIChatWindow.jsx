import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, BookOpen } from 'lucide-react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import SuggestedQuestion from './SuggestedQuestion';
import AIErrorState from './AIErrorState';

export default function AIChatWindow({
  messages,
  isLoading,
  error,
  courseTitle,
  onSendMessage,
  suggestedQuestions
}) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleSelectSuggested = (questionText) => {
    if (isLoading) return;
    onSendMessage(questionText);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Course Assistant
              <span className="bg-blue-100 text-blue-700 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full">
                AI Tutor
              </span>
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>{courseTitle || 'Select a course to ask questions'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 shadow-xs">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Ask questions about your course
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              I can explain concepts, search unit notes, summarize topics, and guide your studying using your official course materials.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage key={msg._id || index} message={msg} />
          ))
        )}

        {isLoading && <TypingIndicator />}
        {error && <AIErrorState message={error} />}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 0 && (
        <SuggestedQuestion
          questions={suggestedQuestions}
          onSelectQuestion={handleSelectSuggested}
        />
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-200">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder={
              courseTitle
                ? `Ask anything about ${courseTitle}...`
                : 'Select a course first to start asking questions...'
            }
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, BookOpen, Cpu, ShieldCheck, HelpCircle, Code, FileText, CheckSquare } from 'lucide-react';
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSelectSuggested = (questionText) => {
    if (isLoading) return;
    onSendMessage(questionText);
  };

  const capabilityCards = [
    {
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      title: 'Concept Explanations',
      desc: 'Get step-by-step breakdowns of difficult course topics and definitions.',
      prompt: 'Can you explain the core concepts of this course in simple terms?'
    },
    {
      icon: FileText,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      title: 'Summarize Materials',
      desc: 'Summarize uploaded lecture notes, PDFs, and reading assignments.',
      prompt: 'Summarize the main topics from the course materials.'
    },
    {
      icon: CheckSquare,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      title: 'Exam & Quiz Prep',
      desc: 'Generate practice quiz questions and key formula reviews for tests.',
      prompt: 'What are the most important topics I should review for the assessment?'
    },
    {
      icon: Code,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      title: 'Code & Problem Guide',
      desc: 'Analyze code snippets, database queries, and architectural designs.',
      prompt: 'Give me a practical example related to the course syllabus.'
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-white border border-gray-200/80 rounded-[20px] shadow-sm overflow-hidden relative">
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between shadow-2xs z-10 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                AI Course Assistant
              </h2>
              <span className="bg-blue-50 text-blue-700 border border-blue-200/80 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full">
                RAG v2.4
              </span>
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5 font-medium">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-gray-700 font-semibold">{courseTitle || 'Select a course from top menu'}</span>
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-bold px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Vector Knowledge Active
          </span>
        </div>
      </div>

      {/* Message Feed Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto py-6">
            
            {/* Center Graphic */}
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-4 shadow-md shadow-slate-900/10">
              <Sparkles className="w-8 h-8 text-blue-400" />
            </div>

            <h3 className="text-2xl font-extrabold text-gray-900 mb-1.5 tracking-tight text-center">
              How can I assist your study today?
            </h3>
            <p className="text-xs text-gray-400 text-center max-w-lg mb-8 font-medium leading-relaxed">
              Ask questions about lecture notes, syllabus concepts, and practice problems directly grounded in your official course documents.
            </p>

            {/* Interactive Capability Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
              {capabilityCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggested(card.prompt)}
                    className="p-4 rounded-2xl bg-white border border-gray-200/80 hover:border-blue-300 hover:shadow-sm text-left transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                        {card.title}
                      </h4>
                      <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                        {card.desc}
                      </p>
                    </div>

                    <span className="mt-3 text-[10px] font-bold text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to ask &rarr;
                    </span>
                  </button>
                );
              })}
            </div>
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

      {/* Suggested Quick Prompts when messages exist */}
      {messages.length > 0 && (
        <SuggestedQuestion
          questions={suggestedQuestions}
          onSelectQuestion={handleSelectSuggested}
        />
      )}

      {/* Floating Glass Input Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200/80 shrink-0">
        <div className="relative flex items-center">
          <textarea
            rows="1"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={
              courseTitle
                ? `Ask anything about ${courseTitle}... (Press Enter to send)`
                : 'Select a course first to start asking questions...'
            }
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-14 py-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-60 resize-none font-medium"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-gray-400 font-medium">
          <span>AI Tutor responds using RAG vector embeddings</span>
          <span>Shift + Enter for new line • Enter to send</span>
        </div>
      </form>
    </div>
  );
}

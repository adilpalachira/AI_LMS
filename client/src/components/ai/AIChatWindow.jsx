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
    <div className="flex-1 flex flex-col h-full bg-white border border-gray-200/80 rounded-[20px] shadow-sm overflow-hidden relative min-h-0">
      {/* Header Bar */}
      <div className="px-6 py-3.5 border-b border-gray-100 bg-white flex items-center justify-between shadow-2xs z-10 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-950 tracking-tight">
                AI Course Assistant
              </h2>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs">
                Gemini AI RAG
              </span>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5 font-medium">
              <BookOpen className="w-3.5 h-3.5 text-gray-950" />
              <span className="text-gray-950 font-bold">{courseTitle || 'Select a course from top menu'}</span>
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-900 border border-gray-300 text-[11px] font-bold px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Vector Knowledge Active
          </span>
        </div>
      </div>

      {/* Message Feed Area (Scrolls internally) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto py-4">
            
            {/* Center Graphic */}
            <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center mb-3 shadow-md">
              <Sparkles className="w-7 h-7 text-white" />
            </div>

            <h3 className="text-xl font-extrabold text-gray-950 mb-1 tracking-tight text-center">
              How can I assist your study today?
            </h3>
            <p className="text-xs text-gray-500 text-center max-w-lg mb-6 font-medium leading-relaxed">
              Ask questions about lecture notes, syllabus concepts, and practice problems directly grounded in your official course documents.
            </p>

            {/* Interactive Capability Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {capabilityCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggested(card.prompt)}
                    className="p-3.5 rounded-2xl bg-white border border-gray-200/90 hover:border-black hover:shadow-sm text-left transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center mb-2 bg-gray-100 text-gray-950 border border-gray-200">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-gray-950 group-hover:text-black transition-colors mb-0.5">
                        {card.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                        {card.desc}
                      </p>
                    </div>

                    <span className="mt-2 text-[10px] font-bold text-gray-950 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

      {/* Fixed Glass Input Form */}
      <form onSubmit={handleSubmit} className="p-3.5 sm:p-4 bg-white border-t border-gray-200/80 shrink-0">
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
            className="w-full bg-gray-50 border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/10 rounded-xl pl-4 pr-12 py-2.5 text-xs font-medium text-gray-900 placeholder-gray-400 transition-all disabled:opacity-60 resize-none max-h-28"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 p-2 bg-black hover:bg-slate-800 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg transition-all shadow-sm active:scale-95 flex items-center justify-center"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-gray-400 font-medium">
          <span>AI Tutor responds using RAG vector embeddings</span>
          <span>Shift + Enter for new line • Enter to send</span>
        </div>
      </form>
    </div>
  );
}


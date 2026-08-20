import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getMyEnrollments, getCourses } from '../../services/courseService';
import { aiTutorService } from '../../services/aiTutorService';
import { Sparkles, Bot, X, Send, Maximize2, Loader2, BookOpen, ChevronDown } from 'lucide-react';

const FloatingAIChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  // Load User Courses when user exists
  useEffect(() => {
    if (!user) return;

    const fetchCourses = async () => {
      try {
        let courseList = [];
        if (user.role === 'Student') {
          const res = await getMyEnrollments();
          courseList = (res.data || []).map(e => e.course).filter(Boolean);
        } else {
          const res = await getCourses({ limit: 50 });
          courseList = res.data?.courses || [];
        }
        setCourses(courseList);
        if (courseList.length > 0) {
          setSelectedCourseId(courseList[0]._id || courseList[0].id);
        }
      } catch (err) {
        console.error('Failed to load courses for chatbot:', err);
      }
    };

    fetchCourses();
  }, [user]);

  // Load chat session when course changes or widget opens
  useEffect(() => {
    if (!user || !isOpen || !selectedCourseId) return;

    const initChatSession = async () => {
      try {
        const res = await aiTutorService.getSessions(selectedCourseId);
        const sessionList = res.data || [];
        if (sessionList.length > 0) {
          const topSession = sessionList[0];
          setActiveSessionId(topSession._id);
          const historyRes = await aiTutorService.getSessionById(topSession._id);
          setMessages(historyRes.data?.messages || []);
        } else {
          setActiveSessionId(null);
          setMessages([]);
        }
      } catch (err) {
        console.error('Failed to initialize chatbot session:', err);
      }
    };

    initChatSession();
  }, [user, isOpen, selectedCourseId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Hide floating widget if user is not logged in or is on excluded routes
  const isHidden = !user || location.pathname === '/ai-tutor' || ['/', '/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);
  if (isHidden) {
    return null;
  }

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const query = inputText.trim();
    if (!query || isLoading) return;

    if (!selectedCourseId) {
      setError('Please select a course to ask questions.');
      return;
    }

    const tempUserMsg = {
      _id: `temp_${Date.now()}`,
      role: 'user',
      content: query,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setInputText('');
    setIsLoading(true);
    setError(null);

    try {
      const res = await aiTutorService.askQuestion(
        activeSessionId,
        query,
        selectedCourseId
      );

      const responseData = res.data || res;
      if (responseData.sessionId) {
        setActiveSessionId(responseData.sessionId);
      }

      const assistantMsg = responseData.assistantMessage;
      const serverUserMsg = responseData.userMessage;

      setMessages(prev => {
        const filtered = prev.filter(m => m._id !== tempUserMsg._id);
        return [...filtered, serverUserMsg || tempUserMsg, assistantMsg].filter(Boolean);
      });
    } catch (err) {
      console.error('Chatbot send error:', err);
      setError(err.response?.data?.message || 'Failed to get answer from AI Tutor');
    } finally {
      setIsLoading(false);
    }
  };

  // Avoid AI Tutor for non-Student roles (Faculty, Admin)
  if (!user || user.role !== 'Student') {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Expanded Floating Chatbot Panel */}
      {isOpen ? (
        <div className="bg-white border border-gray-200/90 rounded-3xl shadow-2xl w-[380px] sm:w-[420px] h-[560px] flex flex-col overflow-hidden animate-fadeIn backdrop-blur-md">
          {/* Top Bar Header */}
          <div className="bg-black text-white p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 rounded-xl">
                <Sparkles size={18} className="text-blue-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">AI Academic Tutor</h3>
                <p className="text-[10px] text-gray-400 font-medium">Powered by Gemini AI Engine</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navigate('/ai-tutor')}
                title="Expand to Full Workspace"
                className="p-1.5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-colors"
              >
                <Maximize2 size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Course Selector Dropdown */}
          <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2 text-xs">
            <BookOpen size={14} className="text-gray-400 shrink-0" />
            <div className="relative flex-1">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl py-1.5 px-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-blue-500 appearance-none pr-8 cursor-pointer"
              >
                {courses.length > 0 ? (
                  courses.map(c => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.code ? `${c.code}: ` : ''}{c.title}
                    </option>
                  ))
                ) : (
                  <option value="">No enrolled courses</option>
                )}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#F8FAFC]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                  <Bot size={28} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-gray-900">How can I help you today?</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Ask me anything about your course lectures, code assignments, or exam concepts!
                  </p>
                </div>
                <div className="w-full space-y-1.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setInputText('Explain the core concepts of this course')}
                    className="w-full text-left text-[11px] font-medium bg-white hover:bg-gray-100/80 border border-gray-200 text-gray-700 p-2 rounded-xl transition-all"
                  >
                    💡 "Explain the core concepts of this course"
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputText('What are the key topics I should study for exams?')}
                    className="w-full text-left text-[11px] font-medium bg-white hover:bg-gray-100/80 border border-gray-200 text-gray-700 p-2 rounded-xl transition-all"
                  >
                    🎯 "What key topics should I study for exams?"
                  </button>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={msg._id || idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-xs leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-black text-white rounded-br-none font-medium'
                        : 'bg-white border border-gray-200/90 text-gray-800 rounded-bl-none font-normal'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200/90 rounded-2xl rounded-bl-none p-3.5 flex items-center gap-2 text-xs text-gray-500 shadow-xs">
                  <Loader2 size={14} className="animate-spin text-blue-600" />
                  <span>AI Tutor is thinking...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-2.5 rounded-xl text-center">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer Form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask AI Tutor a question..."
              className="flex-1 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white text-xs rounded-xl px-3.5 py-2.5 outline-none transition-all text-gray-900 placeholder-gray-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="bg-black hover:bg-slate-900 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all shadow-xs shrink-0"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      ) : (
        /* Floating Button Trigger */
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 bg-black hover:bg-slate-900 text-white font-bold px-4 py-3.5 rounded-full shadow-2xl transition-all transform hover:scale-105"
        >
          <div className="relative">
            <Sparkles size={18} className="text-white" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-500 animate-ping"></span>
          </div>
          <span className="text-xs tracking-tight">Ask AI Tutor</span>
        </button>
      )}
    </div>
  );
};

export default FloatingAIChat;

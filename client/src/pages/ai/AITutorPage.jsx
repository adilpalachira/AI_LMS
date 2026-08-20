import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { getMyEnrollments, getMyTaughtCourses, getCourses } from '../../services/courseService';
import { aiTutorService } from '../../services/aiTutorService';
import CourseSelector from '../../components/ai/CourseSelector';
import ChatSessionList from '../../components/ai/ChatSessionList';
import AIChatWindow from '../../components/ai/AIChatWindow';
import DocumentStatusBadge from '../../components/ai/DocumentStatusBadge';
import { Bot, Database, Sparkles, RefreshCw, Trash2, FileText, AlertCircle } from 'lucide-react';

export default function AITutorPage() {
  const { user } = useAuth();

  // State
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tab State: 'chat' | 'knowledge'
  const [activeTab, setActiveTab] = useState('chat');
  const [knowledgeDocs, setKnowledgeDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);

  // 1. Fetch User Courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        let courseList = [];
        if (user?.role === 'Student') {
          const res = await getMyEnrollments();
          courseList = (res.data || []).map(e => e.course).filter(Boolean);
        } else if (user?.role === 'Faculty') {
          const res = await getMyTaughtCourses();
          courseList = res.data || [];
        } else {
          const res = await getCourses({ limit: 100 });
          courseList = res.data?.courses || [];
        }

        setCourses(courseList);
        if (courseList.length > 0) {
          setSelectedCourseId(courseList[0]._id || courseList[0].id);
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      }
    };

    fetchCourses();
  }, [user]);

  // 2. Update selected course object & load sessions
  useEffect(() => {
    if (!selectedCourseId) return;

    const found = courses.find(c => (c._id || c.id) === selectedCourseId);
    setSelectedCourse(found || null);

    fetchSessions(selectedCourseId);
    if (activeTab === 'knowledge') {
      fetchKnowledgeDocs(selectedCourseId);
    }
  }, [selectedCourseId, courses]);

  // 3. Fetch Sessions for selected course
  const fetchSessions = async (courseId) => {
    try {
      const res = await aiTutorService.getSessions(courseId);
      const sessionList = res.data || [];
      setSessions(sessionList);

      if (sessionList.length > 0) {
        setActiveSessionId(sessionList[0]._id);
        loadSessionHistory(sessionList[0]._id);
      } else {
        setActiveSessionId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
    }
  };

  // 4. Load history for an active session
  const loadSessionHistory = async (sessionId) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await aiTutorService.getSessionById(sessionId);
      setMessages(res.data?.messages || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load session history');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Fetch Knowledge Base Documents (Faculty / Admin)
  const fetchKnowledgeDocs = async (courseId) => {
    try {
      setDocsLoading(true);
      const res = await aiTutorService.getKnowledgeDocuments(courseId);
      setKnowledgeDocs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch knowledge documents:', err);
    } finally {
      setDocsLoading(false);
    }
  };

  // Switch Active Session
  const handleSelectSession = (sessionId) => {
    setActiveSessionId(sessionId);
    loadSessionHistory(sessionId);
  };

  // Create New Session
  const handleNewSession = async () => {
    if (!selectedCourseId) return;
    try {
      const res = await aiTutorService.createSession(selectedCourseId, 'New Conversation');
      const newSession = res.data;
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession._id);
      setMessages([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create new session');
    }
  };

  // Delete Session
  const handleDeleteSession = async (sessionId) => {
    try {
      await aiTutorService.deleteSession(sessionId);
      const updated = sessions.filter(s => s._id !== sessionId);
      setSessions(updated);

      if (activeSessionId === sessionId) {
        if (updated.length > 0) {
          setActiveSessionId(updated[0]._id);
          loadSessionHistory(updated[0]._id);
        } else {
          setActiveSessionId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete session');
    }
  };

  // Send Question
  const handleSendMessage = async (questionText) => {
    if (!selectedCourseId) {
      setError('Please select an enrolled course first.');
      return;
    }

    // Optimistically render user question
    const tempUserMsg = {
      _id: `temp_${Date.now()}`,
      role: 'user',
      content: questionText,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const res = await aiTutorService.askQuestion(
        activeSessionId,
        questionText,
        selectedCourseId
      );

      // Extract response payload from response data envelope
      const responseData = res.data || res;
      const newSessionId = responseData.sessionId;
      const assistantMsg = responseData.assistantMessage;
      const serverUserMsg = responseData.userMessage;

      if (newSessionId && newSessionId !== activeSessionId) {
        setActiveSessionId(newSessionId);
        // Refresh session list so sidebar updates
        fetchSessions(selectedCourseId);
      }

      setMessages(prev => {
        const filtered = prev.filter(m => m._id !== tempUserMsg._id);
        return [...filtered, serverUserMsg || tempUserMsg, assistantMsg].filter(Boolean);
      });
    } catch (err) {
      console.error('AI Tutor error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to generate response';
      setError(errorMsg);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m._id !== tempUserMsg._id));
    } finally {
      setIsLoading(false);
    }
  };

  // Retry processing knowledge document
  const handleRetryDoc = async (docId) => {
    try {
      await aiTutorService.retryDocumentProcessing(docId);
      fetchKnowledgeDocs(selectedCourseId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to retry processing');
    }
  };

  // Delete knowledge document
  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Remove this document from knowledge base?')) return;
    try {
      await aiTutorService.deleteKnowledgeDocument(docId);
      setKnowledgeDocs(prev => prev.filter(d => d._id !== docId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove document');
    }
  };

  // Contextual suggested questions for active course
  const suggestedQuestions = selectedCourse
    ? [
        `What are the key concepts in ${selectedCourse.title}?`,
        `Summarize the main topics from Unit 1.`,
        `Explain the core definitions in this course.`,
        `What should I review before the assessment?`
      ]
    : [
        `What are the main topics in this course?`,
        `Summarize the uploaded reading materials.`
      ];

  return (
    <div className="h-screen bg-[#F8FAFC] flex font-sans overflow-hidden">
      {/* 260px Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Fixed Header */}
        <Header />

        {/* AI Tutor Main Workspace */}
        <main className="flex-1 p-4 md:p-6 max-w-[1600px] w-full mx-auto flex flex-col min-h-0 overflow-hidden">
          
          {/* TOP HERO BANNER (Dashboard Notion Style) */}
          <div className="bg-white border border-gray-200/80 rounded-[20px] p-4 md:p-5 mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm shrink-0 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gray-100/50 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-0.5 z-10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Google Gemini AI Learning Assistant</span>
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold text-gray-950 tracking-tight">
                Course AI Tutor & RAG Knowledge Base
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Ask questions grounded in your course materials, lecture notes, and syllabus assignments using Gemini AI.
              </p>
            </div>


            <div className="flex flex-wrap items-center gap-3 z-10 w-full md:w-auto">
              <CourseSelector
                courses={courses}
                selectedCourseId={selectedCourseId}
                onSelectCourse={(id) => setSelectedCourseId(id)}
              />

              {/* Faculty / Admin Tab Toggle */}
              {(user?.role === 'Admin' || user?.role === 'Faculty') && (
                <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-200">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                      activeTab === 'chat'
                        ? 'bg-white text-gray-900 shadow-2xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5 text-blue-600" />
                    <span>AI Assistant</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('knowledge');
                      if (selectedCourseId) fetchKnowledgeDocs(selectedCourseId);
                    }}
                    className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                      activeTab === 'knowledge'
                        ? 'bg-white text-gray-900 shadow-2xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5 text-purple-600" />
                    <span>Knowledge Base</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* MAIN WORKSPACE CONTENT */}
          <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
            {activeTab === 'chat' ? (
              <>
                {/* Sidebar Chat Sessions */}
                <ChatSessionList
                  sessions={sessions}
                  activeSessionId={activeSessionId}
                  onSelectSession={handleSelectSession}
                  onNewSession={handleNewSession}
                  onDeleteSession={handleDeleteSession}
                />

                {/* Main Chat Window */}
                <AIChatWindow
                  messages={messages}
                  isLoading={isLoading}
                  error={error}
                  courseTitle={selectedCourse?.title}
                  onSendMessage={handleSendMessage}
                  suggestedQuestions={suggestedQuestions}
                />
              </>
            ) : (
              /* Knowledge Base Management View (Faculty / Admin) */
              <div className="flex-1 overflow-y-auto pr-1">
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 flex items-center justify-between shadow-sm">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <Database className="w-5 h-5 text-purple-600" />
                        Course Knowledge Base Documents
                      </h3>
                      <p className="text-xs text-gray-400 font-medium mt-1">
                        Manage vector embeddings, view extraction statuses, and retry failed processing jobs.
                      </p>
                    </div>
                    <button
                      onClick={() => fetchKnowledgeDocs(selectedCourseId)}
                      className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-2xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh Status</span>
                    </button>
                  </div>

                  {docsLoading ? (
                    <div className="p-12 text-center text-gray-400 text-xs font-medium">
                      Loading knowledge base records...
                    </div>
                  ) : knowledgeDocs.length === 0 ? (
                    <div className="p-16 text-center border border-dashed border-gray-300 rounded-[20px] bg-white shadow-sm">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h4 className="text-base font-bold text-gray-800 mb-1">
                        No Knowledge Base Documents Yet
                      </h4>
                      <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                        Learning material documents (PDFs, notes) uploaded to course lessons will automatically process into vector embeddings and appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-200/80 rounded-[20px] overflow-hidden shadow-sm">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 border-b border-gray-150 uppercase tracking-wider text-gray-400 font-bold">
                          <tr>
                            <th className="py-4 px-5">Document Name</th>
                            <th className="py-4 px-5">Lesson</th>
                            <th className="py-4 px-5">Status</th>
                            <th className="py-4 px-5">Chunks</th>
                            <th className="py-4 px-5">Uploaded</th>
                            <th className="py-4 px-5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                          {knowledgeDocs.map((doc) => (
                            <tr key={doc._id} className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-4 px-5 font-bold text-gray-900 flex items-center gap-2.5">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <span className="truncate max-w-xs">{doc.fileName}</span>
                              </td>
                              <td className="py-4 px-5 text-xs text-gray-500 font-medium">
                                {doc.lessonId?.title || 'General Course Note'}
                              </td>
                              <td className="py-4 px-5">
                                <DocumentStatusBadge status={doc.processingStatus} />
                                {doc.errorMessage && (
                                  <p className="text-[10px] text-rose-600 mt-1 max-w-xs truncate" title={doc.errorMessage}>
                                    {doc.errorMessage}
                                  </p>
                                )}
                              </td>
                              <td className="py-4 px-5 text-xs font-mono font-bold text-gray-800">
                                {doc.chunkCount || 0}
                              </td>
                              <td className="py-4 px-5 text-xs text-gray-400 font-medium">
                                {new Date(doc.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-4 px-5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {doc.processingStatus === 'FAILED' && (
                                    <button
                                      onClick={() => handleRetryDoc(doc._id)}
                                      title="Retry vector processing"
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                    >
                                      <RefreshCw className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteDoc(doc._id)}
                                    title="Remove from knowledge base"
                                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

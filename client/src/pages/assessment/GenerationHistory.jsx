import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { getAiGenerationHistory } from '../../services/assessmentService';
import { getCourses } from '../../services/courseService';
import {
  History,
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Layers
} from 'lucide-react';

const GenerationHistory = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [selectedCourseId]);

  const fetchCourses = async () => {
    try {
      const res = await getCourses();
      setCourses(res.data || res || []);
    } catch (err) {
      console.error('Failed to load courses:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAiGenerationHistory(selectedCourseId || undefined);
      setHistoryLogs(res.data || res || []);
    } catch (err) {
      setError('Failed to load generation history.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto space-y-8">
          
          {/* Banner */}
          <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-600 border border-purple-100">
                <History size={14} />
                AI Log Audit Trail
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                AI Generation History
              </h1>
              <p className="text-xs md:text-sm text-gray-500 max-w-2xl leading-relaxed">
                Review all past AI quiz and question generation requests, target parameters, status logs, and outputs.
              </p>
            </div>

            <div className="w-full md:w-64">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-xl p-3 font-semibold"
              >
                <option value="">All Courses</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-3">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* History List */}
          <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 md:p-8 space-y-4 shadow-sm">
            {loading ? (
              <div className="py-12 text-center text-xs text-gray-400">Loading history logs...</div>
            ) : historyLogs.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">No generation history logs found.</div>
            ) : (
              <div className="space-y-4">
                {historyLogs.map(log => (
                  <div key={log._id} className="border border-gray-200 rounded-2xl p-5 space-y-3 bg-gray-50/50 hover:bg-white transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">
                          {log.courseId?.title || 'Course'}
                        </span>
                        {log.lessonId && (
                          <span className="text-xs text-gray-500 font-medium">
                            • {log.lessonId?.title}
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                          {log.questionType}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                          {log.difficulty}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className={`font-bold px-2.5 py-0.5 rounded-md border text-[10px] ${
                          log.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          log.status === 'FAILED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {log.status}
                        </span>
                        <span className="text-gray-400 font-medium text-[11px]">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-600 space-y-1">
                      {log.topic && <p>Focus Topic: <strong className="text-gray-900">{log.topic}</strong></p>}
                      <p>Requested Count: <strong>{log.questionCount}</strong> | Generated Output: <strong>{log.generatedQuestions?.length || 0} questions</strong></p>
                      {log.errorMessage && (
                        <p className="text-rose-600 font-semibold mt-1">Error: {log.errorMessage}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
};

export default GenerationHistory;

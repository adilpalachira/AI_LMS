import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { getQuizById } from '../../services/assessmentService';
import {
  Eye,
  CheckCircle,
  Clock,
  Award,
  BookOpen,
  ArrowLeft,
  AlertCircle,
  Sparkles
} from 'lucide-react';

const QuizPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAnswerKey, setShowAnswerKey] = useState(true);

  useEffect(() => {
    fetchQuizDetails();
  }, [id]);

  const fetchQuizDetails = async () => {
    try {
      setLoading(true);
      const res = await getQuizById(id);
      setQuiz(res.data || res);
    } catch (err) {
      setError('Failed to load quiz details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-8 text-center text-xs text-gray-400">Loading quiz preview...</main>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-8 text-center text-xs text-rose-600">{error || 'Quiz not found'}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto space-y-8">
          
          {/* Header */}
          <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 md:p-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Back
              </button>

              <button
                onClick={() => setShowAnswerKey(!showAnswerKey)}
                className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
                  showAnswerKey
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                <Eye size={14} />
                {showAnswerKey ? 'Answer Key Mode: Visible' : 'Student Mode: Answers Hidden'}
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                  {quiz.courseId?.title || 'Course'}
                </span>
                {quiz.aiGenerated && (
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100 flex items-center gap-1">
                    <Sparkles size={12} /> AI Generated
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                {quiz.title}
              </h1>
              {quiz.description && <p className="text-xs text-gray-500">{quiz.description}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-semibold text-gray-600 border-t border-gray-100">
              <span className="flex items-center gap-1.5"><Clock size={15} className="text-gray-400" /> {quiz.durationMinutes} mins</span>
              <span className="flex items-center gap-1.5"><Award size={15} className="text-gray-400" /> Pass: {quiz.passingMarks}%</span>
              <span className="flex items-center gap-1.5"><BookOpen size={15} className="text-gray-400" /> {quiz.questions?.length || 0} Questions</span>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-4">
            {(quiz.questions || []).map((q, idx) => (
              <div key={q._id || idx} className="bg-white border border-gray-200/80 rounded-[20px] p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500">Question {idx + 1}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                      {q.type}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                      {q.marks || 1} Marks
                    </span>
                  </div>
                </div>

                <p className="text-sm font-bold text-gray-900 leading-snug">
                  {q.question}
                </p>

                {Array.isArray(q.options) && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = showAnswerKey && String(opt).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
                      return (
                        <div
                          key={oIdx}
                          className={`text-xs p-3 rounded-xl border flex items-center justify-between ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold'
                              : 'bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                        >
                          <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                          {isCorrect && <CheckCircle size={15} className="text-emerald-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {showAnswerKey && (!q.options || q.options.length === 0) && (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs space-y-1">
                    <p className="font-bold text-emerald-900">Correct Answer / Model Answer:</p>
                    <p className="text-emerald-800">{String(q.correctAnswer)}</p>
                  </div>
                )}

                {showAnswerKey && q.explanation && (
                  <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-150 leading-relaxed italic">
                    💡 <span className="font-semibold not-italic">Explanation:</span> {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  );
};

export default QuizPreview;

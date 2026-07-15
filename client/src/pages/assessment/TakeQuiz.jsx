import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Timer from '../../components/assessment/Timer';
import ScoreBadge from '../../components/assessment/ScoreBadge';
import { getQuizById, submitQuizAttempt } from '../../services/assessmentService';
import {
  HelpCircle, CheckCircle2, AlertCircle, PlayCircle, ArrowLeft,
  ChevronLeft, ChevronRight, Award, Sparkles, Check, X
} from 'lucide-react';

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Result state after submission
  const [resultAttempt, setResultAttempt] = useState(null);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const res = await getQuizById(quizId);
      if (res.success) {
        setQuiz(res.data);
        setQuestions(res.data.questions || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const handleSelectOption = (qId, optionVal) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionVal
    }));
  };

  const handleFinalSubmit = async () => {
    if (submitting) return;

    const unansweredCount = questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      if (!window.confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`)) {
        return;
      }
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await submitQuizAttempt(quizId, answers);
      if (res.success) {
        setResultAttempt(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz attempt');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !quiz) {
    return (
      <DashboardLayout>
        <div className="bg-white border border-gray-200 rounded-[20px] p-12 text-center space-y-4 max-w-lg mx-auto">
          <AlertCircle size={40} className="mx-auto text-rose-500" />
          <h2 className="text-lg font-bold text-gray-900">{error || 'Quiz Not Found'}</h2>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // If Quiz Attempt completed, render Quiz Result Screen
  if (resultAttempt) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white border border-gray-200/80 p-8 rounded-[20px] shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
              <Award size={32} />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-gray-900">{quiz.title} - Quiz Result</h1>
              <p className="text-xs text-gray-500">Attempt submitted on {new Date(resultAttempt.submittedAt).toLocaleString()}</p>
            </div>

            <div className="flex justify-center pt-2">
              <ScoreBadge
                score={resultAttempt.score}
                maxScore={resultAttempt.maxScore}
                percentage={resultAttempt.percentage}
                passed={resultAttempt.passed}
              />
            </div>

            <div className="pt-4 border-t border-gray-150 flex justify-center">
              <Link
                to={`/courses/${quiz.courseId?._id || quiz.courseId}`}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Return to Course
              </Link>
            </div>
          </div>

          {/* AI Prep Summary Banner */}
          <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 border border-blue-100 p-6 rounded-[20px] flex items-center gap-4">
            <div className="p-3 bg-white text-blue-600 rounded-2xl border border-blue-100 shadow-2xs shrink-0">
              <Sparkles size={24} className="text-blue-600 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-gray-900">AI Assessment Analytics Ready</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Skill gap analysis, personalized revision planners, and AI tutoring recommendations based on your score will unlock under Module 6.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const currentQ = questions[currentQIndex];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Bar with Countdown Timer */}
        <div className="bg-white border border-gray-200/80 p-6 rounded-[20px] shadow-xs flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">{quiz.title}</h1>
            <p className="text-xs text-gray-500">
              Question {currentQIndex + 1} of {questions.length}
            </p>
          </div>

          <Timer durationMinutes={quiz.durationMinutes || 30} onTimeUp={handleFinalSubmit} />
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-200"
            style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Active Question Display */}
        {currentQ && (
          <div className="bg-white border border-gray-200/80 p-6 sm:p-8 rounded-[20px] shadow-xs space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-150">
                  {currentQ.type}
                </span>
                <span className="text-xs text-gray-400 font-mono font-semibold">
                  {currentQ.marks || 1} Mark{currentQ.marks > 1 ? 's' : ''}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                {currentQ.question}
              </h3>
            </div>

            {/* Answer Options */}
            {currentQ.type === 'Multiple Choice' && currentQ.options?.length > 0 && (
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = answers[currentQ._id] === opt;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectOption(currentQ._id, opt)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-500 ring-1 ring-blue-500/20 text-blue-900 font-bold'
                          : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700 font-medium'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check size={12} />}
                      </div>
                      <span className="text-xs">{opt}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {currentQ.type === 'True/False' && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                {['True', 'False'].map((val) => {
                  const isSelected = answers[currentQ._id] === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleSelectOption(currentQ._id, val)}
                      className={`p-5 rounded-2xl border font-bold text-sm text-center transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            )}

            {(currentQ.type === 'Short Answer' || currentQ.type === 'Essay') && (
              <div className="pt-2">
                <textarea
                  rows={4}
                  placeholder="Type your answer here..."
                  value={answers[currentQ._id] || ''}
                  onChange={(e) => handleSelectOption(currentQ._id, e.target.value)}
                  className="premium-input text-xs"
                />
              </div>
            )}

            {/* Question Navigation Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-150">
              <button
                type="button"
                onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQIndex === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              {currentQIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  Next Question <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  Submit Quiz Attempt
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TakeQuiz;

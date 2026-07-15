import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Breadcrumb from '../../components/content/Breadcrumb';
import QuestionEditor from '../../components/assessment/QuestionEditor';
import EmptyState from '../../components/content/EmptyState';
import ConfirmationModal from '../../components/content/ConfirmationModal';
import { getQuizById, createQuestion, updateQuestion, deleteQuestion } from '../../services/assessmentService';
import {
  Plus, HelpCircle, CheckCircle2, AlertCircle, Edit3, Trash2, Layers, Award
} from 'lucide-react';

const QuizQuestionBuilder = () => {
  const { id: quizId } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editor states
  const [showEditor, setShowEditor] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, question: null });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchQuizAndQuestions = async () => {
    setLoading(true);
    try {
      const res = await getQuizById(quizId);
      if (res.success) {
        setQuiz(res.data);
        setQuestions(res.data.questions || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quiz questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizAndQuestions();
  }, [quizId]);

  const handleOpenCreate = () => {
    setEditingQuestion(null);
    setShowEditor(true);
  };

  const handleOpenEdit = (q) => {
    setEditingQuestion(q);
    setShowEditor(true);
  };

  const handleSaveQuestion = async (payload) => {
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion._id, payload);
        setSuccess('Question updated successfully!');
      } else {
        await createQuestion({ ...payload, quizId });
        setSuccess('Question added successfully!');
      }

      setShowEditor(false);
      fetchQuizAndQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save question');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal.question) return;
    setActionLoading(true);
    try {
      await deleteQuestion(confirmModal.question._id);
      setSuccess('Question deleted successfully!');
      setConfirmModal({ isOpen: false, question: null });
      fetchQuizAndQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete question');
    } finally {
      setActionLoading(false);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: 'Manage Courses', to: '/manage-courses' },
            { label: 'Manage Quizzes', to: `/courses/${quiz?.courseId?._id || quiz?.courseId}/quizzes` },
            { label: 'Question Bank Builder' }
          ]}
        />

        <div className="bg-white border border-gray-200/80 p-6 sm:p-8 rounded-[20px] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-150 font-mono">
              Question Bank
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {quiz?.title}
            </h1>
            <p className="text-xs text-gray-500">
              Construct Multiple Choice, True/False, and Essay questions. Questions are automatically scored during student quiz attempts.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <Plus size={16} /> Add Question
          </button>
        </div>

        {success && (
          <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess('')} className="text-emerald-600 hover:text-emerald-900">&times;</button>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-rose-600 hover:text-rose-900">&times;</button>
          </div>
        )}

        {/* Question Editor Form Container */}
        {showEditor && (
          <QuestionEditor
            initialData={editingQuestion}
            onSave={handleSaveQuestion}
            onCancel={() => setShowEditor(false)}
            loading={actionLoading}
          />
        )}

        {/* Questions List */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle size={18} className="text-blue-600" />
            Questions in Quiz ({questions.length})
          </h3>

          {questions.length > 0 ? (
            questions.map((q, idx) => (
              <div key={q._id} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 border border-blue-150 flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-gray-900">{q.type}</span>
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        {q.marks || 1} Mark{q.marks > 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-800 pt-1">{q.question}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(q)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmModal({ isOpen: true, question: q })}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Options preview */}
                {q.type === 'Multiple Choice' && q.options?.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = String(q.correctAnswer).trim() === String(opt).trim();
                      return (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-xl text-xs font-medium border ${
                            isCorrect ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold' : 'bg-gray-50 text-gray-600 border-gray-150'
                          }`}
                        >
                          {opt} {isCorrect && '✓'}
                        </div>
                      );
                    })}
                  </div>
                )}

                {(q.type === 'True/False' || q.type === 'Short Answer') && (
                  <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-150">
                    Correct Answer: <span className="font-bold">{String(q.correctAnswer)}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <EmptyState
              icon={HelpCircle}
              title="No Questions in Question Bank"
              description="Click 'Add Question' to create Multiple Choice or True/False questions for this quiz."
            />
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, question: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Question?"
        message="Are you sure you want to delete this question from the quiz?"
        loading={actionLoading}
      />
    </DashboardLayout>
  );
};

export default QuizQuestionBuilder;

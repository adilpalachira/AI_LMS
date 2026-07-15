import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Breadcrumb from '../../components/content/Breadcrumb';
import QuizCard from '../../components/assessment/QuizCard';
import EmptyState from '../../components/content/EmptyState';
import ConfirmationModal from '../../components/content/ConfirmationModal';
import { getCourseById } from '../../services/courseService';
import {
  getQuizzesByCourse, createQuiz, updateQuiz, deleteQuiz
} from '../../services/assessmentService';
import {
  Plus, HelpCircle, CheckCircle2, AlertCircle, Clock, Award, X, Sparkles
} from 'lucide-react';

const ManageQuizzes = () => {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    durationMinutes: 30,
    passingMarks: 50,
    maxAttempts: 1,
    shuffleQuestions: false,
    shuffleOptions: false,
    status: 'Published'
  });

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, quiz: null });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchQuizzesData = async () => {
    setLoading(true);
    try {
      const courseRes = await getCourseById(courseId);
      if (courseRes.success) setCourse(courseRes.data);

      const quizRes = await getQuizzesByCourse(courseId);
      if (quizRes.success) setQuizzes(quizRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzesData();
  }, [courseId]);

  const handleOpenCreate = () => {
    setEditingQuiz(null);
    setForm({
      title: '',
      description: '',
      durationMinutes: 30,
      passingMarks: 50,
      maxAttempts: 1,
      shuffleQuestions: false,
      shuffleOptions: false,
      status: 'Published'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (quiz) => {
    setEditingQuiz(quiz);
    setForm({
      title: quiz.title,
      description: quiz.description || '',
      durationMinutes: quiz.durationMinutes || 30,
      passingMarks: quiz.passingMarks || 50,
      maxAttempts: quiz.maxAttempts || 1,
      shuffleQuestions: quiz.shuffleQuestions || false,
      shuffleOptions: quiz.shuffleOptions || false,
      status: quiz.status || 'Published'
    });
    setModalOpen(true);
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...form,
        courseId,
        durationMinutes: parseInt(form.durationMinutes) || 30,
        passingMarks: parseInt(form.passingMarks) || 50,
        maxAttempts: parseInt(form.maxAttempts) || 1
      };

      if (editingQuiz) {
        await updateQuiz(editingQuiz._id, payload);
        setSuccess('Quiz settings updated successfully!');
      } else {
        await createQuiz(payload);
        setSuccess('Quiz created successfully!');
      }

      setModalOpen(false);
      fetchQuizzesData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save quiz');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal.quiz) return;
    setActionLoading(true);
    try {
      await deleteQuiz(confirmModal.quiz._id);
      setSuccess('Quiz deleted successfully!');
      setConfirmModal({ isOpen: false, quiz: null });
      fetchQuizzesData();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete operation failed');
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
            { label: course?.title || 'Course Overview', to: `/courses/${courseId}` },
            { label: 'Manage Quizzes' }
          ]}
        />

        <div className="bg-white border border-gray-200/80 p-6 sm:p-8 rounded-[20px] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Quizzes & Assessments ({quizzes.length})
            </h1>
            <p className="text-xs text-gray-500 max-w-xl">
              Create timed quizzes, configure Question Banks, set passing percentages, and allow automated grading for students.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <Plus size={16} /> Create Quiz
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

        {/* Quizzes List */}
        <div className="space-y-4">
          {quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <QuizCard
                key={quiz._id}
                quiz={quiz}
                userRole="Faculty"
                canManage={true}
                onEdit={handleOpenEdit}
                onDelete={(q) => setConfirmModal({ isOpen: true, quiz: q })}
              />
            ))
          ) : (
            <EmptyState
              icon={HelpCircle}
              title="No Quizzes Configured Yet"
              description="Click 'Create Quiz' to setup a timed test for your students."
              actionButton={
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                >
                  <Plus size={16} /> Create Quiz Now
                </button>
              }
            />
          )}
        </div>
      </div>

      {/* CREATE / EDIT QUIZ MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-[20px] shadow-2xl max-w-lg w-full p-6 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-gray-150 pb-4">
              <h3 className="text-base font-bold text-gray-900">
                {editingQuiz ? 'Edit Quiz Settings' : 'Create New Quiz'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Quiz Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Quiz: Database Indexing"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="premium-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of quiz coverage..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="premium-input text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                    className="premium-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Passing %</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={form.passingMarks}
                    onChange={(e) => setForm({ ...form, passingMarks: e.target.value })}
                    className="premium-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Max Attempts</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.maxAttempts}
                    onChange={(e) => setForm({ ...form, maxAttempts: e.target.value })}
                    className="premium-input text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.shuffleQuestions}
                    onChange={(e) => setForm({ ...form, shuffleQuestions: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  Shuffle Question Order
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2"
                >
                  {actionLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  Save Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, quiz: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Quiz?"
        message={`Deleting "${confirmModal.quiz?.title}" will permanently delete all questions and student attempt history.`}
        loading={actionLoading}
      />
    </DashboardLayout>
  );
};

export default ManageQuizzes;

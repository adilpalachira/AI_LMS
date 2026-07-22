import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import {
  getQuestionBank,
  approveQuestionBankItem,
  archiveQuestionBankItem,
  deleteQuestion,
  updateQuestion,
  getQuizzesByCourse,
  addBankQuestionsToQuiz
} from '../../services/assessmentService';
import { getCourses } from '../../services/courseService';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Archive,
  Sparkles,
  Plus,
  ArrowRight,
  Layers,
  Award,
  CheckSquare
} from 'lucide-react';

const QuestionBank = () => {
  const navigate = useNavigate();

  // Filter states
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [filterCourse, setFilterCourse] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Main data states
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Bulk Quiz Add states
  const [selectedIds, setSelectedIds] = useState([]);
  const [targetQuizId, setTargetQuizId] = useState('');
  const [showAddToQuizModal, setShowAddToQuizModal] = useState(false);

  // Edit inline states
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [filterCourse, filterDifficulty, filterType, filterStatus]);

  const fetchCourses = async () => {
    try {
      const res = await getCourses();
      setCourses(res.data || res || []);
    } catch (err) {
      console.error('Failed to load courses:', err);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        courseId: filterCourse || undefined,
        difficulty: filterDifficulty || undefined,
        type: filterType || undefined,
        status: filterStatus || undefined,
        search: searchQuery.trim() || undefined
      };
      const res = await getQuestionBank(params);
      const items = res.data || res || [];
      setQuestions(items);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load Question Bank.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  // Toggle checkbox select
  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === questions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(questions.map(q => q._id));
    }
  };

  // Status Change Actions
  const handleApprove = async (id) => {
    try {
      await approveQuestionBankItem(id);
      setSuccess('Question approved successfully!');
      fetchQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve question.');
    }
  };

  const handleArchive = async (id) => {
    try {
      await archiveQuestionBankItem(id);
      setSuccess('Question archived successfully!');
      fetchQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to archive question.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await deleteQuestion(id);
      setSuccess('Question deleted successfully.');
      fetchQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete question.');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (q) => {
    setEditingQuestion(q);
    setEditFormData({ ...q });
  };

  const handleSaveEdit = async () => {
    if (!editingQuestion) return;
    try {
      await updateQuestion(editingQuestion._id, editFormData);
      setSuccess('Question updated successfully.');
      setEditingQuestion(null);
      fetchQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update question.');
    }
  };

  // Add to Quiz Modal Handler
  const handleOpenAddToQuizModal = async () => {
    if (selectedIds.length === 0) {
      setError('Please select at least one question to add to a quiz.');
      return;
    }
    if (!filterCourse) {
      setError('Please select a Course filter first to view its available quizzes.');
      return;
    }

    try {
      const res = await getQuizzesByCourse(filterCourse);
      const quizList = res.data || res || [];
      setQuizzes(quizList);
      if (quizList.length > 0) setTargetQuizId(quizList[0]._id);
      setShowAddToQuizModal(true);
    } catch (err) {
      setError('Failed to load course quizzes.');
    }
  };

  const handleConfirmAddToQuiz = async () => {
    if (!targetQuizId) {
      setError('Please select a target quiz.');
      return;
    }

    try {
      setLoading(true);
      await addBankQuestionsToQuiz(targetQuizId, selectedIds);
      setSuccess(`Successfully added ${selectedIds.length} question(s) to the selected quiz!`);
      setShowAddToQuizModal(false);
      setSelectedIds([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add questions to quiz.');
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
          
          {/* Header Banner */}
          <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                <BookOpen size={14} />
                Smart Question Repository
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                Smart Question Bank
              </h1>
              <p className="text-xs md:text-sm text-gray-500 max-w-2xl leading-relaxed">
                Centralized question repository. Filter by course, lesson, difficulty, and type. Review AI-generated items, approve questions, and reuse them across quizzes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/ai-quiz-generator')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                <Sparkles size={15} />
                AI Generator
              </button>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-3">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-3">
              <CheckCircle size={16} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* FILTERS & SEARCH BAR */}
          <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 space-y-4 shadow-sm">
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions, explanations, or sources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-xl pl-10 pr-4 py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              <button
                type="submit"
                className="bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold px-6 py-3 rounded-xl transition-all shadow-sm shrink-0"
              >
                Search
              </button>
            </form>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-gray-100">
              {/* Filter Course */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Course</label>
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-xl p-2.5 font-medium"
                >
                  <option value="">All Courses</option>
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>

              {/* Filter Difficulty */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Difficulty</label>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-xl p-2.5 font-medium"
                >
                  <option value="">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              {/* Filter Type */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Question Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-xl p-2.5 font-medium"
                >
                  <option value="">All Types</option>
                  <option value="MCQ">MCQ / Multiple Choice</option>
                  <option value="True/False">True / False</option>
                  <option value="Short Answer">Short Answer</option>
                  <option value="Descriptive">Descriptive / Essay</option>
                </select>
              </div>

              {/* Filter Status */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-xl p-2.5 font-medium"
                >
                  <option value="">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Generated">Generated</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* BULK ACTION BAR & QUESTION LIST */}
          <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={questions.length > 0 && selectedIds.length === questions.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-gray-700">
                  Select All ({selectedIds.length} of {questions.length} selected)
                </span>
              </div>

              {selectedIds.length > 0 && (
                <button
                  onClick={handleOpenAddToQuizModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  Add Selected to Quiz ({selectedIds.length})
                </button>
              )}
            </div>

            {/* Questions Table / Cards */}
            {loading ? (
              <div className="py-12 text-center text-xs text-gray-400">Loading Question Bank...</div>
            ) : questions.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">No questions found matching your filter criteria.</div>
            ) : (
              <div className="space-y-4">
                {questions.map((q) => (
                  <div
                    key={q._id}
                    className={`border rounded-2xl p-5 transition-all space-y-3 ${
                      selectedIds.includes(q._id)
                        ? 'border-blue-300 bg-blue-50/20 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(q._id)}
                          onChange={() => toggleSelect(q._id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                          {q.type}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          q.difficulty === 'Hard' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {q.difficulty}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          q.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          q.status === 'Archived' ? 'bg-gray-100 text-gray-600 border-gray-300' :
                          'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {q.status}
                        </span>
                        {q.isAiGenerated && (
                          <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Sparkles size={10} /> AI Generated
                          </span>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        {q.status !== 'Approved' && (
                          <button
                            onClick={() => handleApprove(q._id)}
                            title="Approve Question"
                            className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {q.status !== 'Archived' && (
                          <button
                            onClick={() => handleArchive(q._id)}
                            title="Archive Question"
                            className="p-1.5 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                          >
                            <Archive size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(q)}
                          title="Edit Question"
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(q._id)}
                          title="Delete Question"
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Question Content */}
                    <div className="pl-6 space-y-2">
                      <p className="text-sm font-bold text-gray-900 leading-snug">
                        {q.question}
                      </p>

                      {Array.isArray(q.options) && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt, oIdx) => {
                            const isCorrect = String(opt).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
                            return (
                              <div
                                key={oIdx}
                                className={`text-xs p-2.5 rounded-xl border flex items-center justify-between ${
                                  isCorrect
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                                    : 'bg-white border-gray-200 text-gray-700'
                                }`}
                              >
                                <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                                {isCorrect && <CheckCircle size={14} className="text-emerald-600 shrink-0" />}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {(!q.options || q.options.length === 0) && (
                        <div className="bg-emerald-50/70 border border-emerald-200/80 p-3 rounded-xl text-xs space-y-1">
                          <p className="font-bold text-emerald-900">Correct Answer:</p>
                          <p className="text-emerald-800">{String(q.correctAnswer)}</p>
                        </div>
                      )}

                      {q.explanation && (
                        <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-150 leading-relaxed italic">
                          💡 <span className="font-semibold not-italic">Explanation:</span> {q.explanation}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-gray-400 font-medium">
                        {q.courseId && <span>Course: <strong className="text-gray-600">{q.courseId.title}</strong></span>}
                        <span>Source: <strong className="text-gray-600">{q.source || 'Manual Input'}</strong></span>
                        <span>Marks: <strong className="text-gray-600">{q.marks || 1}</strong></span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

          {/* EDIT QUESTION MODAL */}
          {editingQuestion && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-xl border border-gray-100">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-gray-900">Edit Question Bank Item</h3>
                  <button
                    onClick={() => setEditingQuestion(null)}
                    className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-700">Question Text</label>
                    <textarea
                      rows={3}
                      value={editFormData.question || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, question: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>

                  {Array.isArray(editFormData.options) && editFormData.options.length > 0 && (
                    <div className="space-y-2">
                      <label className="font-semibold text-gray-700">Options</label>
                      {editFormData.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <span className="font-bold text-gray-400 w-4">{String.fromCharCode(65 + oIdx)}.</span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOpt = [...editFormData.options];
                              newOpt[oIdx] = e.target.value;
                              setEditFormData({ ...editFormData, options: newOpt });
                            }}
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-2 font-medium text-gray-900"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-700">Correct Answer</label>
                    <input
                      type="text"
                      value={editFormData.correctAnswer || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, correctAnswer: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-medium text-gray-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-700">Explanation</label>
                    <textarea
                      rows={2}
                      value={editFormData.explanation || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, explanation: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-medium text-gray-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setEditingQuestion(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ADD TO QUIZ MODAL */}
          {showAddToQuizModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl border border-gray-100">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-gray-900">Add Selected Questions to Quiz</h3>
                  <button
                    onClick={() => setShowAddToQuizModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <p className="text-gray-600">
                    You have selected <strong>{selectedIds.length} question(s)</strong> to attach to a quiz.
                  </p>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-700">Target Quiz *</label>
                    <select
                      value={targetQuizId}
                      onChange={(e) => setTargetQuizId(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-xl p-3 font-medium"
                    >
                      {quizzes.map(qz => (
                        <option key={qz._id} value={qz._id}>
                          {qz.title} ({qz.status})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setShowAddToQuizModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAddToQuiz}
                    disabled={loading || !targetQuizId}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? 'Adding...' : 'Confirm & Add'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default QuestionBank;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import {
  getCourses,
  getCourseById
} from '../../services/courseService';
import {
  generateAiQuestions,
  bulkSaveQuestions,
  createQuiz
} from '../../services/assessmentService';
import {
  Sparkles,
  BrainCircuit,
  BookOpen,
  FileText,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  RefreshCw,
  Plus,
  ArrowRight,
  Layers,
  Award,
  Save,
  Send,
  Eye,
  CheckSquare
} from 'lucide-react';

const AIQuizGenerator = () => {
  const navigate = useNavigate();

  // Selection states
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [sections, setSections] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [topic, setTopic] = useState('');
  const [questionType, setQuestionType] = useState('MCQ');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(5);

  // Quiz creation modal states
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDuration, setQuizDuration] = useState(30);
  const [quizPassingMarks, setQuizPassingMarks] = useState(50);
  const [showQuizModal, setShowQuizModal] = useState(false);

  // Operational states
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Fetch faculty courses on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await getCourses();
      const courseList = res.data || res || [];
      setCourses(courseList);
      if (courseList.length > 0) {
        handleCourseChange(courseList[0]._id);
      }
    } catch (err) {
      setError('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = async (cId) => {
    setSelectedCourseId(cId);
    setSelectedLessonId('');
    setSelectedMaterialId('');
    if (!cId) return;

    try {
      const res = await getCourseById(cId);
      const courseObj = res.data || res;
      setSections(courseObj.sections || []);
      
      // Flatten lessons & materials
      const allL = [];
      const allM = [];
      (courseObj.sections || []).forEach(sec => {
        (sec.lessons || []).forEach(les => {
          allL.push(les);
          if (Array.isArray(les.materials)) {
            allM.push(...les.materials);
          }
        });
      });
      setLessons(allL);
      setMaterials(allM);
    } catch (err) {
      console.error('Failed to load course details:', err);
    }
  };

  // Generate Questions via AI
  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!selectedCourseId) {
      setError('Please select a course to generate questions for.');
      return;
    }

    try {
      setGenerating(true);
      setError('');
      setSuccess('');
      setGeneratedQuestions([]);

      const payload = {
        courseId: selectedCourseId,
        lessonId: selectedLessonId || undefined,
        materialId: selectedMaterialId || undefined,
        topic: topic.trim() || undefined,
        questionType,
        difficulty,
        questionCount: Number(questionCount)
      };

      const res = await generateAiQuestions(payload);
      const questionsData = res.data?.questions || res.questions || [];

      if (questionsData.length === 0) {
        setError('No questions were returned by AI. Please check if learning material text exists.');
        return;
      }

      setGeneratedQuestions(questionsData);
      setSelectedIndices(questionsData.map((_, idx) => idx)); // select all by default
      setSuccess(`Successfully generated ${questionsData.length} AI questions! Review them below.`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'AI Question Generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  // Toggle single item selection
  const toggleSelect = (idx) => {
    if (selectedIndices.includes(idx)) {
      setSelectedIndices(selectedIndices.filter(i => i !== idx));
    } else {
      setSelectedIndices([...selectedIndices, idx]);
    }
  };

  // Delete question from review list
  const handleDeleteQuestion = (idx) => {
    const updated = generatedQuestions.filter((_, i) => i !== idx);
    setGeneratedQuestions(updated);
    setSelectedIndices(selectedIndices.filter(i => i !== idx).map(i => i > idx ? i - 1 : i));
  };

  // Open edit modal/form
  const handleStartEdit = (idx) => {
    setEditingIndex(idx);
    setEditFormData({ ...generatedQuestions[idx] });
  };

  // Save edit changes
  const handleSaveEdit = () => {
    if (editingIndex === null) return;
    const updated = [...generatedQuestions];
    updated[editingIndex] = { ...editFormData };
    setGeneratedQuestions(updated);
    setEditingIndex(null);
    setEditFormData({});
  };

  // Save Approved questions to Question Bank
  const handleApproveAndSaveBank = async () => {
    if (selectedIndices.length === 0) {
      setError('Please select at least one question to approve and save.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const targetQuestions = selectedIndices.map(idx => ({
        ...generatedQuestions[idx],
        status: 'Approved'
      }));

      await bulkSaveQuestions({
        questions: targetQuestions,
        courseId: selectedCourseId,
        status: 'Approved'
      });

      setSuccess('Selected questions approved and saved to the Smart Question Bank!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save questions to Question Bank.');
    } finally {
      setLoading(false);
    }
  };

  // Open Quiz Publishing Modal
  const handleOpenPublishModal = () => {
    if (selectedIndices.length === 0) {
      setError('Please select at least one question to include in the quiz.');
      return;
    }
    const targetCourse = courses.find(c => c._id === selectedCourseId);
    setQuizTitle(`${targetCourse ? targetCourse.title : 'Course'} Quiz – ${topic || questionType}`);
    setShowQuizModal(true);
  };

  // Create Quiz & Publish
  const handlePublishQuiz = async (e) => {
    e.preventDefault();
    if (!quizTitle.trim()) {
      setError('Quiz title is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // 1. Create Quiz
      const quizRes = await createQuiz({
        courseId: selectedCourseId,
        title: quizTitle.trim(),
        durationMinutes: Number(quizDuration),
        passingMarks: Number(quizPassingMarks),
        status: 'Published',
        aiGenerated: true,
        aiTopic: topic || questionType
      });

      const newQuiz = quizRes.data || quizRes;

      // 2. Save Questions tied to this Quiz
      const targetQuestions = selectedIndices.map(idx => ({
        ...generatedQuestions[idx],
        quizId: newQuiz._id,
        status: 'Approved'
      }));

      await bulkSaveQuestions({
        questions: targetQuestions,
        quizId: newQuiz._id,
        courseId: selectedCourseId,
        status: 'Approved'
      });

      setShowQuizModal(false);
      setSuccess('Quiz created, questions attached, and published successfully!');
      setTimeout(() => {
        navigate(`/courses/${selectedCourseId}/quizzes`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish quiz.');
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
                <Sparkles size={14} />
                Module 7 – Smart Assessment Architecture
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                AI Quiz Generator
              </h1>
              <p className="text-xs md:text-sm text-gray-500 max-w-2xl leading-relaxed">
                Generate course-grounded questions directly from uploaded materials using RAG context retrieval and OpenAI structured JSON generation. Review, edit, approve, and publish instantly.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/question-bank')}
                className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                <BookOpen size={15} />
                Question Bank
              </button>
            </div>
          </div>

          {/* Feedback alerts */}
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

          {/* GENERATION CONFIGURATION FORM */}
          <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <BrainCircuit className="text-blue-600" size={20} />
              <h2 className="text-base font-bold text-gray-900">Quiz Generation Parameters</h2>
            </div>

            <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Select Course */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Course *</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-xl p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  required
                >
                  <option value="">-- Select Course --</option>
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.code ? `${c.code}: ` : ''}{c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Lesson */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Lesson (Optional)</label>
                <select
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-xl p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                >
                  <option value="">-- Entire Course --</option>
                  {lessons.map(l => (
                    <option key={l._id} value={l._id}>
                      {l.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Material */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Learning Material (Optional)</label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-xl p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                >
                  <option value="">-- All Materials --</option>
                  {materials.map(m => (
                    <option key={m._id} value={m._id}>
                      📄 {m.fileName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specific Focus Topic */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Topic / Sub-topic Focus</label>
                <input
                  type="text"
                  placeholder="e.g. Database Normalization 2NF & 3NF"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-xl p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              {/* Question Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Question Type *</label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-xl p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                >
                  <option value="MCQ">Multiple Choice (MCQ)</option>
                  <option value="True/False">True / False</option>
                  <option value="Short Answer">Short Answer</option>
                  <option value="Descriptive">Descriptive / Essay</option>
                </select>
              </div>

              {/* Difficulty Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Difficulty Level *</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-xl p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              {/* Number of Questions */}
              <div className="space-y-1.5 md:col-span-3 flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-gray-700 shrink-0">Number of Questions:</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="w-24 bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-xl p-2.5 text-center font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                  <span className="text-[11px] text-gray-400 font-medium">(Max 20 per request)</span>
                </div>

                <button
                  type="submit"
                  disabled={generating || !selectedCourseId}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs px-8 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 shrink-0"
                >
                  {generating ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Analyzing Material & Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate Questions
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* GENERATED QUESTIONS REVIEW PANEL */}
          {generatedQuestions.length > 0 && (
            <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 md:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <CheckSquare size={18} className="text-blue-600" />
                    Faculty Review & Verification ({selectedIndices.length} / {generatedQuestions.length} selected)
                  </h2>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    Review AI-generated questions before approving or publishing to students.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleApproveAndSaveBank}
                    disabled={loading || selectedIndices.length === 0}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Save size={14} />
                    Approve to Question Bank
                  </button>

                  <button
                    onClick={handleOpenPublishModal}
                    disabled={loading || selectedIndices.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Send size={14} />
                    Create Quiz & Publish
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {generatedQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-2xl p-5 transition-all space-y-3 ${
                      selectedIndices.includes(idx)
                        ? 'border-blue-300 bg-blue-50/20 shadow-sm'
                        : 'border-gray-200 bg-gray-50/50 opacity-75'
                    }`}
                  >
                    {/* Header bar */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={selectedIndices.includes(idx)}
                          onChange={() => toggleSelect(idx)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-gray-500">Q{idx + 1}.</span>
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
                        {q.isAiGenerated && (
                          <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Sparkles size={10} /> AI Generated
                          </span>
                        )}
                        {q.isDuplicate && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                            ⚠️ Similar Existing Question
                          </span>
                        )}
                      </div>

                      {/* Action icons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEdit(idx)}
                          title="Edit Question"
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(idx)}
                          title="Delete Question"
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Question text */}
                    <div className="pl-7 space-y-2">
                      <p className="text-sm font-bold text-gray-900 leading-snug">
                        {q.question}
                      </p>

                      {/* MCQ / TrueFalse Options */}
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

                      {/* Correct Answer for Short Answer / Essay */}
                      {(!q.options || q.options.length === 0) && (
                        <div className="bg-emerald-50/70 border border-emerald-200/80 p-3 rounded-xl text-xs space-y-1">
                          <p className="font-bold text-emerald-900">Model Answer:</p>
                          <p className="text-emerald-800">{String(q.correctAnswer)}</p>
                        </div>
                      )}

                      {/* Explanation */}
                      {q.explanation && (
                        <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-150 leading-relaxed italic">
                          💡 <span className="font-semibold not-italic">Explanation:</span> {q.explanation}
                        </p>
                      )}

                      {/* Source attribution footer */}
                      <div className="flex items-center gap-4 pt-1 text-[11px] text-gray-400 font-medium">
                        <span>Source: <strong className="text-gray-600">{q.source || 'Course Material'}</strong></span>
                        {q.sourcePage && <span>Page: <strong className="text-gray-600">{q.sourcePage}</strong></span>}
                        <span>Marks: <strong className="text-gray-600">{q.marks || 1}</strong></span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* EDIT QUESTION MODAL */}
          {editingIndex !== null && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-xl border border-gray-100">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-gray-900">Edit Generated Question</h3>
                  <button
                    onClick={() => setEditingIndex(null)}
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
                    onClick={() => setEditingIndex(null)}
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

          {/* CREATE & PUBLISH QUIZ MODAL */}
          {showQuizModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl border border-gray-100">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-gray-900">Publish Quiz to Students</h3>
                  <button
                    onClick={() => setShowQuizModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handlePublishQuiz} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-700">Quiz Title *</label>
                    <input
                      type="text"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-gray-700">Duration (Minutes)</label>
                      <input
                        type="number"
                        min="1"
                        value={quizDuration}
                        onChange={(e) => setQuizDuration(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-medium text-gray-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-gray-700">Passing Marks (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={quizPassingMarks}
                        onChange={(e) => setQuizPassingMarks(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-medium text-gray-900"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 bg-blue-50 p-3 rounded-xl border border-blue-100">
                    This will create a new published quiz containing <strong>{selectedIndices.length} approved questions</strong> for students enrolled in this course.
                  </p>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowQuizModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm"
                    >
                      {loading ? 'Publishing...' : 'Publish Quiz Now'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AIQuizGenerator;

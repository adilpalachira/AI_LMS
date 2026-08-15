import React, { useState, useEffect } from 'react';
import { X, Sparkles, Calendar, Clock, BookOpen, Target, AlertCircle } from 'lucide-react';

const StudyPlanFormModal = ({ isOpen, onClose, onSubmit, courses = [], loading }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultExamStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [courseId, setCourseId] = useState('');
  const [startDate, setStartDate] = useState(todayStr);
  const [examDate, setExamDate] = useState(defaultExamStr);
  const [availableHoursPerDay, setAvailableHoursPerDay] = useState(2);
  const [preferredStudyTime, setPreferredStudyTime] = useState('Evening');
  const [learningGoal, setLearningGoal] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (courses && courses.length > 0) {
      const first = courses[0];
      const id = first._id || first.id || first.course?._id || first.course;
      if (id && !courseId) {
        setCourseId(id);
      }
    }
  }, [courses, courseId]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!courseId) {
      setErrorMsg('Please select a target course from your enrolled courses.');
      return;
    }

    if (!startDate) {
      setErrorMsg('Please select a valid start date.');
      return;
    }

    if (!examDate) {
      setErrorMsg('Please select a valid exam / end date.');
      return;
    }

    if (new Date(examDate) < new Date(startDate)) {
      setErrorMsg('Exam / end date must be on or after the start date.');
      return;
    }

    const hours = Number(availableHoursPerDay);
    if (isNaN(hours) || hours < 0.5 || hours > 16) {
      setErrorMsg('Available study hours per day must be between 0.5 and 16 hours.');
      return;
    }

    onSubmit({
      courseId,
      startDate,
      examDate,
      availableHoursPerDay: hours,
      preferredStudyTime,
      learningGoal
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">Generate AI Study Plan</h3>
              <p className="text-xs text-gray-500">Personalized daily task allocations powered by AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Validation Error Banner */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select Course */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <BookOpen size={14} className="text-blue-600" />
              Target Course <span className="text-rose-500">*</span>
            </label>
            {courses.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium rounded-xl">
                No enrolled courses found. Please enroll in a course first to generate a study plan.
              </div>
            ) : (
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
              >
                <option value="" disabled>Select an enrolled course</option>
                {courses.map((c) => {
                  const targetId = c._id || c.id || c.course?._id || c.course;
                  const code = c.code || c.course?.code || '';
                  const title = c.title || c.course?.title || 'Course';
                  return (
                    <option key={targetId} value={targetId}>
                      {code ? `[${code}] ${title}` : title}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Date Range: Start Date & Exam Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-600" />
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-600" />
                Exam / End Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                required
                min={startDate || todayStr}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Grid: Hours & Preferred Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Clock size={14} className="text-blue-600" />
                Available Hours / Day <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="16"
                value={availableHoursPerDay}
                onChange={(e) => setAvailableHoursPerDay(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Clock size={14} className="text-blue-600" />
                Preferred Study Time
              </label>
              <select
                value={preferredStudyTime}
                onChange={(e) => setPreferredStudyTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
              >
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>
            </div>
          </div>

          {/* Learning Goal */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Target size={14} className="text-blue-600" />
              Learning Goal (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Achieve 90%+ score on final exam"
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
            />
          </div>

          {/* Footer CTAs */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || courses.length === 0}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Synthesizing AI Plan...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Generate AI Plan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudyPlanFormModal;

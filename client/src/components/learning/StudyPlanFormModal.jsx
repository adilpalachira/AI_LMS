import React, { useState } from 'react';
import { X, Sparkles, Calendar, Clock, BookOpen, Target } from 'lucide-react';

const StudyPlanFormModal = ({ isOpen, onClose, onSubmit, courses = [], loading }) => {
  const [courseId, setCourseId] = useState(courses[0]?._id || '');
  const [examDate, setExamDate] = useState('');
  const [availableHoursPerDay, setAvailableHoursPerDay] = useState(2);
  const [preferredStudyTime, setPreferredStudyTime] = useState('Evening');
  const [learningGoal, setLearningGoal] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!courseId || !examDate) return;
    onSubmit({
      courseId,
      examDate,
      availableHoursPerDay: Number(availableHoursPerDay),
      preferredStudyTime,
      learningGoal
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-6 relative">
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
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select Course */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <BookOpen size={14} className="text-blue-600" />
              Target Course
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
            >
              <option value="" disabled>Select a course</option>
              {courses.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.title || c.code}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Calendar size={14} className="text-blue-600" />
              Exam / Deadline Date
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
            />
          </div>

          {/* Grid: Hours & Preferred Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Clock size={14} className="text-blue-600" />
                Available Hours / Day
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="8"
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
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Synthesizing Plan...
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

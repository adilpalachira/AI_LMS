import React, { useState } from 'react';
import { Download, CheckCircle2, Clock, Award, FileText, User } from 'lucide-react';

const SubmissionCard = ({ submission, maxMarks = 100, onGrade }) => {
  const [marks, setMarks] = useState(submission.marks !== null ? submission.marks : '');
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [loading, setLoading] = useState(false);

  if (!submission) return null;

  const { studentId, fileUrl, fileName, fileSize, submittedAt, isLate, status } = submission;
  const fullFileUrl = fileUrl?.startsWith('http') ? fileUrl : `http://localhost:5000/${fileUrl?.replace(/^\/+/, '')}`;

  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    if (marks === '' || isNaN(marks)) {
      alert('Please enter valid marks');
      return;
    }
    setLoading(true);
    try {
      await onGrade(submission._id, { marks: parseFloat(marks), feedback });
    } catch (err) {
      alert(err.message || 'Failed to submit grade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-sm shrink-0">
            {studentId?.name?.charAt(0) || <User size={18} />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">{studentId?.name || 'Student'}</h4>
            <p className="text-xs text-gray-500">{studentId?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLate && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Late Submission
            </span>
          )}
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              status === 'Graded'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Submission Attachment */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <FileText size={18} className="text-blue-600 shrink-0" />
          <span className="text-xs font-bold text-gray-800 truncate">{fileName}</span>
        </div>
        <a
          href={fullFileUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-white border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-all"
        >
          <Download size={13} /> Download
        </a>
      </div>

      {/* Grading Form */}
      <form onSubmit={handleSubmitGrade} className="pt-2 border-t border-gray-150 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Score (Max {maxMarks})
            </label>
            <input
              type="number"
              min={0}
              max={maxMarks}
              step="0.5"
              required
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              placeholder={`0 - ${maxMarks}`}
              className="premium-input text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Faculty Remarks / Feedback
            </label>
            <input
              type="text"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback for student..."
              className="premium-input text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
          >
            {loading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            <span>{status === 'Graded' ? 'Update Grade' : 'Save Grade'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmissionCard;

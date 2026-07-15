import React from 'react';
import { Link } from 'react-router-dom';
import DeadlineBadge from './DeadlineBadge';
import { FileText, Award, Upload, CheckCircle2, Clock, Edit3, Trash2, Users } from 'lucide-react';

const AssignmentCard = ({ assignment, userRole, canManage = false, onEdit, onDelete }) => {
  if (!assignment) return null;

  const { _id, courseId, title, description, maxMarks, deadline, allowedFileTypes, mySubmission, submissionCount } = assignment;

  return (
    <div className="bg-white border border-gray-200/80 hover:border-gray-300 rounded-2xl p-5 sm:p-6 space-y-4 transition-all shadow-xs group">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {title}
            </h4>
            <DeadlineBadge deadline={deadline} />
          </div>
          {description && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{description}</p>
          )}
        </div>

        {canManage && (
          <div className="flex items-center gap-1 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(assignment)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit Assignment"
              >
                <Edit3 size={16} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(assignment)}
                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete Assignment"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-150 flex-wrap">
        <div className="flex items-center gap-4 text-xs font-semibold text-gray-600 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Award size={15} className="text-blue-600" />
            <span>{maxMarks} Max Marks</span>
          </div>

          {allowedFileTypes?.length > 0 && (
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-500">
              <FileText size={14} className="text-gray-400" />
              <span>{allowedFileTypes.join(', ').toUpperCase()}</span>
            </div>
          )}

          {userRole !== 'Student' && submissionCount !== undefined && (
            <div className="flex items-center gap-1.5 text-blue-600">
              <Users size={14} />
              <span>{submissionCount} Submissions</span>
            </div>
          )}
        </div>

        {/* Action Button for Student or Faculty */}
        <div>
          {userRole === 'Student' ? (
            mySubmission ? (
              mySubmission.status === 'Graded' ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                  <CheckCircle2 size={14} /> Graded: {mySubmission.marks} / {maxMarks}
                </div>
              ) : (
                <Link
                  to={`/assignments/${_id}/submit`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-xl transition-all"
                >
                  <CheckCircle2 size={14} /> Submitted ({mySubmission.status})
                </Link>
              )
            ) : (
              <Link
                to={`/assignments/${_id}/submit`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-all shadow-xs"
              >
                <Upload size={14} /> Submit Assignment
              </Link>
            )
          ) : (
            <Link
              to={`/assignments/${_id}/review`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-150 px-3.5 py-2 rounded-xl transition-all"
            >
              <span>Review Submissions</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentCard;

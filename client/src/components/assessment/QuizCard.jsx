import React from 'react';
import { Link } from 'react-router-dom';
import ScoreBadge from './ScoreBadge';
import { HelpCircle, Clock, Award, PlayCircle, Edit3, Trash2, Layers, CheckCircle2 } from 'lucide-react';

const QuizCard = ({ quiz, userRole, canManage = false, onEdit, onDelete }) => {
  if (!quiz) return null;

  const { _id, title, description, durationMinutes, passingMarks, maxAttempts, questionCount, attemptsCount, lastAttempt, canAttempt } = quiz;

  return (
    <div className="bg-white border border-gray-200/80 hover:border-gray-300 rounded-2xl p-5 sm:p-6 space-y-4 transition-all shadow-xs group">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <h4 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
            {title}
          </h4>
          {description && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{description}</p>
          )}
        </div>

        {canManage && (
          <div className="flex items-center gap-1 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(quiz)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit Quiz Settings"
              >
                <Edit3 size={16} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(quiz)}
                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete Quiz"
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
            <Clock size={15} className="text-blue-600" />
            <span>{durationMinutes} Mins</span>
          </div>

          <div className="flex items-center gap-1.5">
            <HelpCircle size={15} className="text-indigo-600" />
            <span>{questionCount || 0} Questions</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Award size={15} className="text-amber-600" />
            <span>Pass: {passingMarks}%</span>
          </div>
        </div>

        {/* Action Controls */}
        <div>
          {userRole === 'Student' ? (
            lastAttempt ? (
              <div className="flex items-center gap-3">
                <ScoreBadge
                  score={lastAttempt.score}
                  maxScore={lastAttempt.maxScore}
                  percentage={lastAttempt.percentage}
                  passed={lastAttempt.passed}
                />

                {canAttempt && (
                  <Link
                    to={`/quizzes/${_id}/take`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-xl transition-all shadow-xs"
                  >
                    <PlayCircle size={15} /> Retake ({attemptsCount}/{maxAttempts})
                  </Link>
                )}
              </div>
            ) : (
              <Link
                to={`/quizzes/${_id}/take`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-all shadow-xs"
              >
                <PlayCircle size={15} /> Start Quiz
              </Link>
            )
          ) : (
            <Link
              to={`/quizzes/${_id}/questions`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-150 px-3.5 py-2 rounded-xl transition-all"
            >
              <Layers size={14} />
              <span>Manage Question Bank</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizCard;

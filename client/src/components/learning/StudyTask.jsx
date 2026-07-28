import React from 'react';
import { CheckCircle2, Clock, Calendar, SkipForward, RotateCcw } from 'lucide-react';

const StudyTask = ({ task, onComplete, onSkip, onReschedule }) => {
  const { _id, title, description, topic, durationMinutes, priority, status, date } = task;

  const isCompleted = status === 'Completed';
  const isSkipped = status === 'Skipped';

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <div
      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isCompleted
          ? 'bg-emerald-50/40 border-emerald-200 opacity-75'
          : isSkipped
          ? 'bg-gray-50 border-gray-200 opacity-60'
          : 'bg-white border-gray-200/80 shadow-xs hover:border-blue-200'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <button
          onClick={() => !isCompleted && onComplete && onComplete(_id)}
          disabled={isCompleted}
          className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
            isCompleted
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'border-gray-300 hover:border-blue-600 text-transparent hover:text-blue-600'
          }`}
        >
          <CheckCircle2 size={16} />
        </button>

        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`text-sm font-bold truncate ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {title}
            </h4>
            <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {topic}
            </span>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">{description}</p>

          <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-1 font-medium">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {durationMinutes} mins
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formattedDate}
            </span>
          </div>
        </div>
      </div>

      {/* Task Actions */}
      {!isCompleted && !isSkipped && (
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            onClick={() => onReschedule && onReschedule(task)}
            title="Reschedule task"
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors text-xs font-medium flex items-center gap-1"
          >
            <RotateCcw size={14} />
            <span className="hidden md:inline">Reschedule</span>
          </button>
          <button
            onClick={() => onSkip && onSkip(_id)}
            title="Skip task"
            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-xs font-medium flex items-center gap-1"
          >
            <SkipForward size={14} />
            <span className="hidden md:inline">Skip</span>
          </button>
          <button
            onClick={() => onComplete && onComplete(_id)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};

export default StudyTask;

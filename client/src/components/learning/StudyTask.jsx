import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Clock, Calendar, SkipForward, RotateCcw,
  BookOpen, ArrowRight, ExternalLink, Bookmark, Video, FileText, Sparkles, AlertCircle, Loader2
} from 'lucide-react';
import learningService from '../../services/learningService';

const StudyTask = ({ task, courseId, courseLessons = [], onComplete, onSkip, onReschedule }) => {
  const navigate = useNavigate();
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState('');

  const { _id, title, description, topic, durationMinutes, priority, status, date, resourceId, resourceType, targetLocation } = task;

  const isCompleted = status === 'Completed';
  const isSkipped = status === 'Skipped';

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  // Determine source indicator label & badge
  const getLocationBadge = () => {
    if (targetLocation?.page) {
      return (
        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 inline-flex items-center gap-1">
          <Bookmark size={10} className="text-amber-600" />
          PDF · Page {targetLocation.page}
        </span>
      );
    }
    if (targetLocation?.startTime) {
      const mins = Math.floor(targetLocation.startTime / 60);
      const secs = String(targetLocation.startTime % 60).padStart(2, '0');
      return (
        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 inline-flex items-center gap-1">
          <Video size={10} className="text-indigo-600" />
          Video · {mins}:{secs}
        </span>
      );
    }
    if (targetLocation?.contentType === 'PDF' || resourceType === 'PDF') {
      return (
        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 inline-flex items-center gap-1">
          <FileText size={10} className="text-rose-600" />
          PDF Document
        </span>
      );
    }
    if (targetLocation?.contentType === 'Video' || resourceType === 'Video') {
      return (
        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 inline-flex items-center gap-1">
          <Video size={10} className="text-indigo-600" />
          Video Lesson
        </span>
      );
    }
    return (
      <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 inline-flex items-center gap-1">
        <BookOpen size={10} />
        {resourceType || 'Lesson'}
      </span>
    );
  };

  // Resolve target lesson or study resource deep link
  const handleOpenStudyMaterial = async (e) => {
    if (e) e.stopPropagation();
    setResolveError('');

    // 1. If directUrl is already cached in task targetLocation
    if (targetLocation?.directUrl) {
      navigate(targetLocation.directUrl);
      return;
    }

    // 2. Fetch Deep-Link resolution from backend topicResolver
    setResolving(true);
    try {
      const res = await learningService.resolveTaskContent(_id);
      if (res.success && res.data?.resolution) {
        const resolution = res.data.resolution;
        if (resolution.found && resolution.directUrl) {
          navigate(resolution.directUrl);
          return;
        } else if (!resolution.found) {
          setResolveError(resolution.message || 'Learning material for this topic could not be located.');
          return;
        }
      }
    } catch (err) {
      console.warn('[StudyTask] Backend resolution notice:', err);
    } finally {
      setResolving(false);
    }

    // 3. Fallback resolution using client curriculum
    if (courseId) {
      if (resourceId) {
        if (resourceType === 'Lesson') return navigate(`/courses/${courseId}/lessons/${resourceId}`);
        if (resourceType === 'Quiz') return navigate(`/courses/${courseId}/quizzes`);
        if (resourceType === 'Assignment') return navigate(`/assignments`);
      }

      if (courseLessons.length > 0) {
        const tTitleLower = (title || '').toLowerCase();
        const tTopicLower = (topic || '').toLowerCase();

        const matchedLesson = courseLessons.find((l) => {
          const lTitle = (l.title || '').toLowerCase();
          return tTitleLower.includes(lTitle) || tTopicLower.includes(lTitle) || lTitle.includes(tTopicLower) || lTitle.includes(tTitleLower);
        });

        if (matchedLesson) {
          return navigate(`/courses/${courseId}/lessons/${matchedLesson._id}?topic=${encodeURIComponent(topic || title)}`);
        }
      }

      navigate(`/courses/${courseId}`);
    } else {
      navigate('/courses');
    }
  };

  return (
    <div
      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
        isCompleted
          ? 'bg-emerald-50/40 border-emerald-200 opacity-80'
          : isSkipped
          ? 'bg-gray-50 border-gray-200 opacity-60'
          : 'bg-white border-gray-200/80 shadow-xs hover:border-blue-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Checkbox button to manually mark task as completed */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!isCompleted && onComplete) onComplete(_id);
          }}
          disabled={isCompleted}
          title={isCompleted ? 'Completed' : 'Mark task as done'}
          className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
            isCompleted
              ? 'bg-emerald-600 border-emerald-600 text-white cursor-default'
              : 'border-gray-300 hover:border-blue-600 text-transparent hover:text-blue-600 bg-white'
          }`}
        >
          <CheckCircle2 size={16} />
        </button>

        <div className="min-w-0 space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={`text-sm font-bold truncate ${
                isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
              }`}
            >
              {title}
            </h4>
            <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {topic}
            </span>
            {getLocationBadge()}
          </div>

          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
            {description}
          </p>

          {resolveError && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
              <AlertCircle size={12} /> {resolveError}
            </p>
          )}

          <div className="flex items-center gap-4 text-[11px] text-gray-400 pt-0.5 font-medium flex-wrap">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {durationMinutes} mins
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formattedDate}
            </span>
            <button
              type="button"
              onClick={handleOpenStudyMaterial}
              disabled={resolving}
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline inline-flex items-center gap-1 ml-auto sm:ml-0 cursor-pointer"
            >
              {resolving ? (
                <>
                  <Loader2 size={11} className="animate-spin" /> Resolving Location...
                </>
              ) : (
                <>
                  Open Study Material <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Task Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {/* Study Button -> Navigates directly to deep-linked lesson/PDF/video */}
        <button
          type="button"
          onClick={handleOpenStudyMaterial}
          disabled={resolving}
          className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-blue-200/80 shadow-2xs cursor-pointer"
          title="Open study material directly at topic location"
        >
          {resolving ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <BookOpen size={13} />
          )}
          <span>Study</span>
        </button>

        {!isCompleted && !isSkipped && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReschedule && onReschedule(task);
              }}
              title="Reschedule task"
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={14} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSkip && onSkip(_id);
              }}
              title="Skip task"
              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              <SkipForward size={14} />
            </button>
            {/* Done Button -> Marks task complete in-place without redirect */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!isCompleted && onComplete) onComplete(_id);
              }}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
              title="Mark this task as completed"
            >
              <CheckCircle2 size={13} />
              <span>Done</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default StudyTask;

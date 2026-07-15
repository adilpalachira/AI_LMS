import React, { useState } from 'react';
import LessonCard from './LessonCard';
import EmptyState from './EmptyState';
import { ChevronDown, ChevronUp, Plus, Edit3, Trash2, BookOpen, Layers } from 'lucide-react';

const SectionCard = ({
  section,
  courseId,
  canManage = false,
  onEditSection,
  onDeleteSection,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  defaultExpanded = true
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!section) return null;

  const { _id, title, description, order, lessons = [] } = section;

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-xs transition-all duration-150">
      {/* Header Bar */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-4 sm:p-5 bg-gray-50/70 hover:bg-gray-100/50 cursor-pointer flex items-center justify-between gap-4 transition-colors select-none"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-150 flex items-center justify-center font-bold text-xs shrink-0">
            {order || 1}
          </div>

          <div className="min-w-0">
            <h4 className="text-sm font-bold text-gray-900 truncate flex items-center gap-2">
              <span>{title}</span>
              <span className="text-[11px] font-semibold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full font-mono">
                {lessons.length} Lesson{lessons.length !== 1 ? 's' : ''}
              </span>
            </h4>
            {description && (
              <p className="text-xs text-gray-500 truncate mt-0.5">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canManage && (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => onAddLesson(section._id)}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-white hover:bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded-xl transition-all shadow-2xs"
                title="Add Lesson to this section"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">Add Lesson</span>
              </button>

              <button
                type="button"
                onClick={() => onEditSection(section)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
                title="Edit Section"
              >
                <Edit3 size={15} />
              </button>

              <button
                type="button"
                onClick={() => onDeleteSection(section)}
                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                title="Delete Section"
              >
                <Trash2 size={15} />
              </button>
            </div>
          )}

          <div className="p-1 text-gray-400">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>

      {/* Expanded Lessons List */}
      {expanded && (
        <div className="p-4 sm:p-5 border-t border-gray-150 bg-white space-y-2.5">
          {lessons.length > 0 ? (
            lessons.map((lesson) => (
              <LessonCard
                key={lesson._id}
                lesson={lesson}
                courseId={courseId}
                canManage={canManage}
                onEdit={onEditLesson}
                onDelete={onDeleteLesson}
              />
            ))
          ) : (
            <EmptyState
              icon={Layers}
              title="No Lessons in this Section"
              description="Add your first lesson (lecture notes, video, document, or assignment) to this section."
              actionButton={
                canManage ? (
                  <button
                    type="button"
                    onClick={() => onAddLesson(section._id)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-all shadow-xs"
                  >
                    <Plus size={14} /> Add Lesson Now
                  </button>
                ) : null
              }
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SectionCard;

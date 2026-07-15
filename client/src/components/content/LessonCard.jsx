import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlayCircle, FileText, Presentation, FileCode, Film,
  Image as ImageIcon, Link as LinkIcon, Edit3, Trash2, CheckCircle2, Eye, Lock
} from 'lucide-react';

const LessonCard = ({ lesson, courseId, canManage = false, onEdit, onDelete, isCurrent = false }) => {
  const navigate = useNavigate();

  if (!lesson) return null;

  const { _id, title, duration, contentType, isPreview, materials = [] } = lesson;

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'PDF':
        return <FileText size={16} className="text-rose-600" />;
      case 'PowerPoint':
        return <Presentation size={16} className="text-amber-600" />;
      case 'Word Document':
        return <FileText size={16} className="text-blue-600" />;
      case 'Image':
        return <ImageIcon size={16} className="text-emerald-600" />;
      case 'Video':
        return <Film size={16} className="text-purple-600" />;
      case 'YouTube':
        return <PlayCircle size={16} className="text-red-600" />;
      case 'External URL':
        return <LinkIcon size={16} className="text-indigo-600" />;
      case 'Text Note':
        return <FileCode size={16} className="text-slate-600" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  const handleLessonClick = () => {
    navigate(`/courses/${courseId}/lessons/${_id}`);
  };

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-150 p-3.5 flex items-center justify-between gap-3 ${
        isCurrent
          ? 'bg-blue-50/70 border-blue-200 ring-1 ring-blue-500/20'
          : 'bg-white hover:bg-gray-50/80 border-gray-200 hover:border-gray-300'
      }`}
    >
      <div
        onClick={handleLessonClick}
        className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
      >
        <div className="p-2 bg-gray-50 group-hover:bg-white border border-gray-200 rounded-lg shrink-0 transition-colors">
          {getContentTypeIcon(contentType)}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h5 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {title}
            </h5>
            {isPreview && (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Eye size={10} /> Preview Free
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium mt-0.5">
            <span>{duration || '10 mins'}</span>
            <span>•</span>
            <span className="text-gray-400 font-mono text-[10px]">{contentType}</span>
            {materials.length > 0 && (
              <>
                <span>•</span>
                <span className="text-blue-600 font-bold">{materials.length} File{materials.length > 1 ? 's' : ''}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handleLessonClick}
          className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 text-xs font-bold transition-all"
        >
          View
        </button>

        {canManage && (
          <div className="flex items-center gap-1 border-l border-gray-200 pl-1.5 ml-1">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(lesson);
                }}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit Lesson"
              >
                <Edit3 size={14} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(lesson);
                }}
                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete Lesson"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonCard;

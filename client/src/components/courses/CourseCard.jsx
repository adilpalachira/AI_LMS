import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Clock, ArrowRight, CheckCircle } from 'lucide-react';

const CourseCard = ({ course, isEnrolled = false, onEnroll, loadingId }) => {
  const getLevelBadgeClass = (level) => {
    switch (level) {
      case 'Beginner':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Intermediate':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Advanced':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Published':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Draft':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Archived':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 flex flex-col justify-between hover:shadow-md transition-all duration-200 group">
      <div className="space-y-4">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
              {course.category?.name || 'General'}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getLevelBadgeClass(course.level)}`}>
              {course.level}
            </span>
          </div>

          {course.status && (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(course.status)}`}>
              {course.status}
            </span>
          )}
        </div>

        {/* Thumbnail Preview or Code Banner */}
        <div className="relative h-40 rounded-xl overflow-hidden bg-gray-50 border border-gray-200/80 flex items-center justify-center">
          {course.thumbnail ? (
            <img
              src={`http://localhost:5000/${course.thumbnail}`}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <BookOpen size={24} />
              </div>
              <span className="text-xs font-mono text-gray-500 font-semibold">{course.code}</span>
            </div>
          )}

          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-gray-200 text-[11px] font-mono font-bold text-gray-800 shadow-sm">
            {course.code}
          </div>
        </div>

        {/* Title & Short Description */}
        <div className="space-y-1.5">
          <Link
            to={`/courses/${course._id}`}
            className="text-base font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
          >
            {course.title}
          </Link>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
            {course.shortDescription}
          </p>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-5 mt-5 border-t border-gray-100 space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-gray-400" />
            <span>{course.enrolledCount || 0} Enrolled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-gray-400" />
            <span>{course.duration || 'Self-Paced'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400 font-medium">Instructor:</span>
          <span className="font-semibold text-gray-800">{course.instructor?.name || 'Faculty'}</span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Link
            to={`/courses/${course._id}`}
            className="flex-1 py-2.5 px-3 bg-gray-50 hover:bg-gray-100 text-gray-800 text-xs font-semibold rounded-xl text-center transition-colors border border-gray-200 flex items-center justify-center gap-1.5"
          >
            View Details
          </Link>

          {onEnroll && (
            <button
              onClick={() => onEnroll(course._id)}
              disabled={isEnrolled || loadingId === course._id}
              className={`py-2.5 px-4 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                isEnrolled
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
              }`}
            >
              {loadingId === course._id ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isEnrolled ? (
                <>
                  <CheckCircle size={14} /> Enrolled
                </>
              ) : (
                <>
                  Enroll <ArrowRight size={14} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;

import React from 'react';
import { BookOpen, Check } from 'lucide-react';

export default function CourseSelector({ courses, selectedCourseId, onSelectCourse }) {
  return (
    <div className="relative inline-block w-full sm:w-72">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        Select Active Course
      </label>
      <div className="relative">
        <select
          value={selectedCourseId || ''}
          onChange={(e) => onSelectCourse(e.target.value)}
          className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
        >
          <option value="" disabled>-- Choose Enrolled Course --</option>
          {courses.map((course) => (
            <option key={course._id || course.id} value={course._id || course.id}>
              {course.code ? `[${course.code}] ` : ''}{course.title}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
          <BookOpen className="w-4 h-4 text-blue-600" />
        </div>
      </div>
    </div>
  );
}

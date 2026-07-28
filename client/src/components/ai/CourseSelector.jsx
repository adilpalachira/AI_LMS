import React from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';

export default function CourseSelector({ courses, selectedCourseId, onSelectCourse }) {
  return (
    <div className="relative inline-block w-full sm:w-72">
      <div className="relative flex items-center">
        <div className="absolute left-3.5 pointer-events-none text-blue-600">
          <BookOpen className="w-4 h-4" />
        </div>
        <select
          value={selectedCourseId || ''}
          onChange={(e) => onSelectCourse(e.target.value)}
          className="w-full appearance-none bg-white border border-gray-200 hover:border-gray-300 rounded-xl pl-10 pr-9 py-2.5 text-xs font-bold text-gray-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer truncate"
        >
          <option value="" disabled>Choose Enrolled Course</option>
          {courses.map((course) => (
            <option key={course._id || course.id} value={course._id || course.id}>
              {course.code ? `[${course.code}] ` : ''}{course.title}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 text-gray-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

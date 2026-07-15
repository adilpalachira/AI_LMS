import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

const CourseFilter = ({
  search,
  setSearch,
  category,
  setCategory,
  level,
  setLevel,
  status,
  setStatus,
  sortBy,
  setSortBy,
  categories = [],
  showStatusFilter = false,
  onReset
}) => {
  return (
    <div className="bg-white border border-gray-200/80 p-5 rounded-[20px] shadow-sm space-y-4 font-sans">
      {/* Top Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <Search size={16} />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by course title, course code, or topic..."
          className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white text-xs text-gray-900 rounded-xl pl-10 pr-4 py-2.5 transition-all placeholder:text-gray-400 font-medium"
        />
      </div>

      {/* Filter Select Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Category */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white text-xs font-semibold text-gray-800 rounded-xl px-3 py-2 transition-all"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.slug || cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Level */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
            Level
          </label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white text-xs font-semibold text-gray-800 rounded-xl px-3 py-2 transition-all"
          >
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        {/* Status (Admin/Faculty) */}
        {showStatusFilter && (
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white text-xs font-semibold text-gray-800 rounded-xl px-3 py-2 transition-all"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        )}

        {/* Sort By */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white text-xs font-semibold text-gray-800 rounded-xl px-3 py-2 transition-all"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">Alphabetical (A-Z)</option>
            <option value="popular">Most Enrolled</option>
          </select>
        </div>
      </div>

      {/* Reset Button */}
      {onReset && (
        <div className="flex justify-end pt-1">
          <button
            onClick={onReset}
            className="text-xs font-semibold text-gray-400 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw size={12} />
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseFilter;

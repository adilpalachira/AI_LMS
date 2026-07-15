import React from 'react';
import { Search } from 'lucide-react';

const UserFilters = ({ 
  search, 
  setSearch, 
  role, 
  setRole, 
  status, 
  setStatus, 
  sortBy, 
  setSortBy 
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-1.5 font-sans">
      {/* Search Input */}
      <div className="relative w-full md:w-80">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Search size={15} />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-gray-200/90 hover:border-gray-300 focus:border-blue-500 focus:outline-none text-xs rounded-xl pl-9 pr-4 py-2.5 transition-all text-gray-900 placeholder-gray-400"
          placeholder="Search name, email, phone..."
        />
      </div>

      {/* Selector Dropdowns */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {/* Role Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Role:</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 hover:border-gray-350 focus:border-blue-500 focus:outline-none transition-all cursor-pointer font-medium"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Faculty">Faculty</option>
            <option value="Student">Student</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status:</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 hover:border-gray-350 focus:border-blue-500 focus:outline-none transition-all cursor-pointer font-medium"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Sort By Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 hover:border-gray-350 focus:border-blue-500 focus:outline-none transition-all cursor-pointer font-medium"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default UserFilters;

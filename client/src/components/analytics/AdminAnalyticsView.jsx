import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  BookOpen, 
  Award, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  Search,
  Layers,
  UserCheck,
  UserX,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { RiskDistributionChart } from './PerformanceChart';
import AnalyticsInsightsCard from './AnalyticsInsightsCard';

const AdminAnalyticsView = ({ data, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-28 bg-white border border-gray-200/80 rounded-2xl p-5" />
          ))}
        </div>
      </div>
    );
  }

  const { totals = {}, riskBreakdown = {}, courseComparisons = [], insights = [] } = data || {};

  const filteredCourses = courseComparisons.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.instructor?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 5 SYSTEM TOTALS KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Users */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Users</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Users size={15} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-950">{totals.totalUsers || 0}</span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium">
            {totals.studentCount || 0} students • {totals.facultyCount || 0} faculty
          </p>
        </div>

        {/* Card 2: Courses */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Courses</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <BookOpen size={15} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-950">{totals.totalCourses || 0}</span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium">
            {totals.publishedCoursesCount || 0} published ({totals.totalCategories || 0} categories)
          </p>
        </div>

        {/* Card 3: Enrollments & Completion */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Enrollments</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-950">{totals.totalEnrollments || 0}</span>
            <span className="text-xs text-emerald-600 font-bold">{totals.systemCompletionRate || 0}%</span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium">
            {totals.completedEnrollmentsCount || 0} completions recorded
          </p>
        </div>

        {/* Card 4: Active Learners */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Students</span>
            <div className="p-1.5 bg-teal-50 text-teal-600 rounded-lg">
              <UserCheck size={15} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-950">{totals.activeStudentsCount || 0}</span>
            <span className="text-xs text-gray-500 font-medium">in 14 days</span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium">
            {totals.inactiveStudentsCount || 0} inactive student(s)
          </p>
        </div>

        {/* Card 5: Assessment Activity */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Assessments</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Award size={15} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-950">
              {(totals.totalQuizAttempts || 0) + (totals.totalSubmissions || 0)}
            </span>
            <span className="text-xs text-gray-500 font-medium">events</span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium">
            {totals.totalQuizAttempts || 0} quiz attempts • {totals.totalSubmissions || 0} submissions
          </p>
        </div>
      </div>

      {/* PLATFORM RISK & USER DEMOGRAPHICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskDistributionChart breakdown={riskBreakdown} />

        {/* User Composition Card */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-800">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Platform User Composition</h3>
              <p className="text-xs text-gray-400">Total registered accounts by role</p>
            </div>
          </div>

          <div className="h-4 w-full bg-gray-100 rounded-full flex overflow-hidden">
            <div 
              style={{ width: `${totals.totalUsers > 0 ? Math.round((totals.studentCount / totals.totalUsers) * 100) : 0}%` }} 
              className="bg-blue-600 h-full transition-all" 
              title="Students" 
            />
            <div 
              style={{ width: `${totals.totalUsers > 0 ? Math.round((totals.facultyCount / totals.totalUsers) * 100) : 0}%` }} 
              className="bg-indigo-500 h-full transition-all" 
              title="Faculty" 
            />
            <div 
              style={{ width: `${totals.totalUsers > 0 ? Math.round((totals.adminCount / totals.totalUsers) * 100) : 0}%` }} 
              className="bg-gray-900 h-full transition-all" 
              title="Admins" 
            />
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs font-semibold pt-1">
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-blue-900 flex flex-col justify-between">
              <span className="text-[11px] text-blue-600 font-bold">Students</span>
              <span className="font-extrabold text-base mt-1">{totals.studentCount || 0}</span>
            </div>

            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-indigo-900 flex flex-col justify-between">
              <span className="text-[11px] text-indigo-600 font-bold">Faculty</span>
              <span className="font-extrabold text-base mt-1">{totals.facultyCount || 0}</span>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 flex flex-col justify-between">
              <span className="text-[11px] text-gray-500 font-bold">Admins</span>
              <span className="font-extrabold text-base mt-1">{totals.adminCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* COURSE PERFORMANCE COMPARISON MATRIX */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-100 text-gray-900 rounded-lg">
              <BookOpen size={15} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Course Performance Comparison Matrix</h3>
              <p className="text-[11px] text-gray-400">Cross-course enrollment, assessment averages, and risk counts</p>
            </div>
          </div>

          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black w-48 sm:w-64"
            />
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <p className="py-8 text-center text-xs text-gray-400 font-medium">
            No published courses found matching the search query.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200/80 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 font-bold">Course Title & Code</th>
                  <th className="py-2.5 px-3 font-bold">Instructor</th>
                  <th className="py-2.5 px-3 font-bold text-center">Enrolled</th>
                  <th className="py-2.5 px-3 font-bold text-center">Progress</th>
                  <th className="py-2.5 px-3 font-bold text-center">Quiz Avg</th>
                  <th className="py-2.5 px-3 font-bold text-center">Assignment Avg</th>
                  <th className="py-2.5 px-3 font-bold text-center">Predicted Grade</th>
                  <th className="py-2.5 px-3 font-bold text-right">At-Risk Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCourses.map((c) => (
                  <tr key={c.courseId} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-gray-900">{c.title}</p>
                      <p className="text-[11px] text-gray-400 font-medium">{c.code}</p>
                    </td>
                    <td className="py-3 px-3 text-gray-600 font-medium">
                      {c.instructor}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-gray-900">
                      {c.enrolledStudents}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-gray-900">
                      {c.avgCourseProgress}%
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-gray-900">
                      {c.avgQuizScore}%
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-gray-900">
                      {c.avgAssignmentScore}%
                    </td>
                    <td className="py-3 px-3 text-center font-extrabold text-gray-950">
                      {c.avgPredictedScore}%
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.atRiskCount > 0 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {c.atRiskCount} Student{c.atRiskCount !== 1 ? 's' : ''}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PLATFORM INSIGHTS */}
      <AnalyticsInsightsCard insights={insights} title="Platform Academic Overview Insights" />
    </div>
  );
};

export default AdminAnalyticsView;

import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Award, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter,
  UserCheck,
  UserX,
  TrendingUp,
  Activity
} from 'lucide-react';
import QuestionDifficultyTable from './QuestionDifficultyTable';
import AnalyticsInsightsCard from './AnalyticsInsightsCard';
import RiskBadge from './RiskBadge';
import { RiskDistributionChart } from './PerformanceChart';

const CourseAnalyticsView = ({ 
  data, 
  loading, 
  courses = [], 
  selectedCourseId, 
  onSelectCourse 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-white border border-gray-200/80 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-white border border-gray-200/80 rounded-2xl p-5" />
          ))}
        </div>
      </div>
    );
  }

  const { overview = {}, course = {}, questionItemAnalysis = [], insights = [], students = [], atRiskStudents = [] } = data || {};

  // Filter students roster
  const filteredStudents = students.filter(st => {
    const matchesSearch = st.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          st.student?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'All' || st.prediction?.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* COURSE SELECTOR HEADER */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gray-900 text-white rounded-xl">
            <BookOpen size={18} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-gray-950">
              {course.title || 'Course Analytics Dashboard'}
            </h2>
            <p className="text-xs text-gray-400 font-medium">
              {course.code ? `Course Code: ${course.code} • Instructor: ${course.instructor}` : 'Select a course to view deep learning metrics'}
            </p>
          </div>
        </div>

        {courses.length > 0 && (
          <div className="flex items-center gap-2">
            <label htmlFor="course-select" className="text-xs font-bold text-gray-500 hidden sm:inline">Course:</label>
            <select
              id="course-select"
              value={selectedCourseId}
              onChange={(e) => onSelectCourse(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-900 text-xs font-semibold rounded-xl px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.code ? `[${c.code}] ` : ''}{c.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Enrolled Cohort & Activity */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Enrolled Cohort</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Users size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-950">{overview.totalStudents || 0}</span>
            <span className="text-xs text-gray-500 font-medium">students</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold pt-1">
            <span className="text-emerald-600 flex items-center gap-1">
              <UserCheck size={12} /> {overview.activeLearnersCount || 0} active
            </span>
            <span className="text-gray-400 flex items-center gap-1">
              <UserX size={12} /> {overview.inactiveLearnersCount || 0} inactive
            </span>
          </div>
        </div>

        {/* Card 2: Completion Rate */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completion Rate</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-950">{overview.completionRate || 0}%</span>
            <span className="text-xs text-emerald-600 font-bold">{overview.completedStudentsCount || 0} finished</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-700"
              style={{ width: `${overview.completionRate || 0}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400 font-medium">Course syllabus milestones completed</p>
        </div>

        {/* Card 3: Quiz Assessment Average */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Quiz Performance</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Award size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-950">{overview.avgQuizScore || 0}%</span>
            <span className="text-xs text-gray-500 font-medium">class average</span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium">
            High: <span className="text-gray-900 font-bold">{overview.highestQuizScore || 0}%</span> • Low: <span className="text-gray-900 font-bold">{overview.lowestQuizScore || 0}%</span> ({overview.totalQuizAttemptsCount || 0} attempts)
          </p>
        </div>

        {/* Card 4: Assignment Performance */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Assignment Average</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-950">{overview.avgAssignmentScore || 0}%</span>
            <span className="text-xs text-gray-500 font-medium">submission rate: {overview.submissionRate || 0}%</span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium">
            {overview.lateSubmissionsCount || 0} late submission{overview.lateSubmissionsCount !== 1 ? 's' : ''} recorded
          </p>
        </div>
      </div>

      {/* RISK BREAKDOWN & ENGAGEMENT CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskDistributionChart breakdown={overview.riskBreakdown} />
        
        {/* Active vs Inactive Learner Cohort Engagement Card */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-800">
              <Activity size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Student Cohort Activity Status</h3>
              <p className="text-xs text-gray-400">Activity defined by platform access within 14 days</p>
            </div>
          </div>

          <div className="h-4 w-full bg-gray-100 rounded-full flex overflow-hidden">
            <div 
              style={{ width: `${overview.totalStudents > 0 ? Math.round((overview.activeLearnersCount / overview.totalStudents) * 100) : 0}%` }} 
              className="bg-emerald-500 h-full transition-all" 
              title="Active Learners" 
            />
            <div 
              style={{ width: `${overview.totalStudents > 0 ? Math.round((overview.inactiveLearnersCount / overview.totalStudents) * 100) : 0}%` }} 
              className="bg-slate-300 h-full transition-all" 
              title="Inactive Learners" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-semibold pt-1">
            <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-emerald-900">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Active (≤14 days)</span>
              </div>
              <span className="font-extrabold text-sm">{overview.activeLearnersCount || 0}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>Inactive (&gt;14 days)</span>
              </div>
              <span className="font-extrabold text-sm">{overview.inactiveLearnersCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* QUESTION ITEM ANALYSIS TABLE (ITEM DIFFICULTY) */}
      <QuestionDifficultyTable items={questionItemAnalysis} />

      {/* ENROLLED STUDENTS PERFORMANCE ROSTER */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-100 text-gray-900 rounded-lg">
              <Users size={15} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Enrolled Students Performance Roster</h3>
              <p className="text-[11px] text-gray-400">Live coursework metrics and Module 9 risk indicators</p>
            </div>
          </div>

          {/* Search and Risk Level Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black w-40 sm:w-48"
              />
            </div>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-semibold focus:outline-none"
            >
              <option value="All">All Risk Tiers</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
              <option value="Unevaluated">Unevaluated</option>
            </select>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <p className="py-8 text-center text-xs text-gray-400 font-medium">
            No enrolled students match the search criteria.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200/80 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 font-bold">Student</th>
                  <th className="py-2.5 px-3 font-bold text-center">Progress</th>
                  <th className="py-2.5 px-3 font-bold text-center">Quiz Avg</th>
                  <th className="py-2.5 px-3 font-bold text-center">Assignment Avg</th>
                  <th className="py-2.5 px-3 font-bold text-center">Predicted Grade</th>
                  <th className="py-2.5 px-3 font-bold text-right">Risk Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((st, idx) => (
                  <tr key={st.student.id || idx} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-gray-900">{st.student.name}</p>
                      <p className="text-[11px] text-gray-400 font-medium">{st.student.email}</p>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-gray-900">
                      {st.metrics.courseProgress}%
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-gray-900">
                      {st.metrics.quizAvgScore}%
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-gray-900">
                      {st.metrics.assignmentAvgScore}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-extrabold text-sm text-gray-950">
                        {st.prediction.predictedScore}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <RiskBadge level={st.prediction.riskLevel} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DATA-DRIVEN INSIGHTS */}
      <AnalyticsInsightsCard insights={insights} title="Course Insights & Diagnoses" />
    </div>
  );
};

export default CourseAnalyticsView;

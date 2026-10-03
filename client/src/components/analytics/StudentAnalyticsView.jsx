import React from 'react';
import { 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Clock, 
  BrainCircuit, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  CalendarCheck,
  Bot
} from 'lucide-react';
import AssessmentTimelineChart from './AssessmentTimelineChart';
import AnalyticsInsightsCard from './AnalyticsInsightsCard';
import RiskBadge from './RiskBadge';

const StudentAnalyticsView = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-white border border-gray-200/80 rounded-2xl p-5" />
          ))}
        </div>
        <div className="h-64 bg-white border border-gray-200/80 rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-2xl p-12 text-center text-gray-400 space-y-2">
        <BookOpen size={36} className="mx-auto text-gray-300 stroke-[1.5]" />
        <h3 className="text-base font-bold text-gray-700">No Learning Data Found</h3>
        <p className="text-xs text-gray-500">Enroll in courses and take assessments to generate analytics.</p>
      </div>
    );
  }

  const { summaryCards = {}, quizTrend = [], coursePredictions = [], insights = [], recentSubmissions = [] } = data;

  return (
    <div className="space-y-6">
      {/* SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Course Completion */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Course Progress</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <BookOpen size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-950">{summaryCards.avgCourseProgress || 0}%</span>
            <span className="text-xs text-gray-500 font-medium">overall</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-700"
              style={{ width: `${summaryCards.avgCourseProgress || 0}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400 font-medium">
            {summaryCards.enrolledCoursesCount || 0} active ({summaryCards.completedCoursesCount || 0} completed)
          </p>
        </div>

        {/* Card 2: Quiz Average */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Quiz Performance</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Award size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-950">{summaryCards.quizAvgScore || 0}%</span>
            <span className="text-xs text-emerald-600 font-bold">{summaryCards.quizPassRate || 0}% pass rate</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-700"
              style={{ width: `${summaryCards.quizAvgScore || 0}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400 font-medium">
            Across {summaryCards.totalQuizAttempts || 0} quiz attempt(s)
          </p>
        </div>

        {/* Card 3: Assignment Performance */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Assignments</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-950">{summaryCards.assignmentAvgScore || 0}%</span>
            <span className="text-xs text-gray-500 font-medium">avg mark</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-700"
              style={{ width: `${summaryCards.assignmentAvgScore || 0}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400 font-medium">
            {summaryCards.totalSubmissions || 0} submitted {summaryCards.lateSubmissionsCount > 0 ? `(${summaryCards.lateSubmissionsCount} late)` : ''}
          </p>
        </div>

        {/* Card 4: Learning Engagement */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Learning Activity</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Bot size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-950">{summaryCards.aiSessionsCount || 0}</span>
            <span className="text-xs text-gray-500 font-medium">AI study sessions</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-700"
              style={{ width: `${summaryCards.studyTaskCompletionRate || 0}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400 font-medium">
            {summaryCards.completedStudyTasks || 0}/{summaryCards.totalStudyTasks || 0} study tasks completed ({summaryCards.studyTaskCompletionRate || 0}%)
          </p>
        </div>
      </div>

      {/* QUIZ SCORE PROGRESSION TIMELINE */}
      <AssessmentTimelineChart quizTrend={quizTrend} />

      {/* COURSE BREAKDOWN MATRIX & MODULE 9 PERFORMANCE */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-100 text-gray-900 rounded-lg">
              <BookOpen size={15} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Enrolled Courses Performance Overview</h3>
              <p className="text-[11px] text-gray-400">Course progress, assessment averages, and ML grade predictions</p>
            </div>
          </div>
          <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
            {coursePredictions.length} Enrolled Course{coursePredictions.length > 1 ? 's' : ''}
          </span>
        </div>

        {coursePredictions.length === 0 ? (
          <p className="py-8 text-center text-xs text-gray-400 font-medium">
            No active course enrollments available to analyze.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200/80 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 font-bold">Course</th>
                  <th className="py-2.5 px-3 font-bold text-center">Progress</th>
                  <th className="py-2.5 px-3 font-bold text-center">Quiz Avg</th>
                  <th className="py-2.5 px-3 font-bold text-center">Assignment Avg</th>
                  <th className="py-2.5 px-3 font-bold text-center">Predicted Grade</th>
                  <th className="py-2.5 px-3 font-bold text-right">Risk Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coursePredictions.map((cp) => (
                  <tr key={cp.course.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-gray-900">{cp.course.title}</p>
                      <p className="text-[11px] text-gray-400 font-medium">{cp.course.code}</p>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5 font-bold text-gray-900">
                        <span>{cp.metrics.courseProgress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-gray-900">
                      {cp.metrics.quizAvgScore}%
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-gray-900">
                      {cp.metrics.assignmentAvgScore}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-extrabold text-sm text-gray-950">
                        {cp.prediction.predictedScore}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <RiskBadge level={cp.prediction.riskLevel} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECENT SUBMISSIONS HISTORY */}
      {recentSubmissions.length > 0 && (
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <div className="p-1.5 bg-gray-100 text-gray-900 rounded-lg">
              <FileText size={15} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Recent Assignment Submissions</h3>
              <p className="text-[11px] text-gray-400">Track submission status, marks, and deadlines</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200/80 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 font-bold">Assignment</th>
                  <th className="py-2.5 px-3 font-bold">Submitted Date</th>
                  <th className="py-2.5 px-3 font-bold text-center">Marks</th>
                  <th className="py-2.5 px-3 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-3 font-bold text-gray-900">
                      {sub.assignmentTitle}
                      {sub.isLate && (
                        <span className="ml-2 text-[10px] text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                          Late
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-gray-500 font-medium">
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-gray-900">
                      {sub.marks !== undefined ? sub.marks : '—'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.status === 'Graded' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DATA-DRIVEN INSIGHTS */}
      <AnalyticsInsightsCard insights={insights} title="My Learning Insights" />
    </div>
  );
};

export default StudentAnalyticsView;

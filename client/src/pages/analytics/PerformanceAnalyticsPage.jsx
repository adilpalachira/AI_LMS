import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import analyticsService from '../../services/analyticsService';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import RiskBadge from '../../components/analytics/RiskBadge';
import { ScoreGauge, FeatureBarChart, RiskDistributionChart } from '../../components/analytics/PerformanceChart';
import { 
  LineChart, 
  BookOpen, 
  BrainCircuit, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  Sparkles,
  Users,
  Target
} from 'lucide-react';

const PerformanceAnalyticsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  
  // Data state
  const [studentPerf, setStudentPerf] = useState(null);
  const [courseAnalytics, setCourseAnalytics] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchAnalytics(selectedCourseId);
    }
  }, [selectedCourseId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      let endpoint = '/courses';
      if (user.role === 'Student') endpoint = '/courses/my-enrollments';
      else if (user.role === 'Faculty') endpoint = '/courses/my-courses';

      const res = await api.get(endpoint);
      if (res.data?.success) {
        let courseList = res.data.data || [];
        if (user.role === 'Student') {
          courseList = courseList.map(e => e.course || e).filter(Boolean);
        }
        setCourses(courseList);

        if (courseList.length > 0) {
          const firstId = courseList[0]._id;
          setSelectedCourseId(firstId);
        } else {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Failed to fetch user courses:', err);
      setLoading(false);
    }
  };

  const fetchAnalytics = async (courseId) => {
    setLoading(true);
    try {
      if (user.role === 'Student') {
        const perfData = await analyticsService.getStudentPerformance(courseId, user._id);
        if (perfData?.success) {
          setStudentPerf(perfData.data);
        }
      } else {
        const courseData = await analyticsService.getCourseAnalytics(courseId);
        if (courseData?.success) {
          setCourseAnalytics(courseData.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-8 max-w-[1600px] w-full mx-auto space-y-8">
          {/* TOP HEADER SECTION */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <LineChart size={14} className="text-gray-900" />
                <span>Module 9 — AI Predictive Analytics</span>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {user.role === 'Student' ? 'My Performance & Predicted Grades' : 'Course Performance Analytics'}
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                ML-powered grade estimations, feature breakdown, and risk detection insights.
              </p>
            </div>

            {/* Course Selector Dropdown */}
            {courses.length > 0 && (
              <div className="flex items-center gap-3 shrink-0">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Course:</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code ? `${c.code}: ` : ''}{c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center space-y-3 bg-white border border-gray-200 rounded-2xl">
              <RefreshCw size={24} className="animate-spin text-black mx-auto" />
              <p className="text-xs font-bold text-gray-500">Calculating ML features & predicted score...</p>
            </div>
          ) : user.role === 'Student' ? (
            /* STUDENT PERFORMANCE VIEW */
            studentPerf ? (
              <div className="space-y-8">
                {/* 3-COL GRID: Score Gauge, Risk Level, Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Gauge */}
                  <ScoreGauge
                    score={studentPerf.prediction.predictedScore}
                    title="Predicted Final Score"
                    subtitle={`Based on ${studentPerf.metrics.totalQuizAttemptsCount} quizzes & ${studentPerf.metrics.gradedSubmissionsCount} graded assignments`}
                  />

                  {/* Risk Level & Factors Card */}
                  <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Academic Risk Status</span>
                      <div>
                        <RiskBadge riskLevel={studentPerf.prediction.riskLevel} size="lg" />
                      </div>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">
                        {studentPerf.prediction.riskLevel === 'Low'
                          ? 'Great job! You are maintaining strong grades and consistent progress.'
                          : studentPerf.prediction.riskLevel === 'Medium'
                          ? 'You are on track, but review your weak topics and upcoming deadlines.'
                          : 'Action required: Complete pending assignments and review weak concepts immediately.'}
                      </p>
                    </div>

                    {studentPerf.prediction.riskFactors?.length > 0 && (
                      <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3 text-xs space-y-1">
                        <p className="font-bold text-amber-900 flex items-center gap-1">
                          <AlertTriangle size={13} className="text-amber-600" /> Focus Areas:
                        </p>
                        <ul className="list-disc pl-4 text-amber-800 space-y-0.5">
                          {studentPerf.prediction.riskFactors.slice(0, 2).map((rf, idx) => (
                            <li key={idx}>{rf}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* AI Study Recommendations */}
                  <div className="bg-black text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-full text-[11px] font-bold text-gray-300">
                        <Sparkles size={12} className="text-blue-400" /> AI Personalization Active
                      </div>
                      <h3 className="text-lg font-bold text-white">Adaptive Learning Path</h3>
                      <p className="text-xs text-gray-300 font-medium">
                        Boost your predicted grade with AI-structured study plans.
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        onClick={() => navigate('/personalized-learning')}
                        className="w-full bg-white hover:bg-gray-100 text-black font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                      >
                        View Personalized Learning <ArrowRight size={14} />
                      </button>
                      <button
                        onClick={() => navigate('/study-planner')}
                        className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                      >
                        Generate Study Plan <BrainCircuit size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Feature Metrics Chart */}
                <FeatureBarChart features={studentPerf.metrics} />
              </div>
            ) : (
              <div className="p-8 bg-white border border-gray-200 rounded-2xl text-center">
                <p className="text-sm font-bold text-gray-500">No performance data found for this course.</p>
              </div>
            )
          ) : (
            /* FACULTY & ADMIN COURSE SUMMARY VIEW */
            courseAnalytics ? (
              <div className="space-y-8">
                {/* Metrics Overview Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Enrolled Students</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1">{courseAnalytics.overview.totalStudents}</p>
                  </div>
                  <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Class Avg Predicted Score</p>
                    <p className="text-3xl font-extrabold text-indigo-600 mt-1">{courseAnalytics.overview.avgPredictedScore}%</p>
                  </div>
                  <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Class Quiz Avg</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1">{courseAnalytics.overview.avgQuizScore}%</p>
                  </div>
                  <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Class Progress</p>
                    <p className="text-3xl font-extrabold text-emerald-600 mt-1">{courseAnalytics.overview.avgCourseProgress}%</p>
                  </div>
                </div>

                {/* Risk Distribution Chart */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RiskDistributionChart breakdown={courseAnalytics.overview.riskBreakdown} />

                  {/* Grade Distribution Bar */}
                  <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-800">
                        <Target size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Grade Tier Distribution</h3>
                        <p className="text-xs text-gray-400">Class breakdown by estimated final grade</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-gray-700">Excellent (85-100%)</span>
                        <span className="font-extrabold">{courseAnalytics.overview.gradeDistribution.excellent} students</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-gray-700">Good (70-84%)</span>
                        <span className="font-extrabold">{courseAnalytics.overview.gradeDistribution.good} students</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-gray-700">Average (50-69%)</span>
                        <span className="font-extrabold">{courseAnalytics.overview.gradeDistribution.average} students</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-semibold text-red-600">
                        <span>At-Risk (&lt;50%)</span>
                        <span className="font-extrabold">{courseAnalytics.overview.gradeDistribution.atRisk} students</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* At Risk Students Quick Link Banner */}
                <div className="bg-gradient-to-r from-red-950 to-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold">Inspect At-Risk Students Directory</h3>
                    <p className="text-xs text-gray-300 font-medium">
                      View all students needing academic assistance across your courses.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/at-risk-students')}
                    className="shrink-0 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 transition-colors"
                  >
                    Open At-Risk Monitor <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-white border border-gray-200 rounded-2xl text-center">
                <p className="text-sm font-bold text-gray-500">No course data available.</p>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
};

export default PerformanceAnalyticsPage;

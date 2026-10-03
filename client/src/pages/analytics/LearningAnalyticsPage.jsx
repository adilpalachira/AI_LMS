import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import analyticsService from '../../services/analyticsService';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import TimeframeSelector from '../../components/analytics/TimeframeSelector';
import StudentAnalyticsView from '../../components/analytics/StudentAnalyticsView';
import CourseAnalyticsView from '../../components/analytics/CourseAnalyticsView';
import AdminAnalyticsView from '../../components/analytics/AdminAnalyticsView';
import { 
  LineChart, 
  BarChart3, 
  BookOpen, 
  Users, 
  RefreshCw, 
  ShieldAlert,
  GraduationCap,
  Layers,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const LearningAnalyticsPage = () => {
  const { user } = useAuth();

  // Active view tab (for faculty/admin who have multiple views)
  const [activeTab, setActiveTab] = useState(() => {
    if (user?.role === 'Admin') return 'admin-overview';
    if (user?.role === 'Faculty') return 'course-analytics';
    return 'student-analytics';
  });

  const [timeframe, setTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Course selection state (for course analytics view)
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // Loaded data objects
  const [studentData, setStudentData] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    fetchCourseList();
  }, [user]);

  useEffect(() => {
    fetchCurrentViewData();
  }, [activeTab, timeframe, selectedCourseId]);

  const fetchCourseList = async () => {
    try {
      let endpoint = '/courses';
      if (user?.role === 'Student') endpoint = '/courses/my-enrollments';
      else if (user?.role === 'Faculty') endpoint = '/courses/my-courses';

      const res = await api.get(endpoint);
      if (res.data?.success) {
        let courseList = res.data.data || [];
        if (user?.role === 'Student') {
          courseList = courseList.map(e => e.course || e).filter(Boolean);
        }
        setCourses(courseList);
        if (courseList.length > 0 && !selectedCourseId) {
          setSelectedCourseId(courseList[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch course list:', err);
    }
  };

  const fetchCurrentViewData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'student-analytics' || user?.role === 'Student') {
        const res = await analyticsService.getStudentDetailedAnalytics(timeframe);
        if (res?.success) {
          setStudentData(res.data);
        }
      } else if (activeTab === 'course-analytics') {
        if (selectedCourseId) {
          const res = await analyticsService.getCourseDetailedAnalytics(selectedCourseId, timeframe);
          if (res?.success) {
            setCourseData(res.data);
          }
        }
      } else if (activeTab === 'admin-overview' && user?.role === 'Admin') {
        const res = await analyticsService.getAdminSystemAnalytics(timeframe);
        if (res?.success) {
          setAdminData(res.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCurrentViewData();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 sm:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* TOP BANNER & CONTROLS */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <LineChart size={14} className="text-gray-900" />
                <span>Module 10 — Intelligent Learning Analytics</span>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {activeTab === 'admin-overview' && 'Academic System Overview & Insights'}
                {activeTab === 'course-analytics' && 'Course Analytics & Item Difficulty'}
                {activeTab === 'student-analytics' && 'My Learning Analytics & Progression'}
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Comprehensive data-driven evaluation of completion, assessments, engagement, and learning outcomes.
              </p>
            </div>

            {/* Controls: Timeframe filter & Refresh button */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <TimeframeSelector selected={timeframe} onChange={setTimeframe} />
              
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl transition-all shadow-sm focus:outline-none"
                title="Refresh Analytics"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              </button>

              {['Admin', 'Faculty'].includes(user?.role) && (
                <Link
                  to="/at-risk-students"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl text-xs font-bold transition-all"
                >
                  <ShieldAlert size={14} />
                  At-Risk Portal
                </Link>
              )}
            </div>
          </div>

          {/* ROLE NAVIGATION TABS (for Faculty / Admin) */}
          {user?.role !== 'Student' && (
            <div className="flex items-center gap-2 border-b border-gray-200/80 pb-1">
              {user?.role === 'Admin' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('admin-overview')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    activeTab === 'admin-overview'
                      ? 'bg-black text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Layers size={14} />
                  System Overview
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('course-analytics')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'course-analytics'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <BookOpen size={14} />
                Course Analytics
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('student-analytics')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'student-analytics'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <GraduationCap size={14} />
                Student View
              </button>
            </div>
          )}

          {/* ACTIVE VIEW CONTENT */}
          {activeTab === 'student-analytics' && (
            <StudentAnalyticsView data={studentData} loading={loading} />
          )}

          {activeTab === 'course-analytics' && (
            <CourseAnalyticsView 
              data={courseData} 
              loading={loading}
              courses={courses}
              selectedCourseId={selectedCourseId}
              onSelectCourse={setSelectedCourseId}
            />
          )}

          {activeTab === 'admin-overview' && (
            <AdminAnalyticsView data={adminData} loading={loading} />
          )}
        </main>
      </div>
    </div>
  );
};

export default LearningAnalyticsPage;

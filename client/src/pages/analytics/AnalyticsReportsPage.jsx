import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import analyticsService from '../../services/analyticsService';
import reportService from '../../services/reportService';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import TimeframeSelector from '../../components/analytics/TimeframeSelector';
import AdminAnalyticsView from '../../components/analytics/AdminAnalyticsView';
import CourseAnalyticsView from '../../components/analytics/CourseAnalyticsView';
import StudentAnalyticsView from '../../components/analytics/StudentAnalyticsView';
import { 
  LineChart, 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  RefreshCw, 
  BookOpen, 
  Users, 
  Award, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  HelpCircle,
  BrainCircuit,
  FileCheck,
  ShieldAlert,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';

const getReportIcon = (id) => {
  switch (id) {
    case 'STUDENT_PERFORMANCE':
      return <Users size={18} className="text-blue-600" />;
    case 'COURSE_PERFORMANCE':
      return <BookOpen size={18} className="text-indigo-600" />;
    case 'AT_RISK_STUDENTS':
      return <AlertTriangle size={18} className="text-red-600" />;
    case 'ASSIGNMENT_SUBMISSIONS':
      return <FileText size={18} className="text-purple-600" />;
    case 'QUIZ_PERFORMANCE':
      return <Award size={18} className="text-emerald-600" />;
    case 'ENROLLMENT_COMPLETION':
      return <CheckCircle2 size={18} className="text-teal-600" />;
    case 'QUESTION_OVERVIEW':
      return <HelpCircle size={18} className="text-amber-600" />;
    case 'ACADEMIC_SUMMARY':
    default:
      return <Layers size={18} className="text-gray-900" />;
  }
};

const AnalyticsReportsPage = () => {
  const { user } = useAuth();

  // Master Section Tab: 'analytics' | 'reports'
  const [masterTab, setMasterTab] = useState('analytics');

  // --- ANALYTICS SECTION STATE ---
  const [analyticsViewTab, setAnalyticsViewTab] = useState(
    user?.role === 'Admin' ? 'admin-overview' : user?.role === 'Faculty' ? 'course-analytics' : 'student-analytics'
  );
  const [timeframe, setTimeframe] = useState('30d');
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsRefreshing, setAnalyticsRefreshing] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // --- REPORTS SECTION STATE ---
  const [catalog, setCatalog] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState('STUDENT_PERFORMANCE');
  const [reportFilters, setReportFilters] = useState({
    courseId: '',
    riskLevel: 'All',
    status: 'All',
    difficulty: 'All',
    timeframe: '30d'
  });
  const [loadingReport, setLoadingReport] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [tableSearch, setTableSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    fetchInitialCourses();
  }, [user]);

  useEffect(() => {
    if (masterTab === 'analytics') {
      fetchAnalyticsData();
    } else {
      fetchReportsCatalogAndInitial();
    }
  }, [masterTab, analyticsViewTab, timeframe, selectedCourseId]);

  const fetchInitialCourses = async () => {
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

  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true);
    try {
      if (analyticsViewTab === 'admin-overview' && user?.role === 'Admin') {
        const res = await analyticsService.getAdminSystemAnalytics(timeframe);
        if (res?.success) {
          setAdminData(res.data);
        }
      } else if (analyticsViewTab === 'course-analytics') {
        if (selectedCourseId) {
          const res = await analyticsService.getCourseDetailedAnalytics(selectedCourseId, timeframe);
          if (res?.success) {
            setCourseData(res.data);
          }
        }
      } else if (analyticsViewTab === 'student-analytics') {
        const res = await analyticsService.getStudentDetailedAnalytics(timeframe);
        if (res?.success) {
          setStudentData(res.data);
        }
      }
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setAnalyticsLoading(false);
      setAnalyticsRefreshing(false);
    }
  };

  const fetchReportsCatalogAndInitial = async () => {
    try {
      const res = await reportService.getReportCatalog();
      if (res?.success) {
        const cat = res.data || [];
        setCatalog(cat);
        if (cat.length > 0) {
          const firstId = cat[0].id;
          if (!reportData) {
            setSelectedReportId(firstId);
            handleGenerateReport(firstId, reportFilters);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load reports catalog:', err);
    }
  };

  const handleGenerateReport = async (reportType = selectedReportId, filters = reportFilters) => {
    setLoadingReport(true);
    setTableSearch('');
    setCurrentPage(1);
    try {
      const res = await reportService.generateReport(reportType, filters);
      if (res?.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleExportCsv = async () => {
    setExportingCsv(true);
    try {
      await reportService.exportReportCsv(selectedReportId, reportFilters);
    } catch (err) {
      console.error('CSV export failed:', err);
    } finally {
      setExportingCsv(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  // Filter rows by search string for reports table
  const filteredRows = (reportData?.rows || []).filter((row) => {
    if (!tableSearch) return true;
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(tableSearch.toLowerCase())
    );
  });

  const totalReportPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const selectedReportMeta = catalog.find(r => r.id === selectedReportId) || {};

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <div className="print:hidden">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="print:hidden">
          <Header />
        </div>

        <main className="flex-1 p-6 sm:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* HEADER BANNER WITH MASTER SECTION SWITCHER */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:border-none print:p-0 print:shadow-none">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider print:hidden">
                <LineChart size={14} className="text-gray-900" />
                <span>Unified Academic Intelligence Portal</span>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Analytics & Reports
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Comprehensive data intelligence combining interactive learning performance with structured compliance reporting.
              </p>
            </div>

            {/* Master Switcher: Analytics vs Reports */}
            <div className="flex flex-wrap items-center gap-3 shrink-0 print:hidden">
              <div className="inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setMasterTab('analytics')}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    masterTab === 'analytics'
                      ? 'bg-black text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 size={14} />
                  Interactive Analytics
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMasterTab('reports');
                    if (catalog.length === 0) fetchReportsCatalogAndInitial();
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    masterTab === 'reports'
                      ? 'bg-black text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileSpreadsheet size={14} />
                  Reports & Export Engine
                </button>
              </div>

              {masterTab === 'analytics' ? (
                <>
                  <TimeframeSelector selected={timeframe} onChange={setTimeframe} />
                  <button
                    type="button"
                    onClick={() => { setAnalyticsRefreshing(true); fetchAnalyticsData(); }}
                    disabled={analyticsRefreshing}
                    className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl transition-all shadow-sm focus:outline-none"
                    title="Refresh Analytics"
                  >
                    <RefreshCw size={14} className={analyticsRefreshing ? 'animate-spin' : ''} />
                  </button>
                </>
              ) : (
                reportData && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportCsv}
                      disabled={exportingCsv || loadingReport}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      <Download size={13} className={exportingCsv ? 'animate-bounce' : ''} />
                      Export CSV
                    </button>
                    <button
                      type="button"
                      onClick={handlePrintPdf}
                      disabled={loadingReport}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      <Printer size={13} />
                      Print / PDF
                    </button>
                  </div>
                )
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* TAB 1: INTERACTIVE ANALYTICS */}
          {/* ======================================================== */}
          {masterTab === 'analytics' && (
            <div className="space-y-6">
              {/* Role Sub-Navigation Tabs for Analytics View */}
              {user?.role !== 'Student' && (
                <div className="flex items-center gap-2 border-b border-gray-200/80 pb-1">
                  {user?.role === 'Admin' && (
                    <button
                      type="button"
                      onClick={() => setAnalyticsViewTab('admin-overview')}
                      className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                        analyticsViewTab === 'admin-overview'
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
                    onClick={() => setAnalyticsViewTab('course-analytics')}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                      analyticsViewTab === 'course-analytics'
                        ? 'bg-black text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <BookOpen size={14} />
                    Course Analytics
                  </button>

                  <button
                    type="button"
                    onClick={() => setAnalyticsViewTab('student-analytics')}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                      analyticsViewTab === 'student-analytics'
                        ? 'bg-black text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Users size={14} />
                    Student View
                  </button>
                </div>
              )}

              {/* VIEW COMPONENT RENDERING */}
              {analyticsViewTab === 'admin-overview' && (
                <div className="space-y-6">
                  {/* Admin Analytics View with Metrics & Charts */}
                  <AdminAnalyticsView data={adminData} loading={analyticsLoading} />

                  {/* ADMIN QUESTION MONITORING SECTION (Real database statistics) */}
                  {adminData?.questionOverview && (
                    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-6">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div className="space-y-0.5">
                          <h3 className="text-base font-bold text-gray-950 flex items-center gap-2">
                            <HelpCircle size={18} className="text-blue-600" />
                            Question Bank & Content Monitoring
                          </h3>
                          <p className="text-xs text-gray-400">
                            Live system-wide assessment questions audit and faculty contributions.
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                          Total Questions: {adminData.questionOverview.totalQuestions || 0}
                        </span>
                      </div>

                      {/* Question Metrics KPI Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">AI-Generated</span>
                          <p className="text-xl font-extrabold text-blue-600 flex items-center gap-1.5">
                            <BrainCircuit size={16} />
                            {adminData.questionOverview.questionsAiCount || 0}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Faculty Created</span>
                          <p className="text-xl font-extrabold text-gray-900 flex items-center gap-1.5">
                            <Users size={16} />
                            {adminData.questionOverview.questionsManualCount || 0}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">MCQ & True/False</span>
                          <p className="text-xl font-extrabold text-emerald-600">
                            {(adminData.questionOverview.typeDistribution?.mcq || 0) + (adminData.questionOverview.typeDistribution?.trueFalse || 0)}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hard Difficulty</span>
                          <p className="text-xl font-extrabold text-red-600">
                            {adminData.questionOverview.difficultyDistribution?.hard || 0}
                          </p>
                        </div>
                      </div>

                      {/* Two column breakdown: Questions by Course & Questions by Faculty */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        {/* Questions by Course */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                            Questions by Course
                          </h4>
                          {adminData.questionOverview.questionsByCourse?.length === 0 ? (
                            <p className="text-xs text-gray-400 py-3">No course question associations found.</p>
                          ) : (
                            <div className="space-y-2">
                              {adminData.questionOverview.questionsByCourse?.map((c, i) => (
                                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                                  <span className="font-semibold text-gray-800 truncate max-w-[240px]">
                                    {c.courseCode ? `[${c.courseCode}] ` : ''}{c.courseTitle}
                                  </span>
                                  <span className="font-bold text-gray-950 px-2 py-0.5 bg-white rounded-md border border-gray-200">
                                    {c.count} Qs
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Questions by Faculty */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                            Faculty Contributions
                          </h4>
                          {adminData.questionOverview.questionsByFaculty?.length === 0 ? (
                            <p className="text-xs text-gray-400 py-3">No faculty contributions recorded.</p>
                          ) : (
                            <div className="space-y-2">
                              {adminData.questionOverview.questionsByFaculty?.map((f, i) => (
                                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                                  <span className="font-semibold text-gray-800">
                                    {f.facultyName || 'Faculty Member'}
                                  </span>
                                  <span className="font-bold text-blue-600 px-2 py-0.5 bg-blue-50 rounded-md border border-blue-150">
                                    {f.count} questions
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {analyticsViewTab === 'course-analytics' && (
                <CourseAnalyticsView 
                  data={courseData} 
                  loading={analyticsLoading}
                  courses={courses}
                  selectedCourseId={selectedCourseId}
                  onSelectCourse={setSelectedCourseId}
                />
              )}

              {analyticsViewTab === 'student-analytics' && (
                <StudentAnalyticsView data={studentData} loading={analyticsLoading} />
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: REPORTS & EXPORT ENGINE */}
          {/* ======================================================== */}
          {masterTab === 'reports' && (
            <div className="space-y-6">
              {/* REPORT TYPE CATALOG CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
                {catalog.map((rep) => {
                  const isSelected = rep.id === selectedReportId;
                  return (
                    <button
                      key={rep.id}
                      type="button"
                      onClick={() => {
                        setSelectedReportId(rep.id);
                        handleGenerateReport(rep.id, reportFilters);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all space-y-2 relative overflow-hidden ${
                        isSelected
                          ? 'bg-white border-black ring-1 ring-black shadow-sm'
                          : 'bg-white border-gray-200/80 hover:border-gray-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="p-2 bg-gray-50 rounded-xl">
                          {getReportIcon(rep.id)}
                        </div>
                        {isSelected && (
                          <span className="h-2 w-2 rounded-full bg-black"></span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-gray-950 truncate">
                          {rep.title}
                        </h3>
                        <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed mt-0.5">
                          {rep.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* DYNAMIC REPORT PARAMETERS BAR */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 print:hidden">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Filter size={15} className="text-gray-900" />
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Report Parameters</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-400">
                    Selected: <span className="text-gray-900 font-bold">{selectedReportMeta.title || 'Report'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Course Filter */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Course
                    </label>
                    <select
                      value={reportFilters.courseId}
                      onChange={(e) => setReportFilters(f => ({ ...f, courseId: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs font-semibold rounded-xl px-3 py-2 focus:ring-1 focus:ring-black focus:outline-none"
                    >
                      <option value="">All Authorized Courses</option>
                      {courses.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.code ? `[${c.code}] ` : ''}{c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Risk Level Filter (for performance/at-risk reports) */}
                  {['STUDENT_PERFORMANCE', 'AT_RISK_STUDENTS'].includes(selectedReportId) && (
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Risk Tier
                      </label>
                      <select
                        value={reportFilters.riskLevel}
                        onChange={(e) => setReportFilters(f => ({ ...f, riskLevel: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs font-semibold rounded-xl px-3 py-2 focus:ring-1 focus:ring-black focus:outline-none"
                      >
                        <option value="All">All Risk Tiers</option>
                        <option value="High">High Risk</option>
                        <option value="Medium">Medium Risk</option>
                        <option value="Low">Low Risk</option>
                      </select>
                    </div>
                  )}

                  {/* Difficulty Filter (for question overview) */}
                  {selectedReportId === 'QUESTION_OVERVIEW' && (
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Difficulty
                      </label>
                      <select
                        value={reportFilters.difficulty}
                        onChange={(e) => setReportFilters(f => ({ ...f, difficulty: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs font-semibold rounded-xl px-3 py-2 focus:ring-1 focus:ring-black focus:outline-none"
                      >
                        <option value="All">All Difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  )}

                  {/* Timeframe Filter */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Timeframe
                    </label>
                    <select
                      value={reportFilters.timeframe}
                      onChange={(e) => setReportFilters(f => ({ ...f, timeframe: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs font-semibold rounded-xl px-3 py-2 focus:ring-1 focus:ring-black focus:outline-none"
                    >
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                      <option value="90d">Last 90 Days</option>
                      <option value="all">All Historical Records</option>
                    </select>
                  </div>

                  {/* Generate Button */}
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => handleGenerateReport(selectedReportId, reportFilters)}
                      disabled={loadingReport}
                      className="w-full py-2 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={13} className={loadingReport ? 'animate-spin' : ''} />
                      {loadingReport ? 'Generating...' : 'Generate Report'}
                    </button>
                  </div>
                </div>
              </div>

              {/* REPORT PREVIEW CONTAINER */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-6 print:border-none print:p-0 print:shadow-none">
                {/* Printable Header */}
                <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 bg-black rounded-lg flex items-center justify-center text-white text-xs font-bold">
                        ⚡
                      </div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-gray-950">
                        AI-LMS Academic Intelligence
                      </span>
                    </div>
                    <h2 className="text-xl font-extrabold text-gray-950">
                      {reportData?.title || selectedReportMeta.title || 'Academic Report'}
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">
                      Generated on {reportData?.generatedAt ? new Date(reportData.generatedAt).toLocaleString() : new Date().toLocaleString()} by {user?.name} ({user?.role})
                    </p>
                  </div>

                  <div className="text-left sm:text-right text-xs font-semibold text-gray-500 space-y-0.5">
                    <p><span className="text-gray-400 font-normal">Records Count:</span> <span className="text-gray-900 font-bold">{reportData?.totalRecords || (reportData?.rows?.length || 0)}</span></p>
                    <p><span className="text-gray-400 font-normal">Timeframe:</span> <span className="text-gray-900 font-bold">{reportFilters.timeframe === 'all' ? 'All Time' : reportFilters.timeframe}</span></p>
                  </div>
                </div>

                {/* SUMMARY CARDS */}
                {reportData?.summary && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                    {Object.entries(reportData.summary).map(([k, v]) => (
                      <div key={k} className="space-y-0.5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {k.replace(/([A-Z])/g, ' $1')}
                        </p>
                        <p className="text-base font-extrabold text-gray-950">
                          {v}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* TABLE SEARCH BAR */}
                <div className="flex items-center justify-between gap-4 print:hidden">
                  <div className="relative w-72">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search in generated table..."
                      value={tableSearch}
                      onChange={(e) => { setTableSearch(e.target.value); setCurrentPage(1); }}
                      className="form-input !pl-8 !py-1.5 !text-xs"
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-400">
                    Showing {paginatedRows.length} of {filteredRows.length} record(s)
                  </span>
                </div>

                {/* REPORT DATA TABLE */}
                {loadingReport ? (
                  <div className="py-20 text-center text-xs text-gray-400 animate-pulse space-y-2">
                    <p className="font-semibold text-gray-600">Extracting database records and compiling report...</p>
                  </div>
                ) : filteredRows.length === 0 ? (
                  <div className="py-16 text-center space-y-2">
                    <FileCheck size={36} className="mx-auto text-gray-300 stroke-[1.5]" />
                    <h4 className="text-sm font-bold text-gray-700">No records found</h4>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      No database entries match the selected parameters. Adjust your filters and click "Generate Report".
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-400 uppercase text-[10px] tracking-wider bg-gray-50/50">
                          {(reportData?.columns || []).map((col) => (
                            <th key={col.key} className="py-3 px-3.5 font-bold">
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedRows.map((row, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-gray-50/70 transition-colors">
                            {(reportData?.columns || []).map((col) => {
                              const val = row[col.key];
                              const isRisk = col.key === 'riskLevel';
                              const isGrade = col.key.toLowerCase().includes('grade') || col.key.toLowerCase().includes('score');

                              return (
                                <td key={col.key} className="py-3 px-3.5 font-medium text-gray-900">
                                  {isRisk ? (
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                      val === 'High' ? 'bg-red-50 text-red-700 border border-red-200' :
                                      val === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                      val === 'Low' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {val}
                                    </span>
                                  ) : isGrade ? (
                                    <span className="font-extrabold text-gray-950">{val}</span>
                                  ) : (
                                    String(val !== undefined && val !== null ? val : '—')
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* PAGINATION */}
                {totalReportPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs font-semibold text-gray-500 print:hidden">
                    <span>
                      Page {currentPage} of {totalReportPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        disabled={currentPage >= totalReportPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AnalyticsReportsPage;

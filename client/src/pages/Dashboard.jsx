import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  CheckSquare, 
  FileText, 
  Clock, 
  BookOpen, 
  Activity, 
  BrainCircuit,
  CheckCircle2,
  Edit,
  Users,
  Shield,
  Layers,
  FolderOpen,
  Database,
  Cpu,
  Server,
  TrendingUp,
  Plus,
  Settings
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  const fetchDashboardSummary = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/dashboard-summary');
      if (response.data?.success) {
        setSummary(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const todayTopic = summary?.todayTopic;
  const nextExam = summary?.nextExam;
  const pendingWorks = summary?.pendingWorks || [];
  const schedule = summary?.schedule || [];
  const upcomingExams = summary?.upcomingExams || [];
  const activities = summary?.activities || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* 260px Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 80px Fixed Header */}
        <Header />

        {/* Dashboard Grid Container */}
        <main className="flex-1 p-8 max-w-[1600px] w-full mx-auto space-y-12">
          
          {/* HERO SECTION */}
          <section className="bg-white border border-gray-200/80 rounded-[20px] p-8 flex flex-col md:flex-row items-center justify-between shadow-sm relative overflow-hidden">
            {/* Background design accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50/50 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="space-y-3 z-10 md:max-w-2xl">
              <h2 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
                Good morning, {user?.name?.split(' ')[0] || summary?.user?.name?.split(' ')[0] || 'Student'} 👋
              </h2>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
                Today’s focus shapes your future.
              </h1>
              <p className="text-gray-400 text-sm font-medium">
                Stay consistent and make progress every day.
              </p>
            </div>

            {/* Premium minimal SVG book & plant illustration */}
            <div className="shrink-0 z-10 hidden md:block">
              <svg width="220" height="120" viewBox="0 0 220 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-800">
                <line x1="10" y1="110" x2="210" y2="110" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" />
                <rect x="110" y="94" width="80" height="15" rx="3" fill="#1E293B" stroke="#E5E7EB" strokeWidth="1.5" />
                <line x1="120" y1="101" x2="180" y2="101" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
                <rect x="115" y="78" width="72" height="15" rx="3" fill="#475569" stroke="#E5E7EB" strokeWidth="1.5" />
                <line x1="125" y1="85" x2="175" y2="85" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                <rect x="105" y="62" width="85" height="15" rx="3" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5" />
                <line x1="115" y1="69" x2="180" y2="69" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M45 110L42 80H68L65 110H45Z" fill="#F1F5F9" stroke="#E5E7EB" strokeWidth="1.5" />
                <ellipse cx="55" cy="80" rx="12" ry="2" fill="#94A3B8" />
                <path d="M55 80C55 80 40 60 42 50C44 40 55 52 55 80Z" fill="#10B981" fillOpacity="0.8" />
                <path d="M55 80C55 80 70 65 68 55C66 45 55 58 55 80Z" fill="#059669" />
                <path d="M55 80C55 80 50 65 48 58C46 51 55 64 55 80Z" fill="#34D399" />
              </svg>
            </div>
          </section>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : user?.role === 'Admin' ? (
            /* ADMIN DASHBOARD VIEW */
            <div className="space-y-8">
              {/* Stats Overview */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Users */}
                <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total LMS Users</p>
                      <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{summary?.stats?.totalUsers || 0}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                      <Users size={22} />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] font-medium text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      {summary?.stats?.studentCount || 0} Students
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                      {summary?.stats?.facultyCount || 0} Faculty
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                      {summary?.stats?.adminCount || 0} Admins
                    </span>
                  </div>
                </div>

                {/* Courses & Categories */}
                <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Assigned Courses</p>
                      <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{summary?.stats?.totalCourses || 0}</h3>
                    </div>
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                      <FolderOpen size={22} />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] font-medium text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      {summary?.stats?.publishedCourses || 0} Active
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                      {summary?.stats?.draftCourses || 0} Drafts
                    </span>
                    <span className="flex items-center gap-1 font-bold text-indigo-600">
                      {summary?.stats?.totalCategories || 0} Categories
                    </span>
                  </div>
                </div>

                {/* Platform Activity */}
                <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Enrollments</p>
                      <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{summary?.stats?.totalEnrollments || 0}</h3>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                      <TrendingUp size={22} />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] font-medium text-gray-500">
                    <span className="flex items-center gap-1 font-bold text-amber-600">
                      <FileText size={12} />
                      {summary?.stats?.pendingSubmissionsCount || 0} Pending Submissions
                    </span>
                  </div>
                </div>

                {/* System Status */}
                <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Database Status</p>
                      <h3 className="text-xl font-extrabold text-emerald-600 mt-2 flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {summary?.systemInfo?.dbStatus || 'Connected'}
                      </h3>
                    </div>
                    <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl border border-slate-100">
                      <Database size={22} />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[10px] font-mono text-gray-400">
                    <span>Host: {summary?.systemInfo?.dbHost?.split(':')[0] || 'localhost'}</span>
                    <span>Mem: {summary?.systemInfo?.memoryUsage || '--'}</span>
                  </div>
                </div>
              </section>

              {/* Quick Actions */}
              <section className="space-y-4">
                <h2 className="text-base font-bold text-gray-900">Admin Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div 
                    onClick={() => navigate('/admin/users')} 
                    className="bg-white border border-gray-200/85 rounded-[20px] p-6 space-y-3 shadow-sm hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit border border-blue-100 group-hover:bg-blue-100 transition-colors">
                      <Users size={20} />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">User Management</h4>
                    <p className="text-xs text-gray-400 font-medium">Create, edit, suspend, or delete user accounts and roles.</p>
                  </div>

                  <div 
                    onClick={() => navigate('/admin/categories')} 
                    className="bg-white border border-gray-200/85 rounded-[20px] p-6 space-y-3 shadow-sm hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit border border-indigo-100 group-hover:bg-indigo-100 transition-colors">
                      <Layers size={20} />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">Course Categories</h4>
                    <p className="text-xs text-gray-400 font-medium">Create and organize program departments and subjects.</p>
                  </div>

                  <div 
                    onClick={() => navigate('/courses')} 
                    className="bg-white border border-gray-200/85 rounded-[20px] p-6 space-y-3 shadow-sm hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl w-fit border border-purple-100 group-hover:bg-purple-100 transition-colors">
                      <BookOpen size={20} />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">Course Catalog Audit</h4>
                    <p className="text-xs text-gray-400 font-medium">Browse, review curriculum outline, and audit active courses.</p>
                  </div>
                </div>
              </section>

              {/* Recent Entries Grid */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Users List */}
                <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-2">
                      <Users className="text-gray-400" size={18} />
                      <h2 className="text-base font-bold text-gray-900">Recently Registered Users</h2>
                    </div>
                    <button 
                      onClick={() => navigate('/admin/users')} 
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {(summary?.recentUsers || []).map((u) => (
                      <div key={u._id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-gray-900 truncate">{u.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${
                            u.role === 'Admin' 
                              ? 'bg-blue-50 text-blue-700 border-blue-200' 
                              : u.role === 'Faculty' 
                              ? 'bg-purple-50 text-purple-700 border-purple-200' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {u.role}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                            u.status === 'Active' 
                              ? 'bg-green-50 text-green-700' 
                              : 'bg-red-50 text-red-700'
                          }`}>
                            {u.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {(summary?.recentUsers || []).length === 0 && (
                      <p className="text-xs text-gray-400 py-6 text-center">No recent users found.</p>
                    )}
                  </div>
                </div>

                {/* Recent Courses List */}
                <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="text-gray-400" size={18} />
                      <h2 className="text-base font-bold text-gray-900">Recently Created Courses</h2>
                    </div>
                    <button 
                      onClick={() => navigate('/courses')} 
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      View Catalog
                    </button>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {(summary?.recentCourses || []).map((c) => (
                      <div key={c._id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-gray-900 truncate">{c.title}</p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {c.code} • {c.category?.name || 'Uncategorized'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-gray-500 font-medium">
                            {c.instructor?.name?.split(' ')[0] || 'Unknown'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${
                            c.status === 'Published'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {(summary?.recentCourses || []).length === 0 && (
                      <p className="text-xs text-gray-400 py-6 text-center">No recent courses found.</p>
                    )}
                  </div>
                </div>
              </section>

              {/* System Environment */}
              <section className="bg-slate-900 text-white rounded-[20px] p-6 shadow-sm border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex items-center gap-2.5 text-blue-400 mb-4">
                  <Cpu size={18} />
                  <h3 className="text-sm font-bold tracking-wider uppercase">System Environment Profile</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Runtime Version</p>
                    <p className="font-semibold text-gray-200 flex items-center gap-1.5">
                      <Server size={12} className="text-gray-400" />
                      Node {summary?.systemInfo?.nodeVersion || 'v18.0.0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Operating System</p>
                    <p className="font-semibold text-gray-200 capitalize">
                      {summary?.systemInfo?.platform === 'win32' ? 'Windows' : summary?.systemInfo?.platform || 'Linux'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Connection Host</p>
                    <p className="font-semibold text-gray-200 font-mono">
                      {summary?.systemInfo?.dbHost || 'localhost'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Memory Allocation</p>
                    <p className="font-semibold text-gray-200 font-mono">
                      {summary?.systemInfo?.memoryUsage || '--'}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          ) : user?.role === 'Faculty' ? (
            /* FACULTY DASHBOARD VIEW */
            <div className="space-y-8">
              {/* Faculty Overview Stats */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">My Taught Courses</p>
                    <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{summary?.stats?.totalCourses || 0}</h3>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                    <BookOpen size={24} />
                  </div>
                </div>

                <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Enrolled Students</p>
                    <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{summary?.stats?.totalStudents || 0}</h3>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                    <Activity size={24} />
                  </div>
                </div>

                <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pending Submissions</p>
                    <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{summary?.stats?.pendingSubmissionsCount || 0}</h3>
                  </div>
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
                    <FileText size={24} />
                  </div>
                </div>
              </section>

              {/* My Taught Courses Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">My Assigned Courses</h2>
                    <p className="text-xs text-gray-400 font-medium">Displaying courses taught exclusively by you</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate('/courses/new')}
                      className="bg-black hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
                    >
                      <Sparkles size={14} /> Create Course
                    </button>
                    <button
                      onClick={() => navigate('/manage-courses')}
                      className="border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
                    >
                      Manage All My Courses
                    </button>
                  </div>
                </div>

                {(summary?.myCourses || []).length === 0 ? (
                  <div className="bg-white border border-gray-200/80 rounded-[20px] p-12 text-center space-y-3 shadow-sm">
                    <BookOpen size={36} className="mx-auto text-gray-400" />
                    <h3 className="text-base font-bold text-gray-900">No courses created yet</h3>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      Click "Create Course" to add your first course to the platform.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {summary.myCourses.map((c) => (
                      <div key={c._id} className="bg-white border border-gray-200/80 hover:border-gray-300 p-6 rounded-[20px] space-y-4 shadow-sm flex flex-col justify-between transition-all group">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-150">
                              {c.category?.name || 'General'}
                            </span>
                            <span className="font-mono text-xs font-bold text-gray-700 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-200">
                              {c.code}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                              {c.title}
                            </h4>
                            <p className="text-xs text-gray-500 font-medium line-clamp-2 mt-1">
                              {c.shortDescription || 'Course overview and curriculum topics.'}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                          <span className={`px-2.5 py-1 rounded-full font-bold border ${
                            c.status === 'Published'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {c.status}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/courses/${c._id}/edit`)}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl flex items-center gap-1.5 transition-all text-[11px]"
                            >
                              <Edit size={12} /> Edit
                            </button>
                            <button
                              onClick={() => navigate(`/courses/${c._id}`)}
                              className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                            >
                              View <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Faculty Quick Actions */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 space-y-3 shadow-sm hover:border-gray-300 transition-all cursor-pointer" onClick={() => navigate('/ai-quiz-generator')}>
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl w-fit border border-purple-100">
                    <BrainCircuit size={20} />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">AI Quiz Generator</h4>
                  <p className="text-xs text-gray-400 font-medium">Instantly generate quizzes from course syllabus using AI.</p>
                </div>

                <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 space-y-3 shadow-sm hover:border-gray-300 transition-all cursor-pointer" onClick={() => navigate('/question-bank')}>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit border border-blue-100">
                    <BookOpen size={20} />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">Question Bank</h4>
                  <p className="text-xs text-gray-400 font-medium">Manage and organize questions across your taught subjects.</p>
                </div>

                <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 space-y-3 shadow-sm hover:border-gray-300 transition-all cursor-pointer" onClick={() => navigate('/assignments')}>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit border border-emerald-100">
                    <FileText size={20} />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">Assignments & Submissions</h4>
                  <p className="text-xs text-gray-400 font-medium">Review and grade student assignment submissions with AI assistance.</p>
                </div>
              </section>
            </div>
          ) : (
            <>
              {/* FIRST ROW: 3 Large Cards */}

              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Card 1: Today's Topic */}
                <div className="premium-card flex flex-col justify-between h-72">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <BookOpen size={16} />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Today's Topic</span>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold text-blue-600">
                        {todayTopic ? todayTopic.unitTitle || todayTopic.courseTitle : 'No Active Topic'}
                      </p>
                      <h3 className="text-xl font-bold text-gray-900 leading-snug">
                        {todayTopic ? todayTopic.title : 'Ready to Start Learning?'}
                      </h3>
                      <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed line-clamp-2">
                        {todayTopic ? todayTopic.description : 'Enroll in a course or generate a study plan to track daily learning targets.'}
                      </p>
                    </div>
                  </div>

                  {/* Action layout */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      {/* Progress ring SVG */}
                      <div className="relative h-11 w-11 flex items-center justify-center">
                        <svg className="absolute transform -rotate-90" width="44" height="44">
                          <circle cx="22" cy="22" r="18" stroke="#F1F5F9" strokeWidth="3" fill="transparent" />
                          <circle
                            cx="22"
                            cy="22"
                            r="18"
                            stroke="#2563EB"
                            strokeWidth="3"
                            fill="transparent"
                            strokeDasharray="113"
                            strokeDashoffset={113 - (113 * (todayTopic?.progressPercentage || 0)) / 100}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="text-[10px] font-bold text-gray-500">
                          {todayTopic?.progressPercentage || 0}%
                        </span>
                      </div>
                      
                      <div className="text-[11px] font-medium text-gray-400">
                        <p className="text-gray-950 font-bold">Estimated time</p>
                        <p className="mt-0.5">{todayTopic?.estimatedMinutes || 45} min</p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(todayTopic ? '/study-planner' : '/courses')}
                      className="bg-black hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
                    >
                      {todayTopic ? 'Start Learning' : 'Browse Catalog'}
                    </button>
                  </div>
                </div>

                {/* Card 2: Next Exam Countdown */}
                <div className="premium-card flex flex-col justify-between h-72">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar size={16} />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Days Until Next Exam</span>
                    </div>
                    
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-extrabold tracking-tight text-gray-900">
                        {nextExam ? nextExam.daysLeft : '--'}
                      </span>
                      <span className="text-xs font-medium text-gray-400">
                        {nextExam ? 'days left' : 'no active exam date'}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-gray-900">
                        {nextExam ? nextExam.title : 'No Upcoming Exam Scheduled'}
                      </p>
                      <p className="text-[11px] font-medium text-gray-400">
                        {nextExam ? `${nextExam.date} ${nextExam.courseCode ? `(${nextExam.courseCode})` : ''}` : 'Set target dates in AI Study Planner'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg">
                      {nextExam ? 'Preparation needed' : 'On Track'}
                    </span>
                    
                    <button
                      onClick={() => navigate('/study-planner')}
                      className="text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
                    >
                      Open Planner
                    </button>
                  </div>
                </div>

                {/* Card 3: Pending Works */}
                <div className="premium-card h-72 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-400">
                        <CheckSquare size={16} />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Pending Works</span>
                      </div>
                      <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-150 px-2 py-0.5 rounded-full">
                        {pendingWorks.length} tasks
                      </span>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2">
                      {pendingWorks.length > 0 ? (
                        pendingWorks.slice(0, 4).map((work) => (
                          <div key={work.id} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                            <div className="min-w-0 pr-2">
                              <p className="font-semibold text-gray-900 truncate leading-tight">
                                {work.title}
                              </p>
                              <p className="text-[10px] font-medium text-gray-400 mt-0.5">
                                {work.due}
                              </p>
                            </div>
                            
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${work.color}`}>
                              {work.priority}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-xs text-gray-400 space-y-1">
                          <CheckCircle2 size={24} className="mx-auto text-emerald-500" />
                          <p className="font-semibold text-gray-700">All caught up!</p>
                          <p className="text-[11px]">No pending assignments or study tasks.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-50 text-center">
                    <button
                      onClick={() => navigate('/study-planner')}
                      className="w-full text-blue-600 hover:text-blue-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      View all pending work
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>

              </section>

              {/* SECOND ROW: Schedule (Left) & Quick Actions (Right) */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Today's Schedule */}
                <div className="premium-card lg:col-span-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="text-gray-400" size={18} />
                      <h2 className="text-base font-bold text-gray-900">Today's Schedule</h2>
                    </div>
                    <button
                      onClick={() => navigate('/study-planner')}
                      className="text-xs text-gray-400 hover:text-gray-900 transition-colors font-medium"
                    >
                      View Calendar
                    </button>
                  </div>

                  {/* Timeline Layout */}
                  {schedule.length > 0 ? (
                    <div className="space-y-6 relative pl-4 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                      {schedule.map((item, idx) => (
                        <div key={item.id || idx} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          {/* Timeline bullet dot */}
                          <div className={`absolute left-[-21px] h-3.5 w-3.5 rounded-full border-4 border-white bg-white shadow-sm ring-2 ring-gray-100 z-10 flex items-center justify-center`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-emerald-500' : idx === 2 ? 'bg-amber-500' : 'bg-purple-500'}`} />
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-900 w-20 shrink-0">{item.time}</span>
                            <div className="space-y-0.5">
                              <p className="text-xs font-semibold text-gray-800">{item.title}</p>
                              <p className="text-[10px] text-gray-400 font-medium">{item.detail}</p>
                            </div>
                          </div>

                          <div className="text-[10px] font-semibold text-gray-400 sm:text-right">
                            {item.duration}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs text-gray-400">
                      No schedule items set for today.
                    </div>
                  )}
                </div>

                {/* Right: Quick Actions */}
                <div className="premium-card lg:col-span-4 flex flex-col justify-between h-[360px] lg:h-auto">
                  <div className="space-y-6">
                    <div className="border-b border-gray-100 pb-4">
                      <h2 className="text-base font-bold text-gray-900">Quick Actions</h2>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => navigate('/ai-tutor')}
                        className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-150 text-xs font-semibold text-gray-800 transition-all text-left"
                      >
                        <span className="flex items-center gap-2">
                          <Sparkles size={14} className="text-blue-600" />
                          Ask AI Tutor
                        </span>
                        <ArrowRight size={12} className="text-gray-400" />
                      </button>

                      <button
                        onClick={() => navigate('/personalized-learning')}
                        className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-150 text-xs font-semibold text-gray-800 transition-all text-left"
                      >
                        <span className="flex items-center gap-2">
                          <BrainCircuit size={14} className="text-purple-600" />
                          Personalized Learning
                        </span>
                        <ArrowRight size={12} className="text-gray-400" />
                      </button>

                      <button
                        onClick={() => navigate('/study-planner')}
                        className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-150 text-xs font-semibold text-gray-800 transition-all text-left"
                      >
                        <span className="flex items-center gap-2">
                          <Calendar size={14} className="text-emerald-600" />
                          Open Study Planner
                        </span>
                        <ArrowRight size={12} className="text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 text-center border-t border-gray-50">
                    <button
                      onClick={() => navigate('/courses')}
                      className="text-xs text-blue-600 hover:text-blue-700 font-bold transition-colors"
                    >
                      Browse Course Catalog
                    </button>
                  </div>
                </div>

              </section>

              {/* THIRD ROW: Upcoming Exams (Left) & Recent Activity (Right) */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left: Upcoming Exams */}
                <div className="premium-card space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="text-gray-400" size={18} />
                      <h2 className="text-base font-bold text-gray-900">Upcoming Exams</h2>
                    </div>
                    <button
                      onClick={() => navigate('/study-planner')}
                      className="text-xs text-gray-400 hover:text-gray-900 transition-colors font-medium"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {upcomingExams.length > 0 ? (
                      upcomingExams.map((exam, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200/85 rounded-2xl">
                          <div className="flex items-center gap-4">
                            <div className="bg-white border border-gray-200 text-center w-12 py-1.5 rounded-xl shrink-0">
                              <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Target</p>
                              <p className="text-base font-extrabold text-gray-900 mt-1 leading-none">
                                {exam.daysLeft}d
                              </p>
                            </div>

                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-gray-900">{exam.title}</p>
                              <p className="text-[10px] font-medium text-gray-400">
                                {exam.date} • {exam.time}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-xs font-bold text-gray-900">{exam.daysLeft}</p>
                            <p className="text-[10px] text-gray-400 font-medium">Days Left</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-xs text-gray-400">
                        No upcoming exams scheduled.
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Recent Activity */}
                <div className="premium-card space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-2">
                      <Activity className="text-gray-400" size={18} />
                      <h2 className="text-base font-bold text-gray-900">Recent Activity</h2>
                    </div>
                    <button
                      onClick={() => navigate('/personalized-learning')}
                      className="text-xs text-gray-400 hover:text-gray-900 transition-colors font-medium"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-4">
                    {activities.length > 0 ? (
                      activities.map((act, idx) => (
                        <div key={act.id || idx} className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg border flex items-center justify-center shrink-0 ${act.iconColor}`}>
                            <FileText size={13} />
                          </div>

                          <div className="space-y-0.5">
                            <p className="text-xs font-medium text-gray-800">{act.text}</p>
                            <p className="text-[10px] text-gray-400">{act.time}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-xs text-gray-400">
                        No recent activity recorded yet.
                      </div>
                    )}
                  </div>
                </div>

              </section>
            </>
          )}

        </main>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import analyticsService from '../../services/analyticsService';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import StudentRiskCard from '../../components/analytics/StudentRiskCard';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  RefreshCw, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2,
  Users
} from 'lucide-react';

const AtRiskStudentsPage = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [atRiskData, setAtRiskData] = useState({ totalCount: 0, highRiskCount: 0, mediumRiskCount: 0, students: [] });
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchAtRiskStudents();
  }, [selectedCourseId, selectedRiskLevel]);

  const fetchCourses = async () => {
    try {
      let endpoint = '/courses';
      if (user.role === 'Faculty') endpoint = '/courses/my-courses';
      const res = await api.get(endpoint);
      if (res.data?.success) {
        setCourses(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const fetchAtRiskStudents = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (selectedCourseId) filters.courseId = selectedCourseId;
      if (selectedRiskLevel !== 'All') filters.riskLevel = selectedRiskLevel;

      const res = await analyticsService.getAtRiskStudents(filters);
      if (res?.success) {
        setAtRiskData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch at-risk students:', err);
    } finally {
      setLoading(false);
    }
  };

  // Client side search filter
  const filteredStudents = atRiskData.students.filter(item => {
    if (!searchQuery.trim()) return true;
    const name = item.student?.name || '';
    const email = item.student?.email || '';
    const courseTitle = item.course?.title || '';
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) || email.toLowerCase().includes(query) || courseTitle.toLowerCase().includes(query);
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-8 max-w-[1600px] w-full mx-auto space-y-8">
          {/* HEADER BANNER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider">
                <ShieldAlert size={14} />
                <span>At-Risk Student Monitoring Portal</span>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Early Intervention & Risk Detection
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Identify students facing academic difficulty before assessment deadlines.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-center">
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">High Risk</p>
                <p className="text-xl font-extrabold text-red-700">{atRiskData.highRiskCount}</p>
              </div>
              <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Medium Risk</p>
                <p className="text-xl font-extrabold text-amber-700">{atRiskData.mediumRiskCount}</p>
              </div>
              <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-center">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Identified</p>
                <p className="text-xl font-extrabold text-gray-900">{atRiskData.totalCount}</p>
              </div>
            </div>
          </div>

          {/* FILTER CONTROLS BAR */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search student by name, email, or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Course Filter */}
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-gray-400" />
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">All Courses</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code ? `${c.code}: ` : ''}{c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Risk Filter */}
              <select
                value={selectedRiskLevel}
                onChange={(e) => setSelectedRiskLevel(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="All">All Risk Levels</option>
                <option value="High">High Risk Only</option>
                <option value="Medium">Medium Risk Only</option>
                <option value="Low">Low Risk Only</option>
                <option value="Unevaluated">Unevaluated Only</option>
              </select>

              <button
                onClick={fetchAtRiskStudents}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                title="Refresh Analytics"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* STUDENT RISK CARDS GRID */}
          {loading ? (
            <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl space-y-3">
              <RefreshCw size={24} className="animate-spin text-black mx-auto" />
              <p className="text-xs font-bold text-gray-500">Evaluating student risk vectors...</p>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredStudents.map((perf, index) => (
                <StudentRiskCard
                  key={`${perf.student.id}-${perf.course.id}-${index}`}
                  performance={perf}
                  onSelectStudent={(p) => setSelectedStudentDetail(p)}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl space-y-3">
              <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-gray-900">No At-Risk Students Found</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                No students match your current search and risk level filters. All enrolled students are maintaining satisfactory academic standing.
              </p>
            </div>
          )}

          {/* STUDENT DETAIL MODAL */}
          {selectedStudentDetail && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl animate-scaleUp">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedStudentDetail.student.name}</h3>
                    <p className="text-xs text-gray-400">{selectedStudentDetail.student.email} • {selectedStudentDetail.course.title}</p>
                  </div>
                  <button
                    onClick={() => setSelectedStudentDetail(null)}
                    className="text-gray-400 hover:text-gray-900 text-lg font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Estimated Final Score</p>
                      <p className="text-2xl font-extrabold text-gray-900">{selectedStudentDetail.prediction.predictedScore}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-400 uppercase">Inactivity</p>
                      <p className="text-base font-extrabold text-gray-900">{selectedStudentDetail.metrics.daysInactive} days ago</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-900 uppercase">Feature Breakdown</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-gray-50 rounded-lg">Quiz Average: <strong>{selectedStudentDetail.metrics.quizAvgScore}%</strong></div>
                      <div className="p-2.5 bg-gray-50 rounded-lg">Assignment Average: <strong>{selectedStudentDetail.metrics.assignmentAvgScore}%</strong></div>
                      <div className="p-2.5 bg-gray-50 rounded-lg">Submission Rate: <strong>{selectedStudentDetail.metrics.assignmentSubmissionRate}%</strong></div>
                      <div className="p-2.5 bg-gray-50 rounded-lg">Course Progress: <strong>{selectedStudentDetail.metrics.courseProgress}%</strong></div>
                    </div>
                  </div>

                  {selectedStudentDetail.prediction.interventions?.length > 0 && (
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-2">
                      <h4 className="text-xs font-bold text-blue-900 uppercase">Recommended Faculty Actions</h4>
                      <ul className="list-disc pl-5 text-xs text-blue-800 space-y-1 font-medium">
                        {selectedStudentDetail.prediction.interventions.map((action, idx) => (
                          <li key={idx}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSelectedStudentDetail(null)}
                    className="px-5 py-2.5 bg-black text-white font-bold rounded-xl text-xs"
                  >
                    Close Inspection
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AtRiskStudentsPage;

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Breadcrumb from '../../components/content/Breadcrumb';
import AssignmentCard from '../../components/assessment/AssignmentCard';
import EmptyState from '../../components/content/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import { getAllAssignments } from '../../services/assessmentService';
import { FileText, Filter, AlertCircle, CheckCircle2, Search } from 'lucide-react';

const GlobalAssignmentsPage = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAllAssignmentsData = async () => {
    setLoading(true);
    try {
      const res = await getAllAssignments();
      if (res.success) {
        setAssignments(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAssignmentsData();
  }, []);

  // Filter assignments based on search term & filter tab
  const filteredAssignments = assignments.filter((assign) => {
    const matchesSearch =
      assign.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assign.courseId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assign.courseId?.code?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'All') return true;
    if (filter === 'Pending') {
      return !assign.mySubmission || assign.mySubmission.status === 'Submitted';
    }
    if (filter === 'Graded') {
      return assign.mySubmission?.status === 'Graded';
    }
    if (filter === 'Overdue') {
      return new Date(assign.deadline) < new Date() && (!assign.mySubmission || assign.mySubmission.status !== 'Graded');
    }
    return true;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Assignments Hub' }]} />

        {/* Hero Header */}
        <div className="bg-white border border-gray-200/80 p-6 sm:p-8 rounded-[20px] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Assignments Hub ({assignments.length})
            </h1>
            <p className="text-xs text-gray-500 max-w-xl">
              {user?.role === 'Student'
                ? 'View all active course assignments, track deadlines, submit homework files, and review instructor grades.'
                : 'Manage course assignments, set submission parameters, and evaluate student submissions across your courses.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200/80 overflow-x-auto shrink-0">
            {['All', 'Pending', 'Graded', 'Overdue'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filter === tab
                    ? 'bg-white text-gray-900 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search assignments or courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="premium-input text-xs pl-9 py-2"
            />
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map((assign) => (
              <AssignmentCard
                key={assign._id}
                assignment={assign}
                userRole={user?.role}
                canManage={['Admin', 'Faculty'].includes(user?.role)}
              />
            ))
          ) : (
            <EmptyState
              icon={FileText}
              title="No Assignments Found"
              description={
                searchTerm
                  ? `No assignments match your search query "${searchTerm}".`
                  : 'You have no active assignments for your courses.'
              }
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GlobalAssignmentsPage;

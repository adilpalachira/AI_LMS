import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getMyTaughtCourses, publishCourse, archiveCourse, deleteCourse, getCategories } from '../../services/courseService';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import CourseFilter from '../../components/courses/CourseFilter';
import { Plus, Edit2, Trash2, Globe, Archive, CheckCircle, AlertCircle, BookOpen, Eye } from 'lucide-react';

const ManageCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const fetchCourses = async () => {
    setLoading(true);
    try {
      let res;
      if (user?.role === 'Admin') {
        res = await api.get('/courses?limit=100');
        if (res.data.success) {
          setCourses(res.data.data.courses);
        }
      } else {
        res = await getMyTaughtCourses();
        if (res.success) {
          setCourses(res.data);
        }
      }

      const catRes = await getCategories();
      if (catRes.success) {
        setCategories(catRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const handlePublish = async (id, title) => {
    try {
      await publishCourse(id);
      setSuccess(`Course "${title}" has been published successfully.`);
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish course');
    }
  };

  const handleArchive = async (id, title) => {
    try {
      await archiveCourse(id);
      setSuccess(`Course "${title}" has been archived.`);
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to archive course');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the course "${title}"? This cannot be undone.`)) return;

    try {
      await deleteCourse(id);
      setSuccess(`Course "${title}" deleted successfully.`);
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setLevel('All');
    setStatus('All');
    setSortBy('newest');
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'All' || c.category?._id === category || c.category?.slug === category;
    const matchesLevel = level === 'All' || c.level === level;
    const matchesStatus = status === 'All' || c.status === status;
    return matchesSearch && matchesCat && matchesLevel && matchesStatus;
  });

  return (
    <DashboardLayout>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-gray-200/80 p-6 sm:p-8 rounded-[20px] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider">
            <BookOpen size={16} />
            <span>Course Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Manage Courses
          </h1>
          <p className="text-gray-500 text-xs font-medium">
            {user?.role === 'Admin'
              ? 'Admin Portal: View, edit, publish, or delete all LMS courses'
              : 'Faculty Portal: Manage your assigned courses and course details'}
          </p>
        </div>

        <Link
          to="/courses/new"
          className="bg-slate-900 hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all shadow-sm text-xs shrink-0"
        >
          <Plus size={16} />
          Create Course
        </Link>
      </div>

      {/* Notifications */}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl text-xs font-semibold">
          <CheckCircle size={16} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-semibold">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Component */}
      <CourseFilter
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        level={level}
        setLevel={setLevel}
        status={status}
        setStatus={setStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
        categories={categories}
        showStatusFilter={true}
        onReset={handleResetFilters}
      />

      {/* Course Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white border border-gray-200/80 rounded-[20px] p-12 text-center space-y-3 shadow-sm">
          <BookOpen size={36} className="mx-auto text-gray-400" />
          <h3 className="text-lg font-bold text-gray-900">No courses found</h3>
          <p className="text-gray-500 text-xs max-w-sm mx-auto">
            {search || category !== 'All' || status !== 'All'
              ? 'No courses matched your current filter selection.'
              : 'Click "Create Course" to add your first course to the platform.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200/80 rounded-[20px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-400 uppercase tracking-wider font-bold">
                  <th className="py-4 px-6">Course</th>
                  <th className="py-4 px-4">Code</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Instructor</th>
                  <th className="py-4 px-4 text-center">Enrolled</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredCourses.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                          {c.thumbnail ? (
                            <img
                              src={`http://localhost:5000/${c.thumbnail}`}
                              alt={c.title}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <BookOpen size={18} className="text-blue-600" />
                          )}
                        </div>
                        <div>
                          <Link to={`/courses/${c._id}`} className="font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
                            {c.title}
                          </Link>
                          <span className="text-[11px] text-gray-400 font-medium">{c.level}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-gray-700">{c.code}</td>
                    <td className="py-4 px-4 text-gray-700 font-semibold">{c.category?.name || 'General'}</td>
                    <td className="py-4 px-4 text-gray-700">{c.instructor?.name || 'Faculty'}</td>
                    <td className="py-4 px-4 text-center text-gray-900 font-bold">{c.enrolledCount || 0}</td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          c.status === 'Published'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : c.status === 'Draft'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-1.5">
                      <Link
                        to={`/courses/${c._id}`}
                        title="View Details"
                        className="inline-flex p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors border border-gray-200"
                      >
                        <Eye size={14} />
                      </Link>

                      <Link
                        to={`/courses/${c._id}/edit`}
                        title="Edit Course"
                        className="inline-flex p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors border border-gray-200"
                      >
                        <Edit2 size={14} />
                      </Link>

                      {c.status !== 'Published' && (
                        <button
                          onClick={() => handlePublish(c._id, c.title)}
                          title="Publish Course"
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors border border-emerald-200"
                        >
                          <Globe size={14} />
                        </button>
                      )}

                      {c.status === 'Published' && (
                        <button
                          onClick={() => handleArchive(c._id, c.title)}
                          title="Archive Course"
                          className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl transition-colors border border-amber-200"
                        >
                          <Archive size={14} />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(c._id, c.title)}
                        title="Delete Course"
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-colors border border-rose-200"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManageCourses;

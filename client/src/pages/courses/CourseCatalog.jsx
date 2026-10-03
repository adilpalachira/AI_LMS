import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  getCourses, 
  getCategories, 
  enrollCourse, 
  publishCourse, 
  archiveCourse, 
  deleteCourse,
  getMyTaughtCourses 
} from '../../services/courseService';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import CourseCard from '../../components/courses/CourseCard';
import CourseFilter from '../../components/courses/CourseFilter';
import { 
  BookOpen, 
  Sparkles, 
  AlertCircle, 
  CheckCircle, 
  Plus, 
  Edit2, 
  Trash2, 
  Globe, 
  Archive, 
  Eye, 
  Layers, 
  LayoutGrid, 
  ListOrdered,
  FolderOpen
} from 'lucide-react';

const CourseCatalog = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Admin and Faculty can toggle between Table management and Grid catalog
  const isStaff = ['Admin', 'Faculty'].includes(user?.role);
  const [viewMode, setViewMode] = useState(isStaff ? 'table' : 'grid');

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pagination & Filtering state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [enrollingId, setEnrollingId] = useState(null);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      if (isStaff && viewMode === 'table') {
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
      } else {
        const res = await getCourses({
          search,
          category,
          level,
          sortBy,
          page,
          limit: 9
        });

        if (res.success) {
          setCourses(res.data.courses);
          setTotalPages(res.data.pagination.totalPages);
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
  }, [search, category, level, status, sortBy, page, viewMode]);

  const handleEnroll = async (courseId) => {
    if (!user) {
      setError('Please log in as a student to enroll in courses.');
      return;
    }

    if (user.role !== 'Student') {
      setError('Only Students can enroll in courses.');
      return;
    }

    setEnrollingId(courseId);
    setError('');
    setSuccess('');

    try {
      const response = await enrollCourse(courseId);
      if (response.success) {
        setSuccess('Successfully enrolled in course!');
        fetchCourses();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed.');
    } finally {
      setEnrollingId(null);
    }
  };

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

  const handleReset = () => {
    setSearch('');
    setCategory('All');
    setLevel('All');
    setStatus('All');
    setSortBy('newest');
    setPage(1);
  };

  // Client-side filtering for table view
  const tableFilteredCourses = isStaff && viewMode === 'table'
    ? courses.filter((c) => {
        const matchesSearch =
          c.title?.toLowerCase().includes(search.toLowerCase()) ||
          c.code?.toLowerCase().includes(search.toLowerCase());
        const matchesCat = category === 'All' || c.category?._id === category || c.category?.slug === category;
        const matchesLevel = level === 'All' || c.level === level;
        const matchesStatus = status === 'All' || c.status === status;
        return matchesSearch && matchesCat && matchesLevel && matchesStatus;
      })
    : courses;

  return (
    <DashboardLayout>
      {/* Hero / Header Banner */}
      <section className="bg-white border border-gray-200/80 rounded-[20px] p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-150">
            <Sparkles size={13} />
            {isStaff ? 'Central Course Management & Catalog' : 'Explore Verified University Courses'}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
            {isStaff ? 'Courses' : 'Course Catalog'}
          </h1>

          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
            {isStaff
              ? 'View, organize, edit syllabus content, assign faculty, and publish courses across the institution.'
              : 'Discover courses created by top faculty members, learn at your own pace, and accelerate your academic progress.'}
          </p>
        </div>

        {/* Action Controls for Admin/Faculty */}
        {isStaff && (
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* View Mode Toggle */}
            <div className="inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <ListOrdered size={14} />
                Management Table
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <LayoutGrid size={14} />
                Catalog Cards
              </button>
            </div>

            <Link
              to="/courses/new"
              className="bg-slate-900 hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all shadow-sm text-xs shrink-0"
            >
              <Plus size={15} />
              Create Course
            </Link>
          </div>
        )}
      </section>

      {/* Notifications Feedback */}
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

      {/* Filters Bar */}
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
        showStatusFilter={isStaff && viewMode === 'table'}
        onReset={handleReset}
      />

      {/* MAIN VIEW CONTENT: TABLE OR GRID */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : isStaff && viewMode === 'table' ? (
        // TABLE MANAGEMENT VIEW FOR ADMIN/FACULTY
        tableFilteredCourses.length === 0 ? (
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
                  {tableFilteredCourses.map((c) => (
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
                          to={`/courses/${c._id}/manage-content`}
                          title="Manage Syllabus & Lessons"
                          className="inline-flex p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors border border-blue-200"
                        >
                          <FolderOpen size={14} />
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
                            type="button"
                            onClick={() => handlePublish(c._id, c.title)}
                            title="Publish Course"
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors border border-emerald-200"
                          >
                            <Globe size={14} />
                          </button>
                        )}

                        {c.status === 'Published' && (
                          <button
                            type="button"
                            onClick={() => handleArchive(c._id, c.title)}
                            title="Archive Course"
                            className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl transition-colors border border-amber-200"
                          >
                            <Archive size={14} />
                          </button>
                        )}

                        <button
                          type="button"
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
        )
      ) : (
        // GRID CATALOG VIEW (For Students or staff in catalog mode)
        courses.length === 0 ? (
          <div className="bg-white border border-gray-200/80 rounded-[20px] p-16 text-center space-y-3 shadow-sm">
            <BookOpen size={36} className="mx-auto text-gray-400" />
            <h3 className="text-lg font-bold text-gray-900">No published courses found</h3>
            <p className="text-gray-500 text-xs max-w-md mx-auto">
              {search || category !== 'All' || level !== 'All'
                ? 'No courses matched your search criteria. Try adjusting your filters.'
                : 'There are currently no published courses available in the catalog.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                isEnrolled={course.isEnrolled}
                onEnroll={user?.role === 'Student' ? handleEnroll : null}
                loadingId={enrollingId}
              />
            ))}
          </div>
        )
      )}

      {/* Pagination (Grid mode) */}
      {viewMode === 'grid' && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="py-2 px-4 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 text-gray-700 text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            Previous
          </button>

          <span className="text-xs text-gray-500 font-medium px-3">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="py-2 px-4 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 text-gray-700 text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            Next
          </button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CourseCatalog;

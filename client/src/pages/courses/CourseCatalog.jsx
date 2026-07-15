import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getCourses, getCategories, enrollCourse } from '../../services/courseService';
import { useAuth } from '../../hooks/useAuth';
import CourseCard from '../../components/courses/CourseCard';
import CourseFilter from '../../components/courses/CourseFilter';
import { BookOpen, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

const CourseCatalog = () => {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pagination & Filtering state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [enrollingId, setEnrollingId] = useState(null);

  const fetchCourses = async () => {
    setLoading(true);
    try {
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

      const catRes = await getCategories({ status: 'Active' });
      if (catRes.success) {
        setCategories(catRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [search, category, level, sortBy, page]);

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

  const handleReset = () => {
    setSearch('');
    setCategory('All');
    setLevel('All');
    setSortBy('newest');
    setPage(1);
  };

  return (
    <DashboardLayout>
      {/* Hero Banner */}
      <section className="bg-white border border-gray-200/80 rounded-[20px] p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-150">
            <Sparkles size={13} />
            Explore Verified University Courses
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Course Catalog
          </h1>

          <p className="text-gray-500 text-sm leading-relaxed">
            Discover courses created by top faculty members, learn at your own pace, and unlock AI tutoring tools to accelerate your progress.
          </p>
        </div>
      </section>

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
        sortBy={sortBy}
        setSortBy={setSortBy}
        categories={categories}
        onReset={handleReset}
      />

      {/* Course Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : courses.length === 0 ? (
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
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

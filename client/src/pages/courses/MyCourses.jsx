import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getMyEnrollments } from '../../services/courseService';
import { BookOpen, Award, ArrowRight, Play, AlertCircle } from 'lucide-react';

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEnrollments = async () => {
      setLoading(true);
      try {
        const res = await getMyEnrollments();
        if (res.success) {
          setEnrollments(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your enrolled courses');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  return (
    <DashboardLayout>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-gray-200/80 p-6 sm:p-8 rounded-[20px] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider">
            <Award size={16} />
            <span>Student Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            My Enrolled Courses
          </h1>
          <p className="text-gray-500 text-xs font-medium">
            Track your active learning progress and continue your coursework
          </p>
        </div>

        <Link
          to="/courses"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all shadow-sm text-xs shrink-0"
        >
          <BookOpen size={16} />
          Browse Catalog
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-semibold">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="bg-white border border-gray-200/80 rounded-[20px] p-16 text-center space-y-4 shadow-sm">
          <BookOpen size={36} className="mx-auto text-gray-400" />
          <h3 className="text-lg font-bold text-gray-900">You have no active course enrollments</h3>
          <p className="text-gray-500 text-xs max-w-md mx-auto">
            Explore our published course catalog and enroll in subjects to start learning with AI assist.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all shadow-sm text-xs"
          >
            Explore Catalog <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((item) => {
            const course = item.course;
            if (!course) return null;

            return (
              <div
                key={item._id}
                className="bg-white border border-gray-200/80 hover:border-gray-300 p-6 rounded-[20px] space-y-4 flex flex-col justify-between transition-all shadow-sm group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-150">
                      {course.category?.name || 'General'}
                    </span>
                    <span className="font-mono text-xs font-bold text-gray-700 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-200">
                      {course.code}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <Link
                      to={`/courses/${course._id}`}
                      className="text-base font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
                    >
                      {course.title}
                    </Link>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                      {course.shortDescription}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-semibold">Course Progress</span>
                      <span className="font-bold text-gray-900">{item.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
                      <div
                        className="bg-blue-600 h-full transition-all duration-500 rounded-full"
                        style={{ width: `${item.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-gray-400 font-medium">
                    Enrolled: {new Date(item.enrollmentDate).toLocaleDateString()}
                  </div>

                  <Link
                    to={`/courses/${course._id}`}
                    className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Play size={13} /> Resume
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyCourses;

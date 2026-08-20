import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getCourseById, enrollCourse, unenrollCourse } from '../../services/courseService';
import { getSectionsByCourse } from '../../services/contentService';
import SectionCard from '../../components/content/SectionCard';
import { useAuth } from '../../hooks/useAuth';
import {
  BookOpen, Clock, Users, Globe, Award, CheckCircle, ArrowLeft,
  Check, AlertCircle, PlayCircle, ShieldCheck, Layers, Settings, Plus, Edit2
} from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCourseDetails = async () => {
    setLoading(true);
    try {
      const res = await getCourseById(id);
      if (res.success) {
        setCourse(res.data);
      }
      const secRes = await getSectionsByCourse(id);
      if (secRes.success) {
        setSections(secRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const handleEnrollToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'Student') {
      setError('Only Students can enroll in courses.');
      return;
    }

    setEnrollLoading(true);
    setError('');
    setSuccess('');

    try {
      if (course.isEnrolled) {
        if (window.confirm('Are you sure you want to unenroll from this course?')) {
          await unenrollCourse(course._id);
          setSuccess('Unenrolled successfully.');
        }
      } else {
        await enrollCourse(course._id);
        setSuccess('Successfully enrolled in course!');
      }
      fetchCourseDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    } finally {
      setEnrollLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !course) {
    return (
      <DashboardLayout>
        <div className="bg-white border border-gray-200/80 rounded-[20px] p-12 text-center space-y-4 max-w-2xl mx-auto shadow-sm">
          <AlertCircle size={40} className="mx-auto text-rose-500" />
          <h2 className="text-xl font-bold text-gray-900">{error || 'Course Not Found'}</h2>
          <Link to="/courses" className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline">
            <ArrowLeft size={16} /> Back to Course Catalog
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Back Link */}
      <div>
        <Link
          to="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Catalog
        </Link>
      </div>

      {/* Hero Card Banner */}
      <div className="bg-white border border-gray-200/80 p-8 sm:p-10 rounded-[20px] grid grid-cols-1 lg:grid-cols-3 gap-8 items-center shadow-sm">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-150">
              {course.category?.name || 'General'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
              {course.level}
            </span>
            <span className="font-mono text-xs text-gray-700 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200 font-semibold">
              {course.code}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
            {course.title}
          </h1>

          <p className="text-gray-500 text-sm leading-relaxed">
            {course.shortDescription}
          </p>

          <div className="flex items-center gap-6 text-xs text-gray-600 font-medium flex-wrap pt-2">
            <div className="flex items-center gap-1.5">
              <Users size={16} className="text-blue-600" />
              <span>{course.enrolledCount || 0} Enrolled Students</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-blue-600" />
              <span>{course.duration || 'Self-Paced'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe size={16} className="text-blue-600" />
              <span>{course.language || 'English'}</span>
            </div>
          </div>
        </div>

        {/* Enrollment Card */}
        <div className="bg-gray-50 border border-gray-200/80 p-6 rounded-2xl space-y-5 flex flex-col justify-between">
          <div className="relative h-44 rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center">
            {course.thumbnail ? (
              <img
                src={`http://localhost:5000/${course.thumbnail}`}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <BookOpen size={36} className="text-gray-400" />
            )}
          </div>

          {success && (
            <div className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center font-semibold">
              {success}
            </div>
          )}

          <div className="space-y-3">
            {user?.role === 'Student' ? (
              <button
                onClick={handleEnrollToggle}
                disabled={enrollLoading}
                className={`w-full py-3.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm ${
                  course.isEnrolled
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {enrollLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : course.isEnrolled ? (
                  <>Drop / Unenroll Course</>
                ) : (
                  <>Enroll Now</>
                )}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="text-center p-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-500 font-medium">
                  Logged in as <span className="font-bold text-gray-900">{user?.role || 'Guest'}</span>
                </div>
                {['Admin', 'Faculty'].includes(user?.role) && (
                  <div className="space-y-2">
                    <Link
                      to={`/courses/${course._id}/edit`}
                      className="w-full py-3 px-4 text-xs font-bold rounded-xl bg-slate-900 hover:bg-black text-white flex items-center justify-center gap-2 transition-all shadow-xs"
                    >
                      <Edit2 size={15} />
                      Edit Course Details
                    </Link>
                    <Link
                      to={`/courses/${course._id}/manage-content`}
                      className="w-full py-3 px-4 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 transition-all shadow-xs"
                    >
                      <Settings size={15} />
                      Manage Course Content
                    </Link>
                  </div>
                )}

              </div>
            )}

            {course.isEnrolled && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-center gap-1.5 text-emerald-700 text-xs font-semibold">
                  <CheckCircle size={14} /> You are actively enrolled
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to={`/courses/${course._id}/student-assignments`}
                    className="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold text-center border border-blue-150 transition-all"
                  >
                    Assignments
                  </Link>
                  <Link
                    to={`/courses/${course._id}/student-quizzes`}
                    className="py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold text-center border border-indigo-150 transition-all"
                  >
                    Quizzes
                  </Link>
                </div>
              </div>
            )}
            {['Admin', 'Faculty'].includes(user?.role) && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to={`/courses/${course._id}/assignments`}
                  className="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold text-center border border-blue-150 transition-all"
                >
                  Manage Assignments
                </Link>
                <Link
                  to={`/courses/${course._id}/quizzes`}
                  className="py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold text-center border border-indigo-150 transition-all"
                >
                  Manage Quizzes
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <div className="bg-white border border-gray-200/80 p-8 rounded-[20px] space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BookOpen size={20} className="text-blue-600" />
              Course Overview
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
              {course.fullDescription}
            </p>
          </div>

          {/* Outcomes */}
          {course.learningOutcomes?.length > 0 && (
            <div className="bg-white border border-gray-200/80 p-8 rounded-[20px] space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Award size={20} className="text-blue-600" />
                What You'll Learn
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.learningOutcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs font-medium text-gray-700">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Curriculum Accordion Section */}
          <div className="bg-white border border-gray-200/80 p-8 rounded-[20px] space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Layers size={20} className="text-blue-600" />
                Course Curriculum ({sections.length} Section{sections.length !== 1 ? 's' : ''})
              </h3>

              {['Admin', 'Faculty'].includes(user?.role) && (
                <Link
                  to={`/courses/${course._id}/manage-content`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-150 px-3 py-1.5 rounded-xl transition-all"
                >
                  <Plus size={14} /> Add Content
                </Link>
              )}
            </div>

            {sections.length > 0 ? (
              <div className="space-y-4">
                {sections.map((sec) => (
                  <SectionCard
                    key={sec._id}
                    section={sec}
                    courseId={course._id}
                    canManage={false}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-200 p-8 rounded-2xl text-center space-y-2">
                <p className="text-xs text-gray-500">No course content sections published yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Instructor Card */}
          <div className="bg-white border border-gray-200/80 p-6 rounded-[20px] space-y-4 shadow-sm">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Course Instructor
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100">
                {course.instructor?.name?.charAt(0) || 'F'}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">{course.instructor?.name || 'Faculty Member'}</h4>
                <p className="text-xs text-gray-500">{course.instructor?.role || 'Instructor'}</p>
                <p className="text-[11px] text-gray-400">{course.instructor?.email}</p>
              </div>
            </div>
          </div>

          {/* Prerequisites */}
          {course.prerequisites?.length > 0 && (
            <div className="bg-white border border-gray-200/80 p-6 rounded-[20px] space-y-3 shadow-sm">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Prerequisites
              </h4>
              <ul className="space-y-2">
                {course.prerequisites.map((req, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs font-medium text-gray-700">
                    <ShieldCheck size={14} className="text-blue-600 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {course.tags?.length > 0 && (
            <div className="bg-white border border-gray-200/80 p-6 rounded-[20px] space-y-3 shadow-sm">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Topics & Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {course.tags.map((tag, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-600 font-semibold">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseDetail;

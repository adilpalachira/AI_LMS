import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Breadcrumb from '../../components/content/Breadcrumb';
import FilePreview from '../../components/content/FilePreview';
import DocumentCard from '../../components/content/DocumentCard';
import { getCourseById } from '../../services/courseService';
import { getSectionsByCourse, getLessonById } from '../../services/contentService';
import {
  BookOpen, ChevronLeft, ChevronRight, CheckCircle, FileText,
  PlayCircle, Sparkles, Layers, Download, ArrowLeft, Eye
} from 'lucide-react';

const LessonViewer = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLessonAndCurriculum = async () => {
    setLoading(true);
    try {
      const courseRes = await getCourseById(courseId);
      if (courseRes.success) setCourse(courseRes.data);

      const sectionsRes = await getSectionsByCourse(courseId);
      if (sectionsRes.success) setSections(sectionsRes.data);

      const lessonRes = await getLessonById(lessonId);
      if (lessonRes.success) setCurrentLesson(lessonRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load lesson content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessonAndCurriculum();
  }, [courseId, lessonId]);

  // Flatten all lessons across sections to enable Next/Prev navigation
  const allLessons = sections.flatMap(s => s.lessons || []);
  const currentIndex = allLessons.findIndex(l => l._id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !currentLesson) {
    return (
      <DashboardLayout>
        <div className="bg-white border border-gray-200 rounded-[20px] p-12 text-center space-y-4 max-w-xl mx-auto">
          <h2 className="text-lg font-bold text-gray-900">{error || 'Lesson Not Found'}</h2>
          <Link
            to={`/courses/${courseId}`}
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline"
          >
            <ArrowLeft size={16} /> Return to Course Overview
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Courses', to: '/courses' },
            { label: course?.title || 'Course Details', to: `/courses/${courseId}` },
            { label: currentLesson.title }
          ]}
        />

        {/* Content Viewer Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Lesson Player & Material Viewer (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header info card */}
            <div className="bg-white border border-gray-200/80 p-6 rounded-[20px] shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-150 font-mono">
                    {currentLesson.contentType}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    Duration: {currentLesson.duration || '10 mins'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {prevLesson && (
                    <Link
                      to={`/courses/${courseId}/lessons/${prevLesson._id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-xl transition-all"
                    >
                      <ChevronLeft size={14} /> Previous
                    </Link>
                  )}
                  {nextLesson && (
                    <Link
                      to={`/courses/${courseId}/lessons/${nextLesson._id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-xl transition-all shadow-2xs"
                    >
                      Next Lesson <ChevronRight size={14} />
                    </Link>
                  )}
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                {currentLesson.title}
              </h1>

              {currentLesson.description && (
                <p className="text-xs text-gray-500 leading-relaxed">
                  {currentLesson.description}
                </p>
              )}
            </div>

            {/* Main Interactive Content Display (Video / PDF / Document / Note) */}
            <div className="space-y-4">
              <FilePreview lesson={currentLesson} materials={currentLesson.materials || []} />
            </div>

            {/* Additional Materials Section */}
            {currentLesson.materials?.length > 0 && (
              <div className="bg-white border border-gray-200/80 p-6 rounded-[20px] shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Download size={16} className="text-blue-600" />
                  Attached Learning Materials ({currentLesson.materials.length})
                </h3>
                <div className="space-y-2.5">
                  {currentLesson.materials.map(mat => (
                    <DocumentCard key={mat._id} file={mat} />
                  ))}
                </div>
              </div>
            )}

            {/* Future AI Prep Card Banner */}
            <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 border border-blue-100 p-6 rounded-[20px] flex items-center gap-4">
              <div className="p-3 bg-white text-blue-600 rounded-2xl border border-blue-100 shadow-2xs shrink-0">
                <Sparkles size={24} className="text-blue-600 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-900">AI Tutor & PDF Vector Search Ready</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  This lesson's extracted materials are indexed for RAG vector embeddings. AI Tutoring, instant document Q&A, and auto-generated quizzes will unlock under Module 6.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Course Curriculum Navigation Drawer (1 col) */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200/80 p-5 rounded-[20px] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-150 pb-3">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={16} className="text-blue-600" /> Course Syllabus
                </h3>
                <span className="text-[10px] font-mono text-gray-400 font-semibold">
                  {allLessons.length} Lessons
                </span>
              </div>

              <div className="space-y-4 max-h-[650px] overflow-y-auto pr-1">
                {sections.map((sec) => (
                  <div key={sec._id} className="space-y-2">
                    <div className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                      <span className="truncate">{sec.title}</span>
                      <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                        {sec.lessons?.length || 0}
                      </span>
                    </div>

                    <div className="space-y-1 pl-1">
                      {sec.lessons?.map((les) => {
                        const isActive = les._id === lessonId;
                        return (
                          <Link
                            key={les._id}
                            to={`/courses/${courseId}/lessons/${les._id}`}
                            className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                              isActive
                                ? 'bg-blue-600 text-white font-bold shadow-2xs'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium'
                            }`}
                          >
                            <span className="truncate max-w-[160px]">{les.title}</span>
                            <span className={`text-[10px] font-mono shrink-0 ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
                              {les.duration || '10m'}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LessonViewer;

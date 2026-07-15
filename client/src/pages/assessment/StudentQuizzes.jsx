import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Breadcrumb from '../../components/content/Breadcrumb';
import QuizCard from '../../components/assessment/QuizCard';
import EmptyState from '../../components/content/EmptyState';
import { getCourseById } from '../../services/courseService';
import { getQuizzesByCourse } from '../../services/assessmentService';
import { HelpCircle, AlertCircle } from 'lucide-react';

const StudentQuizzes = () => {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStudentQuizzes = async () => {
    setLoading(true);
    try {
      const courseRes = await getCourseById(courseId);
      if (courseRes.success) setCourse(courseRes.data);

      const quizRes = await getQuizzesByCourse(courseId);
      if (quizRes.success) setQuizzes(quizRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentQuizzes();
  }, [courseId]);

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
        <Breadcrumb
          items={[
            { label: 'My Courses', to: '/my-courses' },
            { label: course?.title || 'Course Details', to: `/courses/${courseId}` },
            { label: 'Course Quizzes' }
          ]}
        />

        <div className="bg-white border border-gray-200/80 p-6 sm:p-8 rounded-[20px] shadow-xs space-y-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-150 font-mono">
            {course?.code}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Quizzes & Assessments
          </h1>
          <p className="text-xs text-gray-500 max-w-xl">
            Take timed quizzes, test your conceptual knowledge, and view immediate auto-graded attempt results.
          </p>
        </div>

        {error && (
          <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <QuizCard key={quiz._id} quiz={quiz} userRole="Student" />
            ))
          ) : (
            <EmptyState
              icon={HelpCircle}
              title="No Quizzes Available"
              description="There are currently no published quizzes available for this course."
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentQuizzes;

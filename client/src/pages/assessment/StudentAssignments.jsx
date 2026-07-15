import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Breadcrumb from '../../components/content/Breadcrumb';
import AssignmentCard from '../../components/assessment/AssignmentCard';
import FileUpload from '../../components/content/FileUpload';
import EmptyState from '../../components/content/EmptyState';
import { getCourseById } from '../../services/courseService';
import { getAssignmentsByCourse, submitAssignment } from '../../services/assessmentService';
import { FileText, CheckCircle2, AlertCircle, Upload, ArrowLeft } from 'lucide-react';

const StudentAssignments = () => {
  const { courseId, assignmentId } = useParams();

  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [fileToSubmit, setFileToSubmit] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAssignmentsData = async () => {
    setLoading(true);
    try {
      const courseRes = await getCourseById(courseId);
      if (courseRes.success) setCourse(courseRes.data);

      const assignRes = await getAssignmentsByCourse(courseId);
      if (assignRes.success) {
        setAssignments(assignRes.data);
        if (assignmentId) {
          const target = assignRes.data.find(a => a._id === assignmentId);
          if (target) setSelectedAssignment(target);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentsData();
  }, [courseId, assignmentId]);

  const handleSubmitFile = async (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    if (!fileToSubmit) {
      setError('Please select a file to upload');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    try {
      await submitAssignment(selectedAssignment._id, fileToSubmit, (percent) => {
        setUploadProgress(percent);
      });
      setSuccess('Assignment submitted successfully!');
      setFileToSubmit(null);
      setUploadProgress(null);
      fetchAssignmentsData();
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
      setUploadProgress(null);
    } finally {
      setSubmitting(false);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: 'My Courses', to: '/my-courses' },
            { label: course?.title || 'Course Details', to: `/courses/${courseId}` },
            { label: 'Course Assignments' }
          ]}
        />

        <div className="bg-white border border-gray-200/80 p-6 sm:p-8 rounded-[20px] shadow-xs space-y-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-150 font-mono">
            {course?.code}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Course Assignments
          </h1>
          <p className="text-xs text-gray-500 max-w-xl">
            Upload your completed assignment files before deadlines and check instructor grades and feedback.
          </p>
        </div>

        {success && (
          <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess('')} className="text-emerald-600 hover:text-emerald-900">&times;</button>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-rose-600 hover:text-rose-900">&times;</button>
          </div>
        )}

        {/* Selected Upload Area if triggered */}
        {selectedAssignment && (
          <div className="bg-white border border-blue-200 rounded-[20px] p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Upload size={18} className="text-blue-600" />
                Submit Assignment: {selectedAssignment.title}
              </h3>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="text-xs text-gray-500 hover:text-gray-900 font-semibold"
              >
                Cancel
              </button>
            </div>

            {selectedAssignment.instructions && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs text-gray-600">
                <span className="font-bold text-gray-900 block mb-1">Instructions:</span>
                {selectedAssignment.instructions}
              </div>
            )}

            <form onSubmit={handleSubmitFile} className="space-y-4">
              <FileUpload
                onFileSelect={(file) => setFileToSubmit(file)}
                uploadProgress={uploadProgress}
              />

              <div className="flex justify-end gap-3">
                <button
                  type="submit"
                  disabled={submitting || !fileToSubmit}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2"
                >
                  {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  Upload & Submit File
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Assignments List */}
        <div className="space-y-4">
          {assignments.length > 0 ? (
            assignments.map((assign) => (
              <AssignmentCard
                key={assign._id}
                assignment={assign}
                userRole="Student"
              />
            ))
          ) : (
            <EmptyState
              icon={FileText}
              title="No Assignments Assigned"
              description="There are currently no active assignments published for this course."
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentAssignments;

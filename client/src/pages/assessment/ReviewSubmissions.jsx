import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Breadcrumb from '../../components/content/Breadcrumb';
import SubmissionCard from '../../components/assessment/SubmissionCard';
import EmptyState from '../../components/content/EmptyState';
import { getAssignmentById } from '../../services/assessmentService';
import { getSubmissionsByAssignment, gradeSubmission } from '../../services/assessmentService';
import { FileText, Users, CheckCircle2, AlertCircle, Award } from 'lucide-react';

const ReviewSubmissions = () => {
  const { id: assignmentId } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSubmissionsData = async () => {
    setLoading(true);
    try {
      const assignRes = await getAssignmentById(assignmentId);
      if (assignRes.success) setAssignment(assignRes.data);

      const subRes = await getSubmissionsByAssignment(assignmentId);
      if (subRes.success) setSubmissions(subRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissionsData();
  }, [assignmentId]);

  const handleGradeSubmission = async (submissionId, gradeData) => {
    try {
      await gradeSubmission(submissionId, gradeData);
      setSuccess('Grade saved successfully!');
      fetchSubmissionsData();
    } catch (err) {
      setError(err.response?.data?.message || 'Grading failed');
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
            { label: 'Manage Courses', to: '/manage-courses' },
            { label: 'Manage Assignments', to: `/courses/${assignment?.courseId?._id || assignment?.courseId}/assignments` },
            { label: 'Review Student Submissions' }
          ]}
        />

        <div className="bg-white border border-gray-200/80 p-6 sm:p-8 rounded-[20px] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-150 font-mono">
              {assignment?.courseId?.code || 'COURSE'}
            </span>
            <span className="text-xs text-gray-500 font-medium">Faculty Review Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Submissions: {assignment?.title}
          </h1>

          <div className="flex items-center gap-6 text-xs text-gray-600 font-semibold pt-1">
            <div className="flex items-center gap-1.5">
              <Award size={16} className="text-blue-600" />
              <span>{assignment?.maxMarks} Max Marks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={16} className="text-indigo-600" />
              <span>{submissions.length} Total Submissions</span>
            </div>
          </div>
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

        {/* Submissions List */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FileText size={18} className="text-blue-600" />
            Student Submissions ({submissions.length})
          </h3>

          {submissions.length > 0 ? (
            submissions.map((sub) => (
              <SubmissionCard
                key={sub._id}
                submission={sub}
                maxMarks={assignment?.maxMarks || 100}
                onGrade={handleGradeSubmission}
              />
            ))
          ) : (
            <EmptyState
              icon={Users}
              title="No Student Submissions Yet"
              description="Students enrolled in this course have not submitted files for this assignment yet."
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReviewSubmissions;

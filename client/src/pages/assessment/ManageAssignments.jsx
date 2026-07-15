import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Breadcrumb from '../../components/content/Breadcrumb';
import AssignmentCard from '../../components/assessment/AssignmentCard';
import EmptyState from '../../components/content/EmptyState';
import ConfirmationModal from '../../components/content/ConfirmationModal';
import { getCourseById } from '../../services/courseService';
import {
  getAssignmentsByCourse, createAssignment, updateAssignment, deleteAssignment
} from '../../services/assessmentService';
import {
  Plus, FileText, CheckCircle2, AlertCircle, Calendar, Award, X
} from 'lucide-react';

const ManageAssignments = () => {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    instructions: '',
    maxMarks: 100,
    deadline: '',
    allowedFileTypes: 'pdf, doc, docx, zip',
    lateSubmissionPolicy: 'Allowed',
    status: 'Published'
  });

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, assignment: null });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const courseRes = await getCourseById(courseId);
      if (courseRes.success) setCourse(courseRes.data);

      const assignRes = await getAssignmentsByCourse(courseId);
      if (assignRes.success) setAssignments(assignRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [courseId]);

  const handleOpenCreate = () => {
    setEditingAssignment(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    const formattedDeadline = tomorrow.toISOString().slice(0, 16);

    setForm({
      title: '',
      description: '',
      instructions: '',
      maxMarks: 100,
      deadline: formattedDeadline,
      allowedFileTypes: 'pdf, doc, docx, zip',
      lateSubmissionPolicy: 'Allowed',
      status: 'Published'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (assignment) => {
    setEditingAssignment(assignment);
    const deadlineVal = assignment.deadline ? new Date(assignment.deadline).toISOString().slice(0, 16) : '';
    setForm({
      title: assignment.title,
      description: assignment.description || '',
      instructions: assignment.instructions || '',
      maxMarks: assignment.maxMarks || 100,
      deadline: deadlineVal,
      allowedFileTypes: assignment.allowedFileTypes?.join(', ') || 'pdf, doc, docx, zip',
      lateSubmissionPolicy: assignment.lateSubmissionPolicy || 'Allowed',
      status: assignment.status || 'Published'
    });
    setModalOpen(true);
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const fileTypesArray = form.allowedFileTypes
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);

      const payload = {
        ...form,
        courseId,
        maxMarks: parseFloat(form.maxMarks) || 100,
        allowedFileTypes: fileTypesArray
      };

      if (editingAssignment) {
        await updateAssignment(editingAssignment._id, payload);
        setSuccess('Assignment updated successfully!');
      } else {
        await createAssignment(payload);
        setSuccess('Assignment created successfully!');
      }

      setModalOpen(false);
      fetchAssignments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save assignment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal.assignment) return;
    setActionLoading(true);
    try {
      await deleteAssignment(confirmModal.assignment._id);
      setSuccess('Assignment deleted successfully!');
      setConfirmModal({ isOpen: false, assignment: null });
      fetchAssignments();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete operation failed');
    } finally {
      setActionLoading(false);
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
            { label: course?.title || 'Course Overview', to: `/courses/${courseId}` },
            { label: 'Manage Course Assignments' }
          ]}
        />

        <div className="bg-white border border-gray-200/80 p-6 sm:p-8 rounded-[20px] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Assignments ({assignments.length})
            </h1>
            <p className="text-xs text-gray-500 max-w-xl">
              Create homework assignments, set submission deadlines, specify max marks, and review student file submissions.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <Plus size={16} /> Create Assignment
          </button>
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

        {/* Assignments Grid */}
        <div className="space-y-4">
          {assignments.length > 0 ? (
            assignments.map((assign) => (
              <AssignmentCard
                key={assign._id}
                assignment={assign}
                userRole="Faculty"
                canManage={true}
                onEdit={handleOpenEdit}
                onDelete={(a) => setConfirmModal({ isOpen: true, assignment: a })}
              />
            ))
          ) : (
            <EmptyState
              icon={FileText}
              title="No Assignments Created Yet"
              description="Click 'Create Assignment' to publish your first coursework assignment for this course."
              actionButton={
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                >
                  <Plus size={16} /> Create Assignment Now
                </button>
              }
            />
          )}
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-[20px] shadow-2xl max-w-xl w-full p-6 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-gray-150 pb-4">
              <h3 className="text-base font-bold text-gray-900">
                {editingAssignment ? 'Edit Assignment' : 'Create Assignment'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Assignment Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Assignment 1: React State Management"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="premium-input text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Maximum Marks <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.maxMarks}
                    onChange={(e) => setForm({ ...form, maxMarks: e.target.value })}
                    className="premium-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Submission Deadline <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="premium-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of assignment goals..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="premium-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Detailed Instructions</label>
                <textarea
                  rows={4}
                  placeholder="Detailed guidelines, questions, submission requirements..."
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  className="premium-input text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Allowed File Types</label>
                  <input
                    type="text"
                    placeholder="pdf, doc, docx, zip, png"
                    value={form.allowedFileTypes}
                    onChange={(e) => setForm({ ...form, allowedFileTypes: e.target.value })}
                    className="premium-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Late Submission Policy</label>
                  <select
                    value={form.lateSubmissionPolicy}
                    onChange={(e) => setForm({ ...form, lateSubmissionPolicy: e.target.value })}
                    className="premium-input text-xs"
                  >
                    <option value="Allowed">Allowed (Flagged as Late)</option>
                    <option value="Disallowed">Disallowed (Strict Deadline)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2"
                >
                  {actionLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, assignment: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Assignment?"
        message={`Deleting "${confirmModal.assignment?.title}" will permanently remove all student submissions and grades.`}
        loading={actionLoading}
      />
    </DashboardLayout>
  );
};

export default ManageAssignments;

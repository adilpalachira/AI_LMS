import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Breadcrumb from '../../components/content/Breadcrumb';
import SectionCard from '../../components/content/SectionCard';
import FileUpload from '../../components/content/FileUpload';
import DocumentCard from '../../components/content/DocumentCard';
import ConfirmationModal from '../../components/content/ConfirmationModal';
import EmptyState from '../../components/content/EmptyState';
import { getCourseById } from '../../services/courseService';
import {
  getSectionsByCourse, createSection, updateSection, deleteSection,
  createLesson, updateLesson, deleteLesson,
  uploadMaterial, deleteMaterial
} from '../../services/contentService';
import {
  Plus, ArrowLeft, BookOpen, Layers, FileText, UploadCloud,
  CheckCircle2, AlertCircle, Sparkles, X, Edit3, Trash2
} from 'lucide-react';

const ManageCourseContent = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionForm, setSectionForm] = useState({ title: '', description: '', order: 0 });

  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    duration: '10 mins',
    contentType: 'PDF',
    isPreview: false,
    textNote: '',
    externalUrl: ''
  });
  const [selectedUploadFile, setSelectedUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [lessonMaterials, setLessonMaterials] = useState([]);

  // Confirm delete modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'section' or 'lesson' or 'material'
    item: null,
    title: '',
    message: ''
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCourseAndContent = async () => {
    setLoading(true);
    try {
      const courseRes = await getCourseById(courseId);
      if (courseRes.success) {
        setCourse(courseRes.data);
      }

      const sectionsRes = await getSectionsByCourse(courseId);
      if (sectionsRes.success) {
        setSections(sectionsRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseAndContent();
  }, [courseId]);

  // Section Modal Handlers
  const handleOpenCreateSection = () => {
    setEditingSection(null);
    setSectionForm({ title: '', description: '', order: sections.length + 1 });
    setSectionModalOpen(true);
  };

  const handleOpenEditSection = (section) => {
    setEditingSection(section);
    setSectionForm({
      title: section.title,
      description: section.description || '',
      order: section.order || 1
    });
    setSectionModalOpen(true);
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingSection) {
        await updateSection(editingSection._id, sectionForm);
        setSuccess('Section updated successfully!');
      } else {
        await createSection({ ...sectionForm, courseId });
        setSuccess('Section created successfully!');
      }
      setSectionModalOpen(false);
      fetchCourseAndContent();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save section');
    } finally {
      setActionLoading(false);
    }
  };

  // Lesson Modal Handlers
  const handleOpenCreateLesson = (sectionId) => {
    setSelectedSectionId(sectionId);
    setEditingLesson(null);
    setLessonForm({
      title: '',
      description: '',
      duration: '15 mins',
      contentType: 'PDF',
      isPreview: false,
      textNote: '',
      externalUrl: ''
    });
    setSelectedUploadFile(null);
    setLessonMaterials([]);
    setLessonModalOpen(true);
  };

  const handleOpenEditLesson = (lesson) => {
    setSelectedSectionId(lesson.sectionId);
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      description: lesson.description || '',
      duration: lesson.duration || '15 mins',
      contentType: lesson.contentType,
      isPreview: lesson.isPreview || false,
      textNote: lesson.textNote || '',
      externalUrl: lesson.externalUrl || ''
    });
    setSelectedUploadFile(null);
    setLessonMaterials(lesson.materials || []);
    setLessonModalOpen(true);
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      let savedLesson;
      if (editingLesson) {
        const res = await updateLesson(editingLesson._id, lessonForm);
        savedLesson = res.data;
        setSuccess('Lesson updated successfully!');
      } else {
        const res = await createLesson({
          ...lessonForm,
          courseId,
          sectionId: selectedSectionId
        });
        savedLesson = res.data;
        setSuccess('Lesson created successfully!');
      }

      // If file selected, upload material
      if (selectedUploadFile && savedLesson?._id) {
        setUploadProgress(0);
        await uploadMaterial(savedLesson._id, selectedUploadFile, (percent) => {
          setUploadProgress(percent);
        });
        setUploadProgress(null);
      }

      setLessonModalOpen(false);
      fetchCourseAndContent();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save lesson');
      setUploadProgress(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    try {
      await deleteMaterial(materialId);
      setLessonMaterials(prev => prev.filter(m => m._id !== materialId));
      fetchCourseAndContent();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete file');
    }
  };

  // Delete Confirmations
  const triggerDeleteSection = (section) => {
    setConfirmModal({
      isOpen: true,
      type: 'section',
      item: section,
      title: `Delete Section "${section.title}"?`,
      message: 'Deleting this section will also permanently remove all lessons and uploaded files inside it.'
    });
  };

  const triggerDeleteLesson = (lesson) => {
    setConfirmModal({
      isOpen: true,
      type: 'lesson',
      item: lesson,
      title: `Delete Lesson "${lesson.title}"?`,
      message: 'Deleting this lesson will permanently remove all attached learning material files.'
    });
  };

  const handleConfirmDelete = async () => {
    setActionLoading(true);
    try {
      if (confirmModal.type === 'section') {
        await deleteSection(confirmModal.item._id);
        setSuccess('Section deleted successfully!');
      } else if (confirmModal.type === 'lesson') {
        await deleteLesson(confirmModal.item._id);
        setSuccess('Lesson deleted successfully!');
      }
      setConfirmModal({ isOpen: false, type: null, item: null, title: '', message: '' });
      fetchCourseAndContent();
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
        {/* Navigation Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Manage Courses', to: '/manage-courses' },
            { label: course?.title || 'Course Details', to: `/courses/${courseId}` },
            { label: 'Course Curriculum Manager' }
          ]}
        />

        {/* Hero Header */}
        <div className="bg-white border border-gray-200/80 p-6 sm:p-8 rounded-[20px] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-150">
                {course?.code}
              </span>
              <span className="text-xs text-gray-500 font-medium">Content Builder</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {course?.title}
            </h1>
            <p className="text-xs text-gray-500 max-w-xl">
              Organize your curriculum into Units/Sections, add interactive lessons, and upload learning materials for students.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to={`/courses/${courseId}`}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all"
            >
              View Student View
            </Link>

            <button
              type="button"
              onClick={handleOpenCreateSection}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
            >
              <Plus size={16} />
              <span>Add New Section</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
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

        {/* Curriculum Sections List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Layers size={18} className="text-blue-600" />
              Course Curriculum ({sections.length} Section{sections.length !== 1 ? 's' : ''})
            </h3>
          </div>

          {sections.length > 0 ? (
            sections.map((section) => (
              <SectionCard
                key={section._id}
                section={section}
                courseId={courseId}
                canManage={true}
                onEditSection={handleOpenEditSection}
                onDeleteSection={triggerDeleteSection}
                onAddLesson={handleOpenCreateLesson}
                onEditLesson={handleOpenEditLesson}
                onDeleteLesson={triggerDeleteLesson}
              />
            ))
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No Curriculum Sections Yet"
              description="Start building your course by adding your first unit or module section (e.g., Unit 1: Introduction, Lab 1, Assignments)."
              actionButton={
                <button
                  type="button"
                  onClick={handleOpenCreateSection}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Plus size={16} /> Create Section
                </button>
              }
            />
          )}
        </div>
      </div>

      {/* SECTION MODAL */}
      {sectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-[20px] shadow-2xl max-w-lg w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-150 pb-4">
              <h3 className="text-base font-bold text-gray-900">
                {editingSection ? 'Edit Section' : 'Create New Section'}
              </h3>
              <button
                type="button"
                onClick={() => setSectionModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Section Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 1: Foundations & Architecture"
                  value={sectionForm.title}
                  onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                  className="premium-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Section Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief overview of topics covered in this unit..."
                  value={sectionForm.description}
                  onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                  className="premium-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Display Order Position
                </label>
                <input
                  type="number"
                  min={1}
                  value={sectionForm.order}
                  onChange={(e) => setSectionForm({ ...sectionForm, order: parseInt(e.target.value) || 1 })}
                  className="premium-input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setSectionModalOpen(false)}
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
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LESSON MODAL */}
      {lessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-[20px] shadow-2xl max-w-2xl w-full p-6 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-gray-150 pb-4">
              <h3 className="text-base font-bold text-gray-900">
                {editingLesson ? 'Edit Lesson & Content' : 'Add New Lesson'}
              </h3>
              <button
                type="button"
                onClick={() => setLessonModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Lesson Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lesson 1: Introduction to Node.js"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    className="premium-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Content Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={lessonForm.contentType}
                    onChange={(e) => setLessonForm({ ...lessonForm, contentType: e.target.value })}
                    className="premium-input text-xs"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="PowerPoint">PowerPoint (.pptx)</option>
                    <option value="Word Document">Word Document (.docx)</option>
                    <option value="Video">Video File (MP4 / WebM)</option>
                    <option value="YouTube">YouTube Video URL</option>
                    <option value="External URL">External Link</option>
                    <option value="Text Note">Text Note / Article</option>
                    <option value="Image">Image Diagram</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Duration (e.g. 15 mins)
                  </label>
                  <input
                    type="text"
                    placeholder="15 mins"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                    className="premium-input text-xs"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lessonForm.isPreview}
                      onChange={(e) => setLessonForm({ ...lessonForm, isPreview: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded-md border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-gray-700">Set as Free Preview Lesson</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Description / Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of lesson objectives..."
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                  className="premium-input text-xs"
                />
              </div>

              {/* Conditional Inputs based on Content Type */}
              {(lessonForm.contentType === 'YouTube' || lessonForm.contentType === 'External URL') && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lessonForm.contentType === 'YouTube' ? 'YouTube Video URL' : 'External Website Link'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={lessonForm.externalUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, externalUrl: e.target.value })}
                    className="premium-input text-xs"
                  />
                </div>
              )}

              {lessonForm.contentType === 'Text Note' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Text Note Content <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Write detailed notes, lecture transcripts, or Markdown content here..."
                    value={lessonForm.textNote}
                    onChange={(e) => setLessonForm({ ...lessonForm, textNote: e.target.value })}
                    className="premium-input text-xs font-mono"
                  />
                </div>
              )}

              {/* Upload Material Section */}
              {['PDF', 'PowerPoint', 'Word Document', 'Video', 'Image'].includes(lessonForm.contentType) && (
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-gray-700">
                    Upload Learning Material File
                  </label>
                  
                  {/* Upload Dropzone */}
                  <FileUpload
                    onFileSelect={(file) => setSelectedUploadFile(file)}
                    uploadProgress={uploadProgress}
                  />

                  {/* Existing Attached Materials (if editing) */}
                  {lessonMaterials.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Existing File Attachments
                      </p>
                      {lessonMaterials.map((file) => (
                        <DocumentCard
                          key={file._id}
                          file={file}
                          canManage={true}
                          onRemove={handleDeleteMaterial}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setLessonModalOpen(false)}
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
                  Save Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title={confirmModal.title}
        message={confirmModal.message}
        loading={actionLoading}
      />
    </DashboardLayout>
  );
};

export default ManageCourseContent;

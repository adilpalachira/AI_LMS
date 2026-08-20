import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getCourseById, createCourse, updateCourse, getCategories } from '../../services/courseService';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { ArrowLeft, Upload, AlertCircle, Save } from 'lucide-react';

const CourseForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [facultyList, setFacultyList] = useState([]);

  // Form State
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [duration, setDuration] = useState('8 Weeks');
  const [language, setLanguage] = useState('English');
  const [instructor, setInstructor] = useState('');
  const [status, setStatus] = useState('Draft');
  const [tags, setTags] = useState('');
  const [learningOutcomes, setLearningOutcomes] = useState('');
  const [prerequisites, setPrerequisites] = useState('');

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const catRes = await getCategories({ status: 'Active' });
        if (catRes.success) {
          setCategories(catRes.data);
          if (!category && catRes.data.length > 0) {
            setCategory(catRes.data[0]._id);
          }
        }

        if (user?.role === 'Admin') {
          const userRes = await api.get('/users?role=Faculty&limit=100');
          if (userRes.data.success) {
            setFacultyList(userRes.data.data.users);
          }
        }

        if (isEditMode) {
          const courseRes = await getCourseById(id);
          if (courseRes.success) {
            const c = courseRes.data;
            setTitle(c.title || '');
            setCode(c.code || '');
            setShortDescription(c.shortDescription || '');
            setFullDescription(c.fullDescription || '');
            setCategory(c.category?._id || c.category || '');
            setLevel(c.level || 'Beginner');
            setDuration(c.duration || '8 Weeks');
            setLanguage(c.language || 'English');
            setInstructor(c.instructor?._id || c.instructor || '');
            setStatus(c.status || 'Draft');
            setTags((c.tags || []).join(', '));
            setLearningOutcomes((c.learningOutcomes || []).join('\n'));
            setPrerequisites((c.prerequisites || []).join('\n'));
            if (c.thumbnail) {
              setThumbnailPreview(`http://localhost:5000/${c.thumbnail}`);
            }
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load form details');
      } finally {
        setPageLoading(false);
      }
    };

    fetchInitialData();
  }, [id, isEditMode, user]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !code || !shortDescription || !fullDescription || !category) {
      setError('Please fill in all required fields marked with *');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('code', code);
    formData.append('shortDescription', shortDescription);
    formData.append('fullDescription', fullDescription);
    formData.append('category', category);
    formData.append('level', level);
    formData.append('duration', duration);
    formData.append('language', language);
    formData.append('status', status);
    formData.append('tags', tags);
    formData.append('learningOutcomes', learningOutcomes.split('\n').filter(Boolean).join(','));
    formData.append('prerequisites', prerequisites.split('\n').filter(Boolean).join(','));

    if (instructor) {
      formData.append('instructor', instructor);
    }

    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    try {
      if (isEditMode) {
        await updateCourse(id, formData);
        navigate(`/courses/${id}`);
      } else {
        await createCourse(formData);
        navigate('/manage-courses');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
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
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/manage-courses')}
          className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Manage Courses
        </button>
      </div>

      <div className="bg-white border border-gray-200/80 p-8 sm:p-10 rounded-[20px] space-y-8 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {isEditMode ? 'Edit Course' : 'Create New Course'}
          </h1>
          <p className="text-xs font-medium text-gray-500">
            Fill in the course details below. Future content and lessons can be added once created.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-semibold">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Advanced Machine Learning Systems"
                className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white text-xs font-medium text-gray-900 rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Course Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CS-AI301"
                className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white text-xs font-bold font-mono text-gray-900 rounded-xl p-3 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white text-xs font-semibold text-gray-900 rounded-xl p-3"
                required
              >
                <option value="" disabled>Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Difficulty Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white text-xs font-semibold text-gray-900 rounded-xl p-3"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white text-xs font-semibold text-gray-900 rounded-xl p-3"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          {user?.role === 'Admin' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Assign Instructor (Faculty)
              </label>
              <select
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white text-xs font-semibold text-gray-900 rounded-xl p-3"
              >
                <option value="">Default (Me as Admin)</option>
                {facultyList.map((fac) => (
                  <option key={fac._id} value={fac._id}>
                    {fac.name} ({fac.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Short Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief summary for course cards (max 300 chars)..."
              className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white text-xs font-medium text-gray-900 rounded-xl p-3 resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Full Course Overview <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              required
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              placeholder="Detailed syllabus, course objectives, and structure..."
              className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white text-xs font-medium text-gray-900 rounded-xl p-3 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Estimated Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 8 Weeks"
                className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white text-xs font-medium text-gray-900 rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Language
              </label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="e.g. English"
                className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white text-xs font-medium text-gray-900 rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="AI, Python, React"
                className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white text-xs font-medium text-gray-900 rounded-xl p-3"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Learning Outcomes (1 per line)
              </label>
              <textarea
                rows={3}
                value={learningOutcomes}
                onChange={(e) => setLearningOutcomes(e.target.value)}
                placeholder="Understand AI core concepts&#10;Train supervised ML models"
                className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white text-xs font-medium text-gray-900 rounded-xl p-3 resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Prerequisites (1 per line)
              </label>
              <textarea
                rows={3}
                value={prerequisites}
                onChange={(e) => setPrerequisites(e.target.value)}
                placeholder="Basic Python knowledge&#10;High School Algebra"
                className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white text-xs font-medium text-gray-900 rounded-xl p-3 resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Course Thumbnail Image
            </label>
            <div className="flex items-center gap-4">
              {thumbnailPreview && (
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail Preview"
                  className="w-24 h-16 object-cover rounded-xl border border-gray-200"
                />
              )}
              <label className="cursor-pointer py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl border border-gray-200 flex items-center gap-2 transition-colors">
                <Upload size={15} />
                {thumbnailFile ? 'Change File' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/manage-courses')}
              className="py-2.5 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-6 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <Save size={15} />
              {loading ? 'Saving...' : isEditMode ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CourseForm;

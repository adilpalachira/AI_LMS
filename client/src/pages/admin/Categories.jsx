import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/courseService';
import { Plus, Edit2, Trash2, Tag, AlertCircle, CheckCircle, Search, X } from 'lucide-react';

const CategoriesManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('BookOpen');
  const [status, setStatus] = useState('Active');
  const [formLoading, setFormLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIcon('BookOpen');
    setStatus('Active');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIcon(cat.icon || 'BookOpen');
    setStatus(cat.status || 'Active');
    setError('');
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id, { name, description, icon, status });
        setSuccess('Category updated successfully');
      } else {
        await createCategory({ name, description, icon, status });
        setSuccess('Category created successfully');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the category "${name}"?`)) return;

    try {
      await deleteCategory(id);
      setSuccess(`Category "${name}" deleted successfully`);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-gray-200/80 p-6 sm:p-8 rounded-[20px] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider">
            <Tag size={16} />
            <span>Course Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Category Management
          </h1>
          <p className="text-gray-500 text-xs font-medium">
            Manage subject categories and taxonomy for all LMS courses
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-slate-900 hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all shadow-sm text-xs shrink-0"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-emerald-700 hover:text-gray-900">
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-700 hover:text-gray-900">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <Search size={16} />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories by name or description..."
          className="w-full bg-white border border-gray-200 focus:border-blue-600 text-xs font-medium text-gray-900 rounded-xl pl-10 pr-4 py-2.5 transition-all shadow-sm"
        />
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white border border-gray-200/80 rounded-[20px] p-12 text-center space-y-3 shadow-sm">
          <Tag size={36} className="mx-auto text-gray-400" />
          <h3 className="text-lg font-bold text-gray-900">No categories found</h3>
          <p className="text-gray-500 text-xs max-w-sm mx-auto">
            {search ? 'No categories matched your search term.' : 'Click "New Category" to create your first category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white border border-gray-200/80 hover:border-gray-300 p-6 rounded-[20px] space-y-4 flex flex-col justify-between transition-all shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    /{cat.slug}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      cat.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {cat.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900">{cat.name}</h3>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(cat)}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors text-xs font-semibold border border-gray-200 flex items-center gap-1.5"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat._id, cat.name)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-colors text-xs font-semibold border border-rose-200 flex items-center gap-1.5"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-gray-200 max-w-md w-full rounded-[20px] p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Artificial Intelligence"
                  className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 text-xs font-medium text-gray-900 rounded-xl p-3"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of topics..."
                  className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 text-xs font-medium text-gray-900 rounded-xl p-3 resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 text-xs font-semibold text-gray-900 rounded-xl p-3"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
                >
                  {formLoading ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CategoriesManager;

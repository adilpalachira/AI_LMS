import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import UserFilters from '../../components/users/UserFilters';
import UserTable from '../../components/users/UserTable';
import DeleteUserModal from '../../components/users/DeleteUserModal';
import api from '../../services/api';
import { Plus, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalUsers: 0 });
  const [loading, setLoading] = useState(false);

  // Filter States
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortParam, setSortParam] = useState('createdAt-desc');
  const [page, setPage] = useState(1);

  // Modal & Async states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  // Fetch users with filters
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [sortBy, sortOrder] = sortParam.split('-');
      const response = await api.get('/users', {
        params: {
          search,
          role,
          status,
          sortBy,
          sortOrder,
          page,
          limit: 8,
        },
      });

      if (response.data.success) {
        setUsers(response.data.data.users);
        setPagination(response.data.data.pagination);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch users list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, role, status, sortParam, page]);

  const handleResetFilters = () => {
    setSearch('');
    setRole('All');
    setStatus('All');
    setSortParam('createdAt-desc');
    setPage(1);
  };

  const handleOpenDeleteModal = (id) => {
    setSelectedUserId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUserId) return;
    setActionLoading(true);

    try {
      const response = await api.delete(`/users/${selectedUserId}`);
      if (response.data.success) {
        showToast('User account successfully deleted.', 'success');
        setDeleteModalOpen(false);
        setSelectedUserId(null);
        fetchUsers();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error deleting user.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (id, password) => {
    try {
      const response = await api.patch(`/users/${id}/reset-password`, { password });
      if (response.data.success) {
        showToast('User password successfully reset.', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reset password.', 'error');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const response = await api.patch(`/users/${id}/status`, { status: nextStatus });
      if (response.data.success) {
        showToast(`User status updated to '${nextStatus}'.`, 'success');
        fetchUsers();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change status.', 'error');
    }
  };

  return (
    <DashboardLayout>
      {/* Toast Alert Banner */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg animate-slideIn ${
          toast.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Heading Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-gray-200/80 p-6 sm:p-8 rounded-[20px] shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            User Directory
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Manage system administrator, faculty staff, and student accounts.
          </p>
        </div>

        <Link
          to="/admin/users/new"
          className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all"
        >
          <Plus size={16} />
          Add User
        </Link>
      </div>

      {/* Filter Component */}
      <UserFilters
        search={search}
        setSearch={setSearch}
        role={role}
        setRole={setRole}
        status={status}
        setStatus={setStatus}
        sortParam={sortParam}
        setSortParam={setSortParam}
        onReset={handleResetFilters}
      />

      {/* Users Table */}
      <UserTable
        users={users}
        loading={loading}
        onDelete={handleOpenDeleteModal}
        onResetPassword={handleResetPassword}
        onToggleStatus={handleToggleStatus}
      />

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-xs text-gray-500 font-medium">
          <p>
            Showing page <span className="font-bold text-gray-900">{pagination.currentPage}</span> of{' '}
            <span className="font-bold text-gray-900">{pagination.totalPages}</span> ({pagination.totalUsers} total users)
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed bg-white shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed bg-white shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      <DeleteUserModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={actionLoading}
      />
    </DashboardLayout>
  );
};

export default Users;

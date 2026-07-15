import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import UserCard from '../../components/users/UserCard';
import api from '../../services/api';
import { ArrowLeft, Edit2, Lock, Power, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Password reset fields
  const [password, setPassword] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Status updates states
  const [statusSuccess, setStatusSuccess] = useState('');
  const [statusError, setStatusError] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchUser = async () => {
    try {
      const response = await api.get(`/users/${id}`);
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (err) {
      setStatusError(err.response?.data?.message || 'Failed to load user details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');

    if (password.length < 8) {
      setPwError('Password must be at least 8 characters long');
      return;
    }

    setPwLoading(true);
    try {
      const response = await api.patch(`/users/${id}/reset-password`, { password });
      if (response.data.success) {
        setPwSuccess(response.data.message || 'Password override successful.');
        setPassword('');
      }
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to reset user password.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!user) return;
    setStatusSuccess('');
    setStatusError('');
    setStatusLoading(true);

    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const response = await api.patch(`/users/${id}/status`, { status: nextStatus });
      if (response.data.success) {
        setUser(response.data.data);
        setStatusSuccess(`User account updated to ${nextStatus}.`);
        fetchUser();
      }
    } catch (err) {
      setStatusError(err.response?.data?.message || 'Failed to update account status.');
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to directory
            </Link>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              User Inspection
            </h1>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleStatusToggle}
                disabled={statusLoading}
                className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
              >
                <Power size={13} className={user.status === 'Active' ? 'text-rose-500' : 'text-emerald-500'} />
                {user.status === 'Active' ? 'Deactivate' : 'Activate'}
              </button>

              <Link
                to={`/admin/users/${user._id}/edit`}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all"
              >
                <Edit2 size={13} />
                Edit Profile
              </Link>
            </div>
          )}
        </div>

        {statusSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-xs font-semibold">
            <CheckCircle size={16} className="shrink-0" />
            <span>{statusSuccess}</span>
          </div>
        )}
        {statusError && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs font-semibold">
            <AlertCircle size={16} className="shrink-0" />
            <span>{statusError}</span>
          </div>
        )}

        {loading ? (
          <div className="py-24 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={24} className="text-blue-600 animate-spin" />
              <p className="text-xs text-gray-400 font-bold tracking-wider uppercase">Loading account file...</p>
            </div>
          </div>
        ) : (
          user && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-5">
                <UserCard user={user} />
              </div>

              <div className="md:col-span-7 space-y-6">
                <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                    <Lock className="text-blue-600" size={18} />
                    <h2 className="text-sm font-bold text-gray-900">Force Password Reset</h2>
                  </div>

                  {pwSuccess && (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-xs font-semibold">
                      <CheckCircle size={16} className="shrink-0" />
                      <span>{pwSuccess}</span>
                    </div>
                  )}
                  {pwError && (
                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs font-semibold">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{pwError}</span>
                    </div>
                  )}

                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                        New Override Password
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 text-xs font-medium text-gray-900 rounded-xl p-3"
                        placeholder="Minimum 8 characters"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={pwLoading}
                      className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      {pwLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        'Reset Password'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserDetails;

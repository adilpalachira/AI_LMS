import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit2, Lock, Trash2, ShieldAlert } from 'lucide-react';

const UserTable = ({ users, onDeleteClick, onResetPwClick, onStatusToggle }) => {
  // Helpers for Badges
  const renderRoleBadge = (role) => {
    switch (role) {
      case 'Admin':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white border border-slate-950">
            Admin
          </span>
        );
      case 'Faculty':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
            Faculty
          </span>
        );
      case 'Student':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-100">
            Student
          </span>
        );
    }
  };

  const renderStatusBadge = (status, userId) => {
    const isActive = status === 'Active';
    return (
      <button
        onClick={() => onStatusToggle(userId, status)}
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer hover:opacity-80 focus:outline-none ${
          isActive
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-red-50 text-red-700 border-red-200'
        }`}
        title="Click to toggle status"
      >
        {status}
      </button>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatLastLogin = (dateStr) => {
    if (!dateStr) return 'Never logged in';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (users.length === 0) {
    return (
      <div className="border border-gray-200/80 rounded-2xl bg-white p-12 text-center flex flex-col items-center justify-center space-y-4">
        <div className="p-3 bg-gray-50 text-gray-400 border border-gray-100 rounded-2xl w-fit">
          <ShieldAlert size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-gray-900">No users found</h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
            There are no registered accounts matching your filters or search query. Try clearing filters or input text.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-white border border-gray-200/80 rounded-[20px] shadow-sm font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <th className="px-6 py-4">Name / Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Login</th>
              <th className="px-6 py-4">Joined Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                {/* Name & Email */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600 text-xs font-semibold overflow-hidden shrink-0">
                      {user.profileImage ? (
                        <img
                          src={`http://localhost:5000/${user.profileImage}`}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-950 truncate leading-none">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Role Badge */}
                <td className="px-6 py-4">{renderRoleBadge(user.role)}</td>

                {/* Status Badge */}
                <td className="px-6 py-4">{renderStatusBadge(user.status, user._id)}</td>

                {/* Last Login */}
                <td className="px-6 py-4 text-gray-500 font-medium whitespace-nowrap">
                  {formatLastLogin(user.lastLogin)}
                </td>

                {/* Joined Date */}
                <td className="px-6 py-4 text-gray-500 font-medium">
                  {formatDate(user.createdAt)}
                </td>

                {/* Actions row */}
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2.5">
                    <Link
                      to={`/admin/users/${user._id}`}
                      className="p-1.5 text-gray-400 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-all"
                      title="View Details"
                    >
                      <Eye size={14} />
                    </Link>
                    <Link
                      to={`/admin/users/${user._id}/edit`}
                      className="p-1.5 text-gray-400 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-all"
                      title="Edit User"
                    >
                      <Edit2 size={14} />
                    </Link>
                    <button
                      onClick={() => onResetPwClick(user._id)}
                      className="p-1.5 text-gray-400 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-all"
                      title="Reset Password"
                    >
                      <Lock size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteClick(user._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete User"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;

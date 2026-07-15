import React from 'react';
import { Mail, Phone, Shield, Power, Calendar, Clock } from 'lucide-react';

const UserCard = ({ user }) => {
  if (!user) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatLastLogin = (dateStr) => {
    if (!dateStr) return 'Never logged in';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-[20px] p-6 space-y-6 shadow-sm font-sans">
      {/* Header Profile Photo Block */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
        <div className="h-16 w-16 rounded-full bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600 text-xl font-bold overflow-hidden shrink-0">
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
        <div>
          <h3 className="text-base font-extrabold text-gray-900 leading-none">
            {user.name}
          </h3>
          <p className="text-[11px] font-semibold text-blue-600 mt-1">
            {user.role}
          </p>
        </div>
      </div>

      {/* Meta Specs List */}
      <div className="space-y-4">
        {/* Email */}
        <div className="flex items-start gap-3">
          <Mail size={16} className="text-gray-400 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
            <p className="text-xs text-gray-950 font-medium mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start gap-3">
          <Phone size={16} className="text-gray-400 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</p>
            <p className="text-xs text-gray-950 font-medium mt-0.5">{user.phone || 'Not provided'}</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-start gap-3">
          <Power size={16} className="text-gray-400 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Account Status</p>
            <span className={`inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${
              user.status === 'Active'
                ? 'bg-green-50 text-green-700 border-green-100'
                : 'bg-red-50 text-red-700 border-red-100'
            }`}>
              {user.status}
            </span>
          </div>
        </div>

        {/* Joined Date */}
        <div className="flex items-start gap-3">
          <Calendar size={16} className="text-gray-400 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date Joined</p>
            <p className="text-xs text-gray-950 font-medium mt-0.5">{formatDate(user.createdAt)}</p>
          </div>
        </div>

        {/* Last Login */}
        <div className="flex items-start gap-3">
          <Clock size={16} className="text-gray-400 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Last System Activity</p>
            <p className="text-xs text-gray-950 font-medium mt-0.5">{formatLastLogin(user.lastLogin)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;

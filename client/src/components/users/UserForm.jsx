import React, { useState, useEffect } from 'react';
import { Mail, User as UserIcon, Phone, Shield, Power } from 'lucide-react';

const UserForm = ({ initialValues, onSubmit, isEdit = false, loading = false }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Student');
  const [status, setStatus] = useState('Active');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name || '');
      setEmail(initialValues.email || '');
      setPhone(initialValues.phone || '');
      setRole(initialValues.role || 'Student');
      setStatus(initialValues.status || 'Active');
    }
  }, [initialValues]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { name, email, phone, role, status };
    if (!isEdit) {
      payload.password = password;
    }
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-sans">
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <UserIcon size={15} />
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="premium-input pl-9 text-xs"
              placeholder="Adil M"
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail size={15} />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="premium-input pl-9 text-xs"
              placeholder="name@university.edu"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Phone size={15} />
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="premium-input pl-9 text-xs"
              placeholder="+1234567890"
            />
          </div>
        </div>

        {/* Password (Only show during creation) */}
        {!isEdit && (
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Default Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="premium-input text-xs"
              placeholder="At least 8 characters"
            />
          </div>
        )}

        {/* Role & Status selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Role selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              User Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Shield size={14} />
              </div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="premium-input pl-9 text-xs bg-white cursor-pointer font-medium text-gray-700"
              >
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Status selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Account Status <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Power size={14} />
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="premium-input pl-9 text-xs bg-white cursor-pointer font-medium text-gray-700"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-sm mt-6"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          isEdit ? 'Save Changes' : 'Create User'
        )}
      </button>
    </form>
  );
};

export default UserForm;

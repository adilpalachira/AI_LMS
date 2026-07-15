import React, { useState, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar, 
  Camera, 
  Lock, 
  AlertCircle, 
  CheckCircle,
  Save
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  
  // Local states for profile details
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePreview, setProfilePreview] = useState(
    user?.profileImage ? `http://localhost:5000/${user.profileImage}` : null
  );
  const [profileFile, setProfileFile] = useState(null);
  
  // States for password updating
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status feedback alerts
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setProfileError('Only images are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setProfileError('Image size must be less than 5MB');
        return;
      }
      setProfileFile(file);
      setProfilePreview(URL.createObjectURL(file));
      setProfileError('');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!name.trim()) {
      setProfileError('Name is required');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    if (profileFile) {
      formData.append('profileImage', profileFile);
    }

    setProfileLoading(true);
    const result = await updateProfile(formData);
    setProfileLoading(false);

    if (result.success) {
      setProfileSuccess('Profile details updated successfully');
      setTimeout(() => setProfileSuccess(''), 5000);
    } else {
      setProfileError(result.error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPwError('Please fill in all password fields');
      return;
    }
    if (newPassword.length < 8) {
      setPwError('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }

    setPwLoading(true);
    const result = await changePassword(oldPassword, newPassword);
    setPwLoading(false);

    if (result.success) {
      setPwSuccess('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwSuccess(''), 5000);
    } else {
      setPwError(result.error);
    }
  };

  const getJoinedDate = () => {
    if (!user?.createdAt) return 'N/A';
    return new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      {/* Header Banner Greeting */}
      <div className="bg-white border border-gray-200/80 rounded-[20px] p-8 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gray-50 rounded-full blur-3xl pointer-events-none"></div>

        {/* Profile Avatar Upload Trigger */}
        <div className="relative group shrink-0">
          <div className="h-24 w-24 rounded-full bg-blue-600/10 border-2 border-blue-600/20 flex items-center justify-center text-blue-600 text-3xl font-extrabold overflow-hidden shadow-sm">
            {profilePreview ? (
              <img src={profilePreview} alt={user?.name} className="h-full w-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase() || 'A'
            )}
          </div>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-md transition-all border-2 border-white"
            title="Upload Photo"
          >
            <Camera size={14} />
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Info Header */}
        <div className="space-y-1 text-center sm:text-left z-10">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{user?.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-150">
              {user?.role}
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">{user?.email}</p>
          <div className="flex items-center justify-center sm:justify-start gap-4 pt-2 text-[11px] text-gray-400 font-medium">
            <span className="flex items-center gap-1">
              <Calendar size={13} /> Joined {getJoinedDate()}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle size={13} className="text-emerald-500" /> Account Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Edit Info & Password Reset */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Card 1: Profile Information */}
        <div className="bg-white border border-gray-200/80 rounded-[20px] p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <UserIcon className="text-blue-600" size={18} />
              <h2 className="text-base font-bold text-gray-900">Personal Information</h2>
            </div>
          </div>

          {profileSuccess && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-xs font-semibold">
              <CheckCircle size={16} />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs font-semibold">
              <AlertCircle size={16} />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <UserIcon size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white text-xs font-semibold text-gray-900 rounded-xl pl-10 pr-4 py-3"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Email Address (Read-only)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-gray-100 border border-gray-200 text-xs font-medium text-gray-500 rounded-xl pl-10 pr-4 py-3 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Phone size={16} />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white text-xs font-semibold text-gray-900 rounded-xl pl-10 pr-4 py-3"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                {profileLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={15} /> Save Profile Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Card 2: Security & Password */}
        <div className="bg-white border border-gray-200/80 rounded-[20px] p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <Lock className="text-blue-600" size={18} />
              <h2 className="text-base font-bold text-gray-900">Security & Password</h2>
            </div>
          </div>

          {pwSuccess && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-xs font-semibold">
              <CheckCircle size={16} />
              <span>{pwSuccess}</span>
            </div>
          )}

          {pwError && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs font-semibold">
              <AlertCircle size={16} />
              <span>{pwError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Current Password
              </label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white text-xs font-medium text-gray-900 rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters with number & symbol"
                className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white text-xs font-medium text-gray-900 rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-blue-600 focus:bg-white text-xs font-medium text-gray-900 rounded-xl p-3"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={pwLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                {pwLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Lock size={15} /> Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Profile;

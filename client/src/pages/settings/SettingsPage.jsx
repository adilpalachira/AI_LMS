import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Camera, 
  Lock, 
  AlertCircle, 
  CheckCircle,
  Save,
  Sun,
  Moon,
  Laptop,
  Bell,
  ShieldCheck,
  LogOut,
  Calendar,
  Check
} from 'lucide-react';

const SettingsPage = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Active tab / section (or all stacked)
  const [activeTab, setActiveTab] = useState('all');

  // --- Profile state ---
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePreview, setProfilePreview] = useState(
    user?.profileImage ? `http://localhost:5000/${user.profileImage}` : null
  );
  const [profileFile, setProfileFile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const fileInputRef = useRef(null);

  // Sync state if user changes in context
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      if (user.profileImage) {
        setProfilePreview(`http://localhost:5000/${user.profileImage}`);
      }
    }
  }, [user]);

  // --- Notifications state ---
  const [notificationPrefs, setNotificationPrefs] = useState({
    assignmentReminders: user?.notificationPreferences?.assignmentReminders ?? true,
    quizNotifications: user?.notificationPreferences?.quizNotifications ?? true,
    courseAnnouncements: user?.notificationPreferences?.courseAnnouncements ?? true,
    performanceAlerts: user?.notificationPreferences?.performanceAlerts ?? true,
    studyPlanReminders: user?.notificationPreferences?.studyPlanReminders ?? true,
  });
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState('');
  const [notifError, setNotifError] = useState('');

  // --- Security / Password state ---
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  // Profile image handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setProfileError('Only valid image files (JPG, PNG, WebP) are allowed');
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

  // Submit Profile changes
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!name.trim()) {
      setProfileError('Full Name is required');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('phone', phone.trim());
    if (profileFile) {
      formData.append('profileImage', profileFile);
    }

    setProfileLoading(true);
    const result = await updateProfile(formData);
    setProfileLoading(false);

    if (result.success) {
      setProfileSuccess('Profile information updated successfully');
      setProfileFile(null);
      setTimeout(() => setProfileSuccess(''), 4000);
    } else {
      setProfileError(result.error || 'Failed to update profile.');
    }
  };

  // Submit Notification Preferences
  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    setNotifError('');
    setNotifSuccess('');

    const formData = new FormData();
    formData.append('notificationPreferences', JSON.stringify(notificationPrefs));

    setNotifLoading(true);
    const result = await updateProfile(formData);
    setNotifLoading(false);

    if (result.success) {
      setNotifSuccess('Notification preferences saved successfully');
      setTimeout(() => setNotifSuccess(''), 4000);
    } else {
      setNotifError(result.error || 'Failed to update notification preferences.');
    }
  };

  // Submit Password Change
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
    if (oldPassword === newPassword) {
      setPwError('New password cannot be the same as your current password');
      return;
    }

    setPwLoading(true);
    const result = await changePassword(oldPassword, newPassword);
    setPwLoading(false);

    if (result.success) {
      setPwSuccess('Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwSuccess(''), 4000);
    } else {
      setPwError(result.error || 'Unable to update password.');
    }
  };

  // Theme change handler
  const handleThemeChange = async (selectedTheme) => {
    setTheme(selectedTheme);
    // Optionally persist to backend user model in background
    try {
      const formData = new FormData();
      formData.append('themePreference', selectedTheme);
      await updateProfile(formData);
    } catch (err) {
      // non-blocking
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getJoinedDate = () => {
    if (!user?.createdAt) return 'Recently';
    return new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto pb-16 font-sans">
        
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage your account details, appearance themes, notifications, and security preferences.
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200/80 pb-3 overflow-x-auto select-none">
          {[
            { id: 'all', label: 'All Settings' },
            { id: 'profile', label: 'Profile' },
            { id: 'appearance', label: 'Appearance' },
            { id: 'notifications', label: 'Notifications' },
            { id: 'security', label: 'Security' },
            { id: 'account', label: 'Account' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ======================================================== */}
        {/* 1. PROFILE SETTINGS */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'profile') && (
          <div className="premium-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <UserIcon size={18} className="text-blue-600" />
                  Profile Information
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Update your public name, phone contact, and avatar image.
                </p>
              </div>
            </div>

            {profileSuccess && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 p-3.5 rounded-xl text-xs font-semibold">
                <CheckCircle size={16} />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs font-semibold">
                <AlertCircle size={16} />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Profile Avatar Header with Live Upload */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="relative group shrink-0">
                  <div className="h-20 w-20 rounded-full bg-blue-600/10 border-2 border-blue-600/20 flex items-center justify-center text-blue-600 text-2xl font-bold overflow-hidden shadow-xs">
                    {profilePreview ? (
                      <img src={profilePreview} alt={user?.name} className="h-full w-full object-cover" />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-md transition-all border-2 border-white"
                    title="Upload New Photo"
                  >
                    <Camera size={13} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="space-y-1 text-center sm:text-left">
                  <p className="text-xs font-bold text-gray-900">Profile Picture</p>
                  <p className="text-[11px] text-gray-400">
                    JPG, PNG, or WebP. Max 5MB allowed.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
                  >
                    Choose file
                  </button>
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <UserIcon size={15} />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="form-input !pl-10"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Email Address <span className="text-gray-400 font-normal">(Read-only)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail size={15} />
                    </div>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="form-input !pl-10 cursor-not-allowed bg-gray-50 opacity-80"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Phone size={15} />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-input !pl-10"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  {profileLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={14} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. APPEARANCE / THEME SELECTOR */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'appearance') && (
          <div className="premium-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Sun size={18} className="text-amber-500" />
                  Appearance & Theme
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Customize the interface theme mode to reduce eye strain.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Light Mode Option */}
              <div
                onClick={() => handleThemeChange('light')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  theme === 'light'
                    ? 'border-blue-600 bg-blue-50/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
                    <Sun size={18} />
                  </div>
                  {theme === 'light' && (
                    <span className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900">Light Mode</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Clean, bright contrast</p>
                </div>
              </div>

              {/* Dark Mode Option */}
              <div
                onClick={() => handleThemeChange('dark')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  theme === 'dark'
                    ? 'border-blue-600 bg-blue-50/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-slate-800 text-blue-400 border border-slate-700">
                    <Moon size={18} />
                  </div>
                  {theme === 'dark' && (
                    <span className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900">Dark Mode</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Deep slate, low glare</p>
                </div>
              </div>

              {/* System Mode Option */}
              <div
                onClick={() => handleThemeChange('system')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  theme === 'system'
                    ? 'border-blue-600 bg-blue-50/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-gray-100 text-gray-700 border border-gray-200">
                    <Laptop size={18} />
                  </div>
                  {theme === 'system' && (
                    <span className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900">System Preference</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Matches your OS setting</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. NOTIFICATION PREFERENCES */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'notifications') && (
          <div className="premium-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Bell size={18} className="text-blue-600" />
                  Notification Preferences
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Select what updates you want to receive across assignments, quizzes, and course events.
                </p>
              </div>
            </div>

            {notifSuccess && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 p-3.5 rounded-xl text-xs font-semibold">
                <CheckCircle size={16} />
                <span>{notifSuccess}</span>
              </div>
            )}

            {notifError && (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs font-semibold">
                <AlertCircle size={16} />
                <span>{notifError}</span>
              </div>
            )}

            <form onSubmit={handleNotificationSubmit} className="space-y-4">
              {[
                { 
                  id: 'assignmentReminders', 
                  title: 'Assignment Reminders', 
                  desc: 'Receive alerts 24 hours and 2 hours before assignment deadlines.' 
                },
                { 
                  id: 'quizNotifications', 
                  title: 'Quiz Notifications', 
                  desc: 'Get notified when new quizzes are published or graded.' 
                },
                { 
                  id: 'courseAnnouncements', 
                  title: 'Course Announcements', 
                  desc: 'Stay informed about instructor bulletins and syllabus changes.' 
                },
                { 
                  id: 'performanceAlerts', 
                  title: 'Performance Alerts', 
                  desc: 'Weekly summary of mastery levels and learning velocity.' 
                },
                { 
                  id: 'studyPlanReminders', 
                  title: 'Study Plan Reminders', 
                  desc: 'Daily nudge for scheduled study sessions and exam countdowns.' 
                },
              ].map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-gray-900">{item.title}</p>
                    <p className="text-[11px] text-gray-400">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs[item.id]}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        [item.id]: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              ))}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={notifLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  {notifLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={14} />
                      Save Preferences
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. SECURITY / PASSWORD SETTINGS */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'security') && (
          <div className="premium-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Lock size={18} className="text-blue-600" />
                  Security & Password
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Update your authentication credentials securely.
                </p>
              </div>
            </div>

            {pwSuccess && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 p-3.5 rounded-xl text-xs font-semibold">
                <CheckCircle size={16} />
                <span>{pwSuccess}</span>
              </div>
            )}

            {pwError && (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs font-semibold">
                <AlertCircle size={16} />
                <span>{pwError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="form-input"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  placeholder="Re-enter new password"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  {pwLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock size={14} />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. ACCOUNT INFORMATION & LOGOUT */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'account') && (
          <div className="premium-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-blue-600" />
                  Account Information
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Account status and session management.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Account Status
                </span>
                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle size={14} />
                  {user?.status || 'Active'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Role
                </span>
                <p className="text-xs font-bold text-gray-900">
                  {user?.role || 'Student'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Member Since
                </span>
                <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <Calendar size={13} className="text-gray-400" />
                  {getJoinedDate()}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Email Verification
                </span>
                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle size={14} />
                  Verified
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-gray-900">Sign Out</p>
                <p className="text-[11px] text-gray-400">End your active session securely.</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-all border border-red-200/60"
              >
                <LogOut size={14} />
                Log Out
              </button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;

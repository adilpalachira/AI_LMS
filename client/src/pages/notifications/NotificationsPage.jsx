import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import notificationService from '../../services/notificationService';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { 
  Bell, 
  Check, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Award, 
  BookOpen, 
  Calendar, 
  AlertTriangle, 
  ExternalLink, 
  Filter, 
  RefreshCw, 
  Inbox,
  Send,
  Users,
  Search,
  CheckCircle,
  AlertCircle,
  History,
  X
} from 'lucide-react';

const formatRelativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(date).toLocaleDateString();
};

const getNotificationDetails = (type) => {
  switch (type) {
    case 'ASSIGNMENT_CREATED':
    case 'ASSIGNMENT_SUBMITTED':
    case 'ASSIGNMENT_GRADED':
      return { icon: <FileText size={16} className="text-indigo-600" />, category: 'Academic' };
    case 'ASSIGNMENT_DUE_SOON':
      return { icon: <Clock size={16} className="text-amber-600" />, category: 'Academic' };
    case 'QUIZ_AVAILABLE':
    case 'QUIZ_RESULT':
      return { icon: <Award size={16} className="text-purple-600" />, category: 'Academic' };
    case 'COURSE_ENROLLED':
    case 'COURSE_CONTENT_UPDATED':
    case 'COURSE_COMPLETED':
      return { icon: <BookOpen size={16} className="text-blue-600" />, category: 'Course' };
    case 'STUDY_PLAN_REMINDER':
      return { icon: <Calendar size={16} className="text-emerald-600" />, category: 'Learning' };
    case 'PERFORMANCE_RISK':
      return { icon: <AlertTriangle size={16} className="text-red-600" />, category: 'Performance' };
    case 'SYSTEM_ANNOUNCEMENT':
    default:
      return { icon: <Bell size={16} className="text-gray-900" />, category: 'System' };
  }
};

const NotificationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Primary Tab for Admin: 'inbox' | 'compose' | 'history'
  const [adminViewMode, setAdminViewMode] = useState('inbox');

  // --- INBOX STATE ---
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, unreadCount: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- ADMIN COMPOSER STATE ---
  const [recipientType, setRecipientType] = useState('all_students');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState([]);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [composeTitle, setComposeTitle] = useState('');
  const [composeMessage, setComposeMessage] = useState('');
  const [composePriority, setComposePriority] = useState('Normal');
  const [composeActionUrl, setComposeActionUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState('');
  const [sendError, setSendError] = useState('');

  // --- SENT HISTORY STATE ---
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (adminViewMode === 'inbox') {
      fetchNotifications();
    } else if (adminViewMode === 'compose') {
      fetchComposerData();
    } else if (adminViewMode === 'history') {
      fetchSentHistory();
    }
  }, [adminViewMode, activeTab, pagination.page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 15,
        isRead: activeTab === 'unread' ? false : undefined
      };
      const res = await notificationService.getNotifications(params);
      if (res?.success) {
        setNotifications(res.data.notifications || []);
        setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0, unreadCount: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchComposerData = async () => {
    try {
      const [usersRes, coursesRes] = await Promise.all([
        api.get('/users?limit=200'),
        api.get('/courses')
      ]);

      if (usersRes.data?.success) {
        setAvailableUsers(usersRes.data.data.users || []);
      }
      if (coursesRes.data?.success) {
        setCourses(coursesRes.data.data.courses || coursesRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load composer data:', err);
    }
  };

  const fetchSentHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get('/notifications/history');
      if (res.data?.success) {
        setHistoryList(res.data.data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load sent history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await notificationService.syncReminders();
    await fetchNotifications();
  };

  const handleMarkAsRead = async (notif) => {
    try {
      if (!notif.isRead) {
        await notificationService.markAsRead(notif._id);
        setNotifications(prev =>
          prev.map(n => n._id === notif._id ? { ...n, isRead: true, readAt: new Date() } : n)
        );
        setPagination(prev => ({
          ...prev,
          unreadCount: Math.max(0, prev.unreadCount - 1)
        }));
      }
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date() })));
      setPagination(prev => ({ ...prev, unreadCount: 0 }));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // Submit Send Notification
  const handleSendNotification = async (e) => {
    e.preventDefault();
    setSendError('');
    setSendSuccess('');

    if (!composeTitle.trim() || !composeMessage.trim()) {
      setSendError('Title and message are required.');
      return;
    }

    if (recipientType === 'custom' && selectedRecipientIds.length === 0) {
      setSendError('Please select at least one recipient.');
      return;
    }

    if (recipientType === 'course_students' && !selectedCourseId) {
      setSendError('Please select a course.');
      return;
    }

    setSending(true);
    try {
      const payload = {
        recipientType,
        recipientIds: selectedRecipientIds,
        courseId: selectedCourseId || null,
        title: composeTitle.trim(),
        message: composeMessage.trim(),
        priority: composePriority,
        actionUrl: composeActionUrl.trim()
      };

      const res = await api.post('/notifications/send', payload);
      if (res.data?.success) {
        setSendSuccess(res.data.message || 'Notification sent successfully!');
        setComposeTitle('');
        setComposeMessage('');
        setSelectedRecipientIds([]);
        setTimeout(() => setSendSuccess(''), 5000);
      }
    } catch (err) {
      setSendError(err.response?.data?.message || 'Failed to send notification.');
    } finally {
      setSending(false);
    }
  };

  const toggleSelectRecipient = (uId) => {
    setSelectedRecipientIds(prev =>
      prev.includes(uId) ? prev.filter(id => id !== uId) : [...prev, uId]
    );
  };

  // Filter available users for search in custom recipient selection
  const filteredUsersForSearch = availableUsers.filter(u => {
    if (recipientType === 'student' && u.role !== 'Student') return false;
    if (recipientType === 'faculty' && u.role !== 'Faculty') return false;
    if (!recipientSearch) return true;
    return (
      u.name?.toLowerCase().includes(recipientSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(recipientSearch.toLowerCase())
    );
  });

  // Filter list by category pill
  const filteredNotifications = notifications.filter((notif) => {
    if (categoryFilter === 'all') return true;
    const details = getNotificationDetails(notif.type);
    return details.category === categoryFilter;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 sm:p-8 max-w-[1200px] w-full mx-auto space-y-6">
          {/* HEADER BANNER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <Bell size={14} className="text-gray-900" />
                <span>Notifications & System Announcements</span>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Notification Center
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                {user?.role === 'Admin'
                  ? 'Send targeted academic notifications to students & faculty or review system announcements.'
                  : 'Stay updated with coursework announcements, assignment deadlines, quiz results, and study reminders.'}
              </p>
            </div>

            {/* Admin Action Tabs */}
            {user?.role === 'Admin' ? (
              <div className="inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setAdminViewMode('inbox')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    adminViewMode === 'inbox' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Inbox size={14} />
                  My Inbox
                </button>
                <button
                  type="button"
                  onClick={() => setAdminViewMode('compose')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    adminViewMode === 'compose' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Send size={14} />
                  Send Notification
                </button>
                <button
                  type="button"
                  onClick={() => setAdminViewMode('history')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    adminViewMode === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <History size={14} />
                  Sent History
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl transition-all shadow-sm focus:outline-none"
                  title="Refresh Notifications & Sync Reminders"
                >
                  <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                </button>

                {pagination.unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <Check size={14} />
                    Mark All Read
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* VIEW 1: MY INBOX */}
          {/* ======================================================== */}
          {adminViewMode === 'inbox' && (
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-6">
              {/* TABS & CATEGORY FILTERS */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                {/* All / Unread Tabs */}
                <div className="inline-flex p-1 bg-gray-100/80 border border-gray-200/80 rounded-xl">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('all'); setPagination(p => ({ ...p, page: 1 })); }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'all'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    All ({pagination.total || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('unread'); setPagination(p => ({ ...p, page: 1 })); }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'unread'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Unread
                    {pagination.unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white font-extrabold">
                        {pagination.unreadCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { value: 'all', label: 'All Categories' },
                    { value: 'Academic', label: 'Academic' },
                    { value: 'Course', label: 'Course' },
                    { value: 'Learning', label: 'Learning & Tasks' },
                    { value: 'Performance', label: 'Performance' }
                  ].map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategoryFilter(cat.value)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        categoryFilter === cat.value
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200/60'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* NOTIFICATION LIST */}
              {loading ? (
                <div className="py-16 text-center text-gray-400 text-xs animate-pulse space-y-2">
                  <p>Loading notification records...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <Inbox size={36} className="mx-auto text-gray-300 stroke-[1.5]" />
                  <h3 className="text-sm font-bold text-gray-700">
                    {activeTab === 'unread' ? "You're all caught up!" : 'No notifications yet.'}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium max-w-sm mx-auto">
                    {activeTab === 'unread'
                      ? 'There are no pending unread notifications in this category.'
                      : 'System events and course announcements will appear here as they occur.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredNotifications.map((notif) => {
                    const details = getNotificationDetails(notif.type);

                    return (
                      <div
                        key={notif._id}
                        className={`py-4 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl transition-colors hover:bg-gray-50/70 ${
                          !notif.isRead ? 'bg-blue-50/20' : ''
                        }`}
                      >
                        {/* Left: Icon and message */}
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          <div className="p-2.5 bg-gray-100 rounded-xl shrink-0 mt-0.5">
                            {details.icon}
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className={`text-sm tracking-tight ${!notif.isRead ? 'font-extrabold text-gray-950' : 'font-bold text-gray-800'}`}>
                                {notif.title}
                              </h4>

                              {notif.priority === 'Important' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-red-700 border border-red-200">
                                  Important
                                </span>
                              )}

                              <span className="text-[10px] text-gray-400 font-medium">
                                • {formatRelativeTime(notif.createdAt)}
                              </span>
                            </div>

                            <p className="text-xs text-gray-600 leading-relaxed font-medium">
                              {notif.message}
                            </p>

                            {notif.actionUrl && (
                              <div className="pt-1">
                                <Link
                                  to={notif.actionUrl}
                                  onClick={() => handleMarkAsRead(notif)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                  View Details
                                  <ExternalLink size={12} />
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {!notif.isRead ? (
                            <button
                              type="button"
                              onClick={() => handleMarkAsRead(notif)}
                              className="p-1.5 text-xs text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
                              title="Mark as Read"
                            >
                              <Check size={13} />
                              <span className="text-[11px] font-semibold">Mark Read</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-medium px-2">
                              Read
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(notif._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Notification"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* PAGINATION */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs font-semibold text-gray-500">
                  <span>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={pagination.page <= 1}
                      onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                      className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                      className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 2: ADMIN TARGETED NOTIFICATION COMPOSER */}
          {/* ======================================================== */}
          {adminViewMode === 'compose' && (
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Send size={18} className="text-blue-600" />
                  Create Targeted Notification
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Send targeted announcements to specific students, faculty cohorts, or all users.
                </p>
              </div>

              {sendSuccess && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-xs font-semibold">
                  <CheckCircle size={16} />
                  <span>{sendSuccess}</span>
                </div>
              )}

              {sendError && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs font-semibold">
                  <AlertCircle size={16} />
                  <span>{sendError}</span>
                </div>
              )}

              <form onSubmit={handleSendNotification} className="space-y-6">
                {/* 1. Recipient Target Selector */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Recipient Group
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'all_students', label: 'All Students' },
                      { id: 'all_faculty', label: 'All Faculty' },
                      { id: 'all_users', label: 'All Users' },
                      { id: 'course_students', label: 'Course Enrolled' },
                      { id: 'custom', label: 'Select Specific Users' },
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setRecipientType(type.id)}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                          recipientType === type.id
                            ? 'bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-600'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Course Selection when 'course_students' is active */}
                {recipientType === 'course_students' && (
                  <div className="space-y-1.5 max-w-md">
                    <label className="block text-xs font-bold text-gray-700">
                      Select Target Course
                    </label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      required
                      className="form-input"
                    >
                      <option value="">-- Choose Course --</option>
                      {courses.map(c => (
                        <option key={c._id} value={c._id}>
                          {c.code ? `[${c.code}] ` : ''}{c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Specific Multi-User Selection when 'custom' is active */}
                {recipientType === 'custom' && (
                  <div className="space-y-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-800">
                        Choose Individual Recipients ({selectedRecipientIds.length} selected)
                      </label>
                      {selectedRecipientIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedRecipientIds([])}
                          className="text-[11px] font-semibold text-red-600 hover:underline"
                        >
                          Clear Selection
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search student or faculty by name or email..."
                        value={recipientSearch}
                        onChange={(e) => setRecipientSearch(e.target.value)}
                        className="form-input !pl-9 !text-xs"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-gray-100 bg-white border border-gray-200 rounded-xl p-2">
                      {filteredUsersForSearch.length === 0 ? (
                        <p className="text-xs text-gray-400 p-3 text-center">No users match search.</p>
                      ) : (
                        filteredUsersForSearch.map(u => {
                          const isSelected = selectedRecipientIds.includes(u._id);
                          return (
                            <div
                              key={u._id}
                              onClick={() => toggleSelectRecipient(u._id)}
                              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                                isSelected ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <div>
                                <p className="font-semibold">{u.name}</p>
                                <p className="text-[11px] text-gray-400">{u.email} • <span className="font-medium text-gray-500">{u.role}</span></p>
                              </div>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Notification Content */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Notification Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Assignment Deadline Reminder / System Maintenance"
                      value={composeTitle}
                      onChange={(e) => setComposeTitle(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Message Body
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Enter the detailed announcement or reminder message here..."
                      value={composeMessage}
                      onChange={(e) => setComposeMessage(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Priority Level
                      </label>
                      <select
                        value={composePriority}
                        onChange={(e) => setComposePriority(e.target.value)}
                        className="form-input"
                      >
                        <option value="Normal">Normal Priority</option>
                        <option value="Important">Important (Highlighted in Red)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Action URL <span className="text-gray-400 font-normal">(Optional deep link)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. /assignments or /courses"
                        value={composeActionUrl}
                        onChange={(e) => setComposeActionUrl(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={14} />
                        Broadcast Notification
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 3: SENT NOTIFICATION AUDIT HISTORY */}
          {/* ======================================================== */}
          {adminViewMode === 'history' && (
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <History size={18} className="text-blue-600" />
                    Broadcast Notification History
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Log of sent system announcements and targeted messages.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchSentHistory}
                  className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 text-gray-700"
                  title="Refresh History"
                >
                  <RefreshCw size={14} className={historyLoading ? 'animate-spin' : ''} />
                </button>
              </div>

              {historyLoading ? (
                <div className="py-16 text-center text-xs text-gray-400 animate-pulse">
                  Loading sent history...
                </div>
              ) : historyList.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <History size={36} className="mx-auto text-gray-300 stroke-[1.5]" />
                  <h4 className="text-sm font-bold text-gray-700">No broadcast history yet</h4>
                  <p className="text-xs text-gray-400">
                    Notifications sent via the Composer will be logged here for administrative auditing.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-400 uppercase tracking-wider font-bold">
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Recipient</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Priority</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Date Sent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {historyList.map(item => (
                        <tr key={item._id} className="hover:bg-gray-50/70">
                          <td className="py-3 px-4 font-bold text-gray-900 max-w-[200px] truncate">
                            {item.title}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {item.recipient?.name || 'User'}
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            {item.recipient?.role || 'Student'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.priority === 'Important' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {item.priority}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {item.isRead ? (
                              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                <CheckCircle size={12} /> Read
                              </span>
                            ) : (
                              <span className="text-gray-400 font-medium">Delivered</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-400">
                            {formatRelativeTime(item.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;

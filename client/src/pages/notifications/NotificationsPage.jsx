import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
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
  Inbox
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

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'Academic' | 'Course' | 'Learning' | 'Performance'
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, unreadCount: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [activeTab, pagination.page]);

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
                <span>Module 11 — Notifications & Alerts</span>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Notification Center
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Stay updated with coursework announcements, assignment deadlines, quiz results, and study reminders.
              </p>
            </div>

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
          </div>

          {/* MAIN CONTAINER */}
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
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;

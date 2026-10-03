import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import { 
  Bell, 
  CheckCircle2, 
  FileText, 
  Award, 
  BookOpen, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  Check, 
  ChevronRight,
  ExternalLink,
  Sparkles,
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

const getNotificationIcon = (type) => {
  switch (type) {
    case 'ASSIGNMENT_CREATED':
    case 'ASSIGNMENT_SUBMITTED':
    case 'ASSIGNMENT_GRADED':
      return <FileText size={14} className="text-indigo-600" />;
    case 'ASSIGNMENT_DUE_SOON':
      return <Clock size={14} className="text-amber-600" />;
    case 'QUIZ_AVAILABLE':
    case 'QUIZ_RESULT':
      return <Award size={14} className="text-purple-600" />;
    case 'COURSE_ENROLLED':
    case 'COURSE_CONTENT_UPDATED':
    case 'COURSE_COMPLETED':
      return <BookOpen size={14} className="text-blue-600" />;
    case 'STUDY_PLAN_REMINDER':
      return <Calendar size={14} className="text-emerald-600" />;
    case 'PERFORMANCE_RISK':
      return <AlertTriangle size={14} className="text-red-600" />;
    case 'SYSTEM_ANNOUNCEMENT':
    default:
      return <Bell size={14} className="text-gray-900" />;
  }
};

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    syncReminders();

    // Periodic poll for unread count every 45s
    const interval = setInterval(fetchUnreadCount, 45000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      if (res?.success) {
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Quiet fail on network hiccups
    }
  };

  const syncReminders = async () => {
    try {
      await notificationService.syncReminders();
      fetchUnreadCount();
    } catch (err) {
      // Quiet fail
    }
  };

  const handleToggle = async () => {
    if (!isOpen) {
      setLoading(true);
      setIsOpen(true);
      try {
        const res = await notificationService.getNotifications({ page: 1, limit: 6 });
        if (res?.success) {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.pagination?.unreadCount || 0);
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setIsOpen(false);
    }
  };

  const handleMarkAsRead = async (notif, e) => {
    if (e) e.stopPropagation();
    try {
      if (!notif.isRead) {
        await notificationService.markAsRead(notif._id);
        setNotifications(prev =>
          prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      if (notif.actionUrl) {
        setIsOpen(false);
        navigate(notif.actionUrl);
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        className="text-gray-500 hover:text-gray-900 p-2 rounded-xl hover:bg-gray-50 transition-all relative focus:outline-none"
      >
        <Bell size={17} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-84 sm:w-96 bg-white border border-gray-200/90 rounded-2xl shadow-xl shadow-gray-200/50 z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-black text-white">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
              >
                <Check size={12} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="py-12 text-center text-gray-400 text-xs animate-pulse">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-2">
                <Inbox size={28} className="mx-auto text-gray-300 stroke-[1.5]" />
                <p className="text-xs font-bold text-gray-700">All caught up!</p>
                <p className="text-[11px] text-gray-400">No unread notifications at the moment.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={(e) => handleMarkAsRead(notif, e)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-gray-50/90 transition-colors cursor-pointer relative ${
                    !notif.isRead ? 'bg-blue-50/20' : ''
                  }`}
                >
                  {/* Icon badge */}
                  <div className="p-2 bg-gray-100 rounded-xl shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs truncate ${!notif.isRead ? 'font-bold text-gray-950' : 'font-semibold text-gray-700'}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-gray-400 font-medium shrink-0">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed font-normal">
                      {notif.message}
                    </p>
                  </div>

                  {/* Unread indicator dot */}
                  {!notif.isRead && (
                    <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer View All Link */}
          <div className="p-2.5 border-t border-gray-100 bg-gray-50/50 text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-gray-900 hover:text-gray-600 inline-flex items-center gap-1 transition-colors"
            >
              View all notifications
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

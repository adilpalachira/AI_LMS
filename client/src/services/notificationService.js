import api from './api';

export const notificationService = {
  /**
   * Get paginated notifications for current user
   * @param {object} params { page, limit, isRead, type }
   */
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  /**
   * Get unread notifications count
   */
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  /**
   * Mark a single notification as read
   * @param {string} id 
   */
  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  /**
   * Delete a notification
   * @param {string} id 
   */
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  /**
   * Synchronize pending deadline & study task reminders
   */
  syncReminders: async () => {
    const response = await api.post('/notifications/sync');
    return response.data;
  }
};

export default notificationService;

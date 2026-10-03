const notificationService = require('../services/notification.service');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get paginated notifications for the authenticated user
 * GET /api/notifications?page=1&limit=20&isRead=false&type=ASSIGNMENT_CREATED
 */
const getNotifications = async (req, res, next) => {
  try {
    const data = await notificationService.getUserNotifications(req.user._id, req.query);
    return successResponse(res, 'Notifications retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Get total count of unread notifications for navbar bell
 * GET /api/notifications/unread-count
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const data = await notificationService.getUnreadCount(req.user._id);
    return successResponse(res, 'Unread notification count retrieved', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a single notification as read
 * PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id);
    return successResponse(res, 'Notification marked as read', notification);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read for current user
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const data = await notificationService.markAllAsRead(req.user._id);
    return successResponse(res, 'All notifications marked as read', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a notification
 * DELETE /api/notifications/:id
 */
const deleteNotification = async (req, res, next) => {
  try {
    const data = await notificationService.deleteNotification(req.params.id, req.user._id);
    return successResponse(res, data.message, null);
  } catch (error) {
    next(error);
  }
};

/**
 * Synchronize upcoming deadline & study task reminders for user
 * POST /api/notifications/sync
 */
const syncReminders = async (req, res, next) => {
  try {
    const data = await notificationService.syncReminders(req.user._id);
    return successResponse(res, 'Reminders synchronized successfully', data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  syncReminders
};

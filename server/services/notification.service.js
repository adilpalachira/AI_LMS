const Notification = require('../models/notification.model');
const Enrollment = require('../models/enrollment.model');
const Assignment = require('../models/assignment.model');
const Submission = require('../models/submission.model');
const StudyPlanTask = require('../models/studyPlanTask.model');
const Course = require('../models/course.model');
const User = require('../models/user.model');

/**
 * Create a single notification with duplicate event prevention
 */
const createNotification = async (data) => {
  try {
    if (!data.recipient) return null;

    // Check duplicate eventId if supplied
    if (data.eventId) {
      const existing = await Notification.findOne({ eventId: data.eventId });
      if (existing) {
        return existing;
      }
    }

    const notification = await Notification.create(data);
    return notification;
  } catch (error) {
    console.error('[NotificationService] Error creating notification:', error.message);
    return null;
  }
};

/**
 * Bulk create notifications with deduplication
 */
const createBulkNotifications = async (notifications = []) => {
  if (!Array.isArray(notifications) || notifications.length === 0) return [];

  try {
    const validNotifications = [];
    for (const notif of notifications) {
      if (notif.recipient) {
        if (notif.eventId) {
          const exists = await Notification.findOne({ eventId: notif.eventId });
          if (!exists) validNotifications.push(notif);
        } else {
          validNotifications.push(notif);
        }
      }
    }

    if (validNotifications.length === 0) return [];
    return await Notification.insertMany(validNotifications, { ordered: false });
  } catch (error) {
    console.error('[NotificationService] Bulk creation error:', error.message);
    return [];
  }
};

/**
 * Broadcast notification to all active enrolled students of a course
 */
const notifyEnrolledStudents = async (courseId, payload) => {
  try {
    const enrollments = await Enrollment.find({ course: courseId, status: 'Active' }).select('student');
    if (!enrollments || enrollments.length === 0) return [];

    const notifications = enrollments.map((en) => ({
      recipient: en.student,
      sender: payload.senderId || null,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      priority: payload.priority || 'Normal',
      relatedEntity: payload.relatedEntity || courseId,
      relatedEntityType: payload.relatedEntityType || 'Course',
      actionUrl: payload.actionUrl || '',
      eventId: payload.eventId ? `${payload.eventId}_${en.student}` : undefined
    }));

    return await createBulkNotifications(notifications);
  } catch (error) {
    console.error('[NotificationService] Failed to notify enrolled students:', error.message);
    return [];
  }
};

/**
 * Fetch paginated notifications for an authenticated user
 */
const getUserNotifications = async (userId, options = {}) => {
  const page = Math.max(1, parseInt(options.page) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(options.limit) || 20));
  const skip = (page - 1) * limit;

  const query = { recipient: userId };

  if (options.isRead !== undefined && options.isRead !== null && options.isRead !== '') {
    query.isRead = options.isRead === 'true' || options.isRead === true;
  }

  if (options.type) {
    query.type = options.type;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name email profileImage role')
      .lean(),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipient: userId, isRead: false })
  ]);

  return {
    notifications,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      unreadCount
    }
  };
};

/**
 * Get quick count of unread notifications for navbar indicator
 */
const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({ recipient: userId, isRead: false });
  return { unreadCount: count };
};

/**
 * Mark a single notification as read
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({ _id: notificationId, recipient: userId });
  if (!notification) {
    throw new Error('Notification not found or unauthorized');
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }

  return notification;
};

/**
 * Mark all unread notifications as read for a user
 */
const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
  return { updatedCount: result.modifiedCount };
};

/**
 * Delete a notification
 */
const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
  if (!notification) {
    throw new Error('Notification not found or unauthorized');
  }
  return { message: 'Notification deleted successfully' };
};

/**
 * Synchronize and generate due reminders (Deadlines & Module 8 Study Tasks)
 */
const syncReminders = async (userId) => {
  try {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // 1. Assignment Deadline Reminders
    const enrollments = await Enrollment.find({ student: userId, status: 'Active' });
    const courseIds = enrollments.map(e => e.course);

    if (courseIds.length > 0) {
      const upcomingAssignments = await Assignment.find({
        courseId: { $in: courseIds },
        status: 'Published',
        deadline: { $gte: now, $lte: next24Hours }
      }).populate('courseId', 'title code');

      for (const assignment of upcomingAssignments) {
        // Check if student has already submitted
        const hasSubmitted = await Submission.findOne({
          assignmentId: assignment._id,
          studentId: userId
        });

        if (!hasSubmitted) {
          const eventId = `DEADLINE_24H_${assignment._id}_${userId}`;
          const dueHours = Math.max(1, Math.round((new Date(assignment.deadline) - now) / (1000 * 60 * 60)));

          await createNotification({
            recipient: userId,
            type: 'ASSIGNMENT_DUE_SOON',
            title: 'Assignment Due Soon',
            message: `"${assignment.title}" in ${assignment.courseId?.title || 'your course'} is due in approximately ${dueHours} hour(s).`,
            priority: 'Important',
            relatedEntity: assignment._id,
            relatedEntityType: 'Assignment',
            actionUrl: '/assignments',
            eventId
          });
        }
      }
    }

    // 2. Module 8 Study Task Reminders for Today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const pendingTasks = await StudyPlanTask.find({
      studentId: userId,
      status: { $in: ['Pending', 'In-Progress'] },
      date: { $gte: todayStart, $lte: todayEnd }
    }).populate('courseId', 'title');

    for (const task of pendingTasks) {
      const todayStr = todayStart.toISOString().split('T')[0];
      const eventId = `STUDY_TASK_${task._id}_${todayStr}`;

      await createNotification({
        recipient: userId,
        type: 'STUDY_PLAN_REMINDER',
        title: 'Study Task Scheduled for Today',
        message: `Scheduled task: "${task.topic || task.title}" in ${task.courseId?.title || 'your study plan'}.`,
        priority: 'Normal',
        relatedEntity: task._id,
        relatedEntityType: 'StudyPlanTask',
        actionUrl: '/study-planner',
        eventId
      });
    }

    return { synced: true };
  } catch (error) {
    console.error('[NotificationService] syncReminders error:', error.message);
    return { synced: false, error: error.message };
  }
};

/**
 * Admin targeted & broadcast notification dispatcher
 */
const sendAdminNotification = async (payload, senderId) => {
  const {
    recipientType = 'custom',
    recipientIds = [],
    courseId = null,
    title,
    message,
    priority = 'Normal',
    actionUrl = ''
  } = payload;

  if (!title || !message) {
    throw new Error('Notification title and message are required');
  }

  let targetUserIds = [];

  if (recipientType === 'all_students') {
    const students = await User.find({ role: 'Student', status: 'Active' }).select('_id');
    targetUserIds = students.map(s => s._id);
  } else if (recipientType === 'all_faculty') {
    const faculty = await User.find({ role: 'Faculty', status: 'Active' }).select('_id');
    targetUserIds = faculty.map(f => f._id);
  } else if (recipientType === 'all_users') {
    const allUsers = await User.find({ status: 'Active' }).select('_id');
    targetUserIds = allUsers.map(u => u._id);
  } else if (recipientType === 'course_students' && courseId) {
    const enrollments = await Enrollment.find({ course: courseId, status: 'Active' }).select('student');
    targetUserIds = enrollments.map(e => e.student);
  } else if (Array.isArray(recipientIds) && recipientIds.length > 0) {
    targetUserIds = recipientIds;
  }

  // Deduplicate target IDs
  const uniqueRecipientIds = [...new Set(targetUserIds.map(id => id.toString()))];

  if (uniqueRecipientIds.length === 0) {
    throw new Error('No valid recipients found for this notification');
  }

  const notificationsToCreate = uniqueRecipientIds.map(recipientId => ({
    recipient: recipientId,
    sender: senderId,
    type: 'SYSTEM_ANNOUNCEMENT',
    title: title.trim(),
    message: message.trim(),
    priority: priority === 'Important' ? 'Important' : 'Normal',
    relatedEntity: courseId || null,
    relatedEntityType: courseId ? 'Course' : 'System',
    actionUrl: actionUrl || ''
  }));

  const created = await Notification.insertMany(notificationsToCreate);
  return {
    success: true,
    recipientsCount: uniqueRecipientIds.length,
    createdCount: created.length
  };
};

/**
 * Fetch sent notification history for Admin audit
 */
const getAdminNotificationHistory = async (adminId, options = {}) => {
  const page = Math.max(1, parseInt(options.page) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(options.limit) || 20));
  const skip = (page - 1) * limit;

  const query = {
    $or: [
      { sender: adminId },
      { type: 'SYSTEM_ANNOUNCEMENT' }
    ]
  };

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('recipient', 'name email role')
      .populate('sender', 'name email role')
      .lean(),
    Notification.countDocuments(query)
  ]);

  return {
    notifications,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    }
  };
};

module.exports = {
  createNotification,
  createBulkNotifications,
  notifyEnrolledStudents,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  syncReminders,
  sendAdminNotification,
  getAdminNotificationHistory
};

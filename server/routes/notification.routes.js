const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  syncReminders,
  sendAdminNotification,
  getAdminNotificationHistory
} = require('../controllers/notification.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// All notification routes are protected
router.use(protect);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);
router.post('/sync', syncReminders);

// Admin targeted notification composer & audit history
router.post('/send', authorizeRoles('Admin'), sendAdminNotification);
router.get('/history', authorizeRoles('Admin'), getAdminNotificationHistory);

module.exports = router;

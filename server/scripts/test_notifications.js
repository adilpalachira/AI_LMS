const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const notificationService = require('../services/notification.service');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const Course = require('../models/course.model');

async function runNotificationTests() {
  console.log('====================================================');
  console.log('  MODULE 11 — NOTIFICATIONS & ALERTS TEST SUITE     ');
  console.log('====================================================');

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-lms';
  await mongoose.connect(mongoUri);

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    const student = await User.findOne({ role: 'Student' });
    const faculty = await User.findOne({ role: 'Faculty' });

    if (!student) {
      console.error('No student found in database for testing');
      process.exit(1);
    }

    const testStudentId = student._id;

    // 1. Test Create Single Notification
    console.log('\nTesting Notification Creation...');
    const notif1 = await notificationService.createNotification({
      recipient: testStudentId,
      sender: faculty ? faculty._id : null,
      type: 'ASSIGNMENT_CREATED',
      title: 'Test Assignment Created',
      message: 'A new assignment has been uploaded for your course.',
      priority: 'Important',
      actionUrl: '/assignments',
      eventId: `TEST_EVENT_${Date.now()}_1`
    });

    assert(notif1 !== null && notif1._id, 'Notification created successfully in MongoDB');
    assert(notif1.isRead === false, 'New notification defaults to unread (isRead: false)');
    assert(notif1.priority === 'Important', 'Notification priority recorded correctly');

    // 2. Test Duplicate Event Prevention
    console.log('\nTesting Duplicate Event Prevention...');
    const duplicateEventId = `TEST_DEDUP_${Date.now()}`;
    const firstNotif = await notificationService.createNotification({
      recipient: testStudentId,
      type: 'ASSIGNMENT_DUE_SOON',
      title: 'Due Soon Reminder',
      message: 'Reminder 1',
      eventId: duplicateEventId
    });

    const secondNotif = await notificationService.createNotification({
      recipient: testStudentId,
      type: 'ASSIGNMENT_DUE_SOON',
      title: 'Due Soon Reminder Duplicate',
      message: 'Reminder 2',
      eventId: duplicateEventId
    });

    assert(firstNotif._id.toString() === secondNotif._id.toString(), 'Duplicate eventId correctly prevented duplicate document creation');

    // 3. Test Get User Notifications & Pagination
    console.log('\nTesting Notification Retrieval & Pagination...');
    const userNotifs = await notificationService.getUserNotifications(testStudentId, { page: 1, limit: 10 });
    assert(Array.isArray(userNotifs.notifications), 'Returns notifications array');
    assert(userNotifs.pagination.total >= 1, 'Pagination total count is accurate');
    assert(typeof userNotifs.pagination.unreadCount === 'number', 'Returns numeric unreadCount');

    // 4. Test Unread Count API
    console.log('\nTesting Unread Count...');
    const countRes = await notificationService.getUnreadCount(testStudentId);
    assert(typeof countRes.unreadCount === 'number' && countRes.unreadCount >= 1, 'getUnreadCount returns valid count');

    // 5. Test Mark Single Notification As Read
    console.log('\nTesting Mark As Read...');
    const readNotif = await notificationService.markAsRead(notif1._id, testStudentId);
    assert(readNotif.isRead === true, 'Notification isRead set to true');
    assert(readNotif.readAt !== null, 'Notification readAt timestamp recorded');

    // 6. Test Mark All As Read
    console.log('\nTesting Mark All As Read...');
    const markAllRes = await notificationService.markAllAsRead(testStudentId);
    assert(typeof markAllRes.updatedCount === 'number', 'markAllAsRead completes successfully');

    const countAfterMarkAll = await notificationService.getUnreadCount(testStudentId);
    assert(countAfterMarkAll.unreadCount === 0, 'Unread count drops to 0 after markAllAsRead');

    // 7. Test Ownership Security
    console.log('\nTesting Ownership Security Checks...');
    const fakeOtherUserId = new mongoose.Types.ObjectId();
    let securityBlocked = false;
    try {
      await notificationService.markAsRead(notif1._id, fakeOtherUserId);
    } catch (err) {
      securityBlocked = true;
    }
    assert(securityBlocked, 'Unauthorized user blocked from marking another user notification as read');

    // 8. Test Delete Notification
    console.log('\nTesting Delete Notification...');
    const deleteRes = await notificationService.deleteNotification(notif1._id, testStudentId);
    assert(deleteRes.message === 'Notification deleted successfully', 'Notification deleted successfully');

    const deletedLookup = await Notification.findById(notif1._id);
    assert(deletedLookup === null, 'Deleted notification no longer exists in MongoDB');

    // 9. Clean up test duplicate notification
    if (firstNotif && firstNotif._id) {
      await Notification.findByIdAndDelete(firstNotif._id);
    }

    // 10. Test Reminder Synchronization
    console.log('\nTesting Reminder Synchronization...');
    const syncRes = await notificationService.syncReminders(testStudentId);
    assert(syncRes.synced === true, 'Reminder synchronization executed successfully');

    console.log('\n====================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed with error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runNotificationTests();

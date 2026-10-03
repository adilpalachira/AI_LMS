const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/user.model');
const Course = require('../models/course.model');
const Question = require('../models/question.model');
const Notification = require('../models/notification.model');
const analyticsService = require('../services/analytics.service');
const reportService = require('../services/report.service');
const notificationService = require('../services/notification.service');

async function test() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-lms');
  console.log('Connected to MongoDB');

  const adminUser = await User.findOne({ role: 'Admin' });
  const studentUser = await User.findOne({ role: 'Student' });

  console.log('1. Testing getAdminSystemAnalytics...');
  const adminAnalytics = await analyticsService.getAdminSystemAnalytics('30d');
  console.log('Totals:', adminAnalytics.totals);
  console.log('Question Overview:', adminAnalytics.questionOverview);

  console.log('\n2. Testing Report Generation for QUESTION_OVERVIEW...');
  const report = await reportService.generateReport('QUESTION_OVERVIEW', {}, adminUser);
  console.log('Report Title:', report.title);
  console.log('Total Records:', report.rows.length);
  console.log('Summary:', report.summary);

  console.log('\n3. Testing Targeted Admin Notification...');
  const notifResult = await notificationService.sendAdminNotification({
    recipientType: 'all_students',
    title: 'Midterm Assessment Schedule Published',
    message: 'The midterm assessment schedule for all enrolled subjects is now live.',
    priority: 'Important',
    actionUrl: '/assignments'
  }, adminUser._id);
  console.log('Notification Send Result:', notifResult);

  const history = await notificationService.getAdminNotificationHistory(adminUser._id);
  console.log('Sent History Total:', history.pagination.total);

  await mongoose.disconnect();
  console.log('\nAll tests passed successfully!');
}

test().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

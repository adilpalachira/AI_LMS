const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const analyticsService = require('../services/analytics.service');
const User = require('../models/user.model');
const Course = require('../models/course.model');

async function runTests() {
  console.log('====================================================');
  console.log('  MODULE 10 — INTELLIGENT LEARNING ANALYTICS SUITE  ');
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
    // 1. Test Admin System Analytics
    console.log('\nTesting Admin System Overview Analytics...');
    const adminAnalytics = await analyticsService.getAdminSystemAnalytics('30d');
    assert(adminAnalytics !== null, 'Admin analytics returns valid object');
    assert(typeof adminAnalytics.totals.totalUsers === 'number', 'Admin returns totalUsers as number');
    assert(Array.isArray(adminAnalytics.courseComparisons), 'Admin returns courseComparisons array');
    assert(Array.isArray(adminAnalytics.insights), 'Admin returns real computed insights array');

    // 2. Test Course Detailed Analytics & Question Item Analysis
    console.log('\nTesting Course Detailed Analytics & Question Item Analysis...');
    const course = await Course.findOne();
    if (course) {
      const courseAnalytics = await analyticsService.getCourseDetailedAnalytics(course._id.toString(), '30d');
      assert(courseAnalytics !== null, 'Course analytics returns valid object');
      assert(typeof courseAnalytics.overview.totalStudents === 'number', 'Course overview includes totalStudents count');
      assert(typeof courseAnalytics.overview.completionRate === 'number', 'Course overview includes completionRate %');
      assert(Array.isArray(courseAnalytics.questionItemAnalysis), 'Course includes question item difficulty analysis');
      assert(Array.isArray(courseAnalytics.students), 'Course returns enrolled students roster');
    } else {
      console.log('[SKIP] No course available for course analytics test');
    }

    // 3. Test Student Detailed Analytics
    console.log('\nTesting Student Detailed Learning Analytics...');
    const student = await User.findOne({ role: 'Student' });
    if (student) {
      const studentAnalytics = await analyticsService.getStudentDetailedAnalytics(student._id.toString(), '30d');
      assert(studentAnalytics !== null, 'Student analytics returns valid object');
      assert(typeof studentAnalytics.summaryCards.avgCourseProgress === 'number', 'Student includes avgCourseProgress %');
      assert(typeof studentAnalytics.summaryCards.quizAvgScore === 'number', 'Student includes quizAvgScore %');
      assert(Array.isArray(studentAnalytics.quizTrend), 'Student includes quizTrend array');
      assert(Array.isArray(studentAnalytics.coursePredictions), 'Student includes integrated Module 9 predictions');
    } else {
      console.log('[SKIP] No student available for student analytics test');
    }

    // 4. Test Timeframe Filtering
    console.log('\nTesting Timeframe Date Range Filtering...');
    const admin7d = await analyticsService.getAdminSystemAnalytics('7d');
    assert(admin7d.timeframe === '7d', 'Timeframe filter 7d applied correctly');
    const adminAll = await analyticsService.getAdminSystemAnalytics('all');
    assert(adminAll.timeframe === 'all', 'Timeframe filter all applied correctly');

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

runTests();

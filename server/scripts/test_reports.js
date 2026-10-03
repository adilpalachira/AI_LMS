const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const reportService = require('../services/report.service');
const User = require('../models/user.model');
const Course = require('../models/course.model');

async function runReportTests() {
  console.log('====================================================');
  console.log('    MODULE 12 — REPORTS & ADMIN INSIGHTS SUITE      ');
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
    const admin = await User.findOne({ role: 'Admin' });
    const faculty = await User.findOne({ role: 'Faculty' });
    const student = await User.findOne({ role: 'Student' });
    const course = await Course.findOne();

    if (!admin) {
      console.error('No admin found in database for testing');
      process.exit(1);
    }

    // 1. Test Report Catalog
    console.log('\n1. Testing Report Catalog...');
    const catalog = reportService.getReportCatalog(admin);
    assert(Array.isArray(catalog) && catalog.length >= 7, 'Catalog returns all 7 report configurations');
    const catalogKeys = catalog.map(c => c.id);
    assert(catalogKeys.includes('STUDENT_PERFORMANCE') && catalogKeys.includes('AT_RISK_STUDENTS'), 'Catalog contains standard academic reports');

    // 2. Test Student Performance Report
    console.log('\n2. Testing Student Performance Report Generation...');
    const studentReport = await reportService.generateReport('STUDENT_PERFORMANCE', {}, admin);
    assert(studentReport.metadata.reportType === 'STUDENT_PERFORMANCE', 'Student report metadata is set correctly');
    assert(Array.isArray(studentReport.summary), 'Student report contains summary KPI metrics');
    assert(Array.isArray(studentReport.columns) && studentReport.columns.length > 0, 'Student report provides table column definitions');
    assert(Array.isArray(studentReport.rows), 'Student report returns structured data rows from MongoDB');

    // 3. Test Course Performance Report
    console.log('\n3. Testing Course Performance Report Generation...');
    const courseReport = await reportService.generateReport('COURSE_PERFORMANCE', {}, admin);
    assert(courseReport.metadata.reportType === 'COURSE_PERFORMANCE', 'Course report generated successfully');
    assert(Array.isArray(courseReport.rows), 'Course report contains valid course aggregation rows');

    // 4. Test At-Risk Report (Module 9 ML Integration)
    console.log('\n4. Testing At-Risk Early Warning Report (Module 9 Integration)...');
    const atRiskReport = await reportService.generateReport('AT_RISK_STUDENTS', {}, admin);
    assert(atRiskReport.metadata.reportType === 'AT_RISK_STUDENTS', 'At-Risk report generated successfully');
    assert(atRiskReport.columns.some(col => col.key === 'predictedScore'), 'At-Risk report integrates Module 9 predicted scores');
    assert(atRiskReport.columns.some(col => col.key === 'riskLevel'), 'At-Risk report integrates Module 9 risk levels');

    // 5. Test Assignment Submission Report
    console.log('\n5. Testing Assignment Submission Report...');
    const assignmentReport = await reportService.generateReport('ASSIGNMENT_SUBMISSIONS', {}, admin);
    assert(assignmentReport.metadata.reportType === 'ASSIGNMENT_SUBMISSIONS', 'Assignment submission report generated');
    assert(Array.isArray(assignmentReport.rows), 'Assignment report returns submission rows');

    // 6. Test Quiz Performance Report
    console.log('\n6. Testing Quiz Performance Report...');
    const quizReport = await reportService.generateReport('QUIZ_PERFORMANCE', {}, admin);
    assert(quizReport.metadata.reportType === 'QUIZ_PERFORMANCE', 'Quiz performance report generated');
    assert(Array.isArray(quizReport.rows), 'Quiz report returns attempt and score rows');

    // 7. Test Enrollment & Completion Report
    console.log('\n7. Testing Enrollment & Completion Report...');
    const enrollReport = await reportService.generateReport('ENROLLMENT_COMPLETION', {}, admin);
    assert(enrollReport.metadata.reportType === 'ENROLLMENT_COMPLETION', 'Enrollment report generated');
    assert(Array.isArray(enrollReport.rows), 'Enrollment report returns student enrollment records');

    // 8. Test Academic Summary Report (Module 10 Analytics Integration)
    console.log('\n8. Testing Executive Academic Summary Report...');
    const summaryReport = await reportService.generateReport('ACADEMIC_SUMMARY', {}, admin);
    assert(summaryReport.metadata.reportType === 'ACADEMIC_SUMMARY', 'Academic summary report generated');
    assert(summaryReport.summary.length >= 4, 'Executive summary includes comprehensive platform-wide KPIs');

    // 9. Test CSV Export Conversion
    console.log('\n9. Testing CSV Export Conversion Utility...');
    const csvContent = reportService.convertReportToCsv(studentReport);
    assert(typeof csvContent === 'string' && csvContent.length > 0, 'CSV generator produces non-empty string');
    assert(csvContent.includes('# AI-LMS Structured Academic Report'), 'CSV includes academic report header metadata');
    assert(csvContent.includes('Student Name'), 'CSV includes properly formatted column headers');

    // 10. Test Date Range Filtering
    console.log('\n10. Testing Date Range Filtering...');
    const last30DaysReport = await reportService.generateReport('ASSIGNMENT_SUBMISSIONS', {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString()
    }, admin);
    assert(last30DaysReport.metadata.filters.startDate !== undefined, 'Date filters properly recorded in metadata');

    // 11. Test Faculty Course Isolation (RBAC)
    console.log('\n11. Testing Faculty Course Authorization...');
    if (faculty && course) {
      // If course is not taught by this faculty, authorization should block unauthorized course access
      const isInstructor = course.instructor && course.instructor.toString() === faculty._id.toString();
      if (!isInstructor) {
        let facultyBlocked = false;
        try {
          await reportService.generateReport('COURSE_PERFORMANCE', { courseId: course._id.toString() }, faculty);
        } catch (err) {
          if (err.statusCode === 403) facultyBlocked = true;
        }
        assert(facultyBlocked, 'Faculty blocked from generating report for unauthorized course');
      } else {
        const allowedReport = await reportService.generateReport('COURSE_PERFORMANCE', { courseId: course._id.toString() }, faculty);
        assert(allowedReport !== null, 'Faculty permitted to generate report for authorized course');
      }
    } else {
      console.log('[SKIP] Faculty course isolation test skipped (no separate faculty/course pair)');
    }

    // 12. Test Invalid Report Type Validation
    console.log('\n12. Testing Invalid Report Type Handling...');
    let invalidTypeCaught = false;
    try {
      await reportService.generateReport('NON_EXISTENT_TYPE', {}, admin);
    } catch (err) {
      if (err.statusCode === 400) invalidTypeCaught = true;
    }
    assert(invalidTypeCaught, 'Invalid report type properly rejected with 400 Bad Request');

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

runReportTests();

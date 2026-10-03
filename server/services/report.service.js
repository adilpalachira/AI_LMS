const Course = require('../models/course.model');
const Enrollment = require('../models/enrollment.model');
const User = require('../models/user.model');
const Assignment = require('../models/assignment.model');
const Submission = require('../models/submission.model');
const Quiz = require('../models/quiz.model');
const QuizAttempt = require('../models/quizAttempt.model');
const Category = require('../models/category.model');
const analyticsService = require('./analytics.service');

/**
 * Helper to build date range filter from query parameters
 */
const buildDateFilter = (timeframe, startDate, endDate, dateField = 'createdAt') => {
  const filter = {};
  if (startDate || endDate) {
    filter[dateField] = {};
    if (startDate) filter[dateField].$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter[dateField].$lte = end;
    }
    return filter;
  }

  if (timeframe && timeframe !== 'all') {
    const now = new Date();
    const daysMap = { '7d': 7, '30d': 30, '90d': 90, 'today': 1 };
    const days = daysMap[timeframe] || 30;
    filter[dateField] = { $gte: new Date(now.getTime() - days * 24 * 60 * 60 * 1000) };
    return filter;
  }

  return filter;
};

/**
 * Helper to get courses authorized for current user (Faculty vs Admin)
 */
const getAuthorizedCourseIds = async (currentUser, specificCourseId = null) => {
  const query = {};
  if (currentUser.role === 'Faculty') {
    query.$or = [{ instructor: currentUser._id }, { createdBy: currentUser._id }];
  }
  if (specificCourseId) {
    query._id = specificCourseId;
  }

  const courses = await Course.find(query).select('_id title code instructor');
  return courses.map(c => c._id);
};

// =========================================================================
// REPORT GENERATION ENGINES
// =========================================================================

/**
 * 1. STUDENT PERFORMANCE REPORT
 */
const generateStudentPerformanceReport = async (filters = {}, currentUser) => {
  const courseIds = await getAuthorizedCourseIds(currentUser, filters.courseId);
  const dateFilter = buildDateFilter(filters.timeframe, filters.startDate, filters.endDate, 'createdAt');

  const enrollmentQuery = { course: { $in: courseIds }, ...dateFilter };
  if (filters.status && filters.status !== 'All') {
    enrollmentQuery.status = filters.status;
  }

  const enrollments = await Enrollment.find(enrollmentQuery)
    .populate('student', 'name email role lastLogin')
    .populate('course', 'title code instructor')
    .lean();

  const reportRows = [];
  let totalScoreSum = 0;
  let scoreCount = 0;
  let highRiskCount = 0;

  for (const en of enrollments) {
    if (en.student && en.course) {
      const perf = await analyticsService.calculateStudentPerformance(en.student._id, en.course._id);
      if (perf) {
        if (!filters.riskLevel || filters.riskLevel === 'All' || perf.prediction.riskLevel === filters.riskLevel) {
          if (perf.prediction.riskLevel === 'High') highRiskCount++;
          if (perf.prediction.predictedScore) {
            totalScoreSum += perf.prediction.predictedScore;
            scoreCount++;
          }

          reportRows.push({
            studentName: en.student.name || 'N/A',
            studentEmail: en.student.email || 'N/A',
            courseCode: en.course.code || 'N/A',
            courseTitle: en.course.title || 'N/A',
            enrollmentStatus: en.status || 'Active',
            courseProgress: `${en.progress || 0}%`,
            quizAverage: `${perf.metrics.quizAvgScore}%`,
            quizPassRate: `${perf.metrics.quizPassRate}%`,
            assignmentAverage: `${perf.metrics.assignmentAvgScore}%`,
            lateSubmissions: perf.metrics.lateSubmissionCount,
            predictedGrade: `${perf.prediction.predictedScore}%`,
            riskLevel: perf.prediction.riskLevel,
            lastActiveDate: en.student.lastLogin ? new Date(en.student.lastLogin).toLocaleDateString() : 'Never'
          });
        }
      }
    }
  }

  const avgGrade = scoreCount > 0 ? Math.round(totalScoreSum / scoreCount) : 0;

  return {
    reportType: 'STUDENT_PERFORMANCE',
    title: 'Student Academic Performance Report',
    generatedAt: new Date(),
    totalRecords: reportRows.length,
    summary: [
      { label: 'Total Evaluated', value: reportRows.length },
      { label: 'Avg Predicted Grade', value: `${avgGrade}%` },
      { label: 'High Risk Students', value: highRiskCount }
    ],
    columns: [
      { key: 'studentName', label: 'Student Name' },
      { key: 'studentEmail', label: 'Email' },
      { key: 'courseCode', label: 'Course Code' },
      { key: 'courseTitle', label: 'Course Title' },
      { key: 'enrollmentStatus', label: 'Status' },
      { key: 'courseProgress', label: 'Progress' },
      { key: 'quizAverage', label: 'Quiz Avg' },
      { key: 'assignmentAverage', label: 'Assignment Avg' },
      { key: 'predictedGrade', label: 'Predicted Grade' },
      { key: 'riskLevel', label: 'Risk Tier' },
      { key: 'lastActiveDate', label: 'Last Active' }
    ],
    rows: reportRows
  };
};

/**
 * 2. COURSE PERFORMANCE REPORT
 */
const generateCoursePerformanceReport = async (filters = {}, currentUser) => {
  const courseIds = await getAuthorizedCourseIds(currentUser, filters.courseId);
  const courses = await Course.find({ _id: { $in: courseIds } }).populate('instructor', 'name email').lean();

  const reportRows = [];
  let totalEnrolled = 0;
  let totalHighRisk = 0;

  for (const c of courses) {
    const summary = await analyticsService.getCourseAnalyticsSummary(c._id);
    totalEnrolled += summary.overview.totalStudents || 0;
    totalHighRisk += summary.overview.riskBreakdown.high || 0;

    reportRows.push({
      courseCode: c.code || 'N/A',
      courseTitle: c.title || 'N/A',
      instructor: c.instructor?.name || 'Faculty',
      enrolledCount: summary.overview.totalStudents,
      avgProgress: `${summary.overview.avgCourseProgress}%`,
      avgQuizScore: `${summary.overview.avgQuizScore}%`,
      avgAssignmentScore: `${summary.overview.avgAssignmentScore}%`,
      avgPredictedGrade: `${summary.overview.avgPredictedScore}%`,
      highRiskCount: summary.overview.riskBreakdown.high,
      mediumRiskCount: summary.overview.riskBreakdown.medium,
      lowRiskCount: summary.overview.riskBreakdown.low
    });
  }

  return {
    reportType: 'COURSE_PERFORMANCE',
    title: 'Course Cohort Performance Report',
    generatedAt: new Date(),
    totalRecords: reportRows.length,
    summary: [
      { label: 'Total Courses', value: reportRows.length },
      { label: 'Total Enrolled Learners', value: totalEnrolled },
      { label: 'Total High Risk Learners', value: totalHighRisk }
    ],
    columns: [
      { key: 'courseCode', label: 'Course Code' },
      { key: 'courseTitle', label: 'Course Title' },
      { key: 'instructor', label: 'Instructor' },
      { key: 'enrolledCount', label: 'Enrolled Students' },
      { key: 'avgProgress', label: 'Avg Progress' },
      { key: 'avgQuizScore', label: 'Quiz Avg' },
      { key: 'avgAssignmentScore', label: 'Assignment Avg' },
      { key: 'avgPredictedGrade', label: 'Avg Predicted Grade' },
      { key: 'highRiskCount', label: 'High Risk' },
      { key: 'mediumRiskCount', label: 'Medium Risk' },
      { key: 'lowRiskCount', label: 'Low Risk' }
    ],
    rows: reportRows
  };
};

/**
 * 3. AT-RISK STUDENTS REPORT (Module 9 Integration)
 */
const generateAtRiskReport = async (filters = {}, currentUser) => {
  const atRiskData = await analyticsService.getAtRiskStudentsList({
    courseId: filters.courseId,
    riskLevel: filters.riskLevel || 'All'
  }, currentUser);

  const reportRows = atRiskData.students.map((st) => ({
    studentName: st.student.name || 'N/A',
    studentEmail: st.student.email || 'N/A',
    courseCode: st.course.code || 'N/A',
    courseTitle: st.course.title || 'N/A',
    riskLevel: st.prediction.riskLevel,
    predictedScore: `${st.prediction.predictedScore}%`,
    quizAvg: `${st.metrics.quizAvgScore}%`,
    assignmentAvg: `${st.metrics.assignmentAvgScore}%`,
    courseProgress: `${st.metrics.courseProgress}%`,
    daysInactive: `${st.metrics.daysInactive} day(s)`,
    primaryRiskFactors: (st.prediction.riskFactors || []).join('; ') || 'No critical factors',
    recommendedInterventions: (st.prediction.interventions || []).join('; ') || 'Standard progression'
  }));

  return {
    reportType: 'AT_RISK_STUDENTS',
    title: 'At-Risk Students Academic Early Warning Report',
    generatedAt: new Date(),
    totalRecords: reportRows.length,
    summary: [
      { label: 'Total Evaluated', value: atRiskData.totalCount },
      { label: 'High Risk Count', value: atRiskData.highRiskCount },
      { label: 'Medium Risk Count', value: atRiskData.mediumRiskCount }
    ],
    columns: [
      { key: 'studentName', label: 'Student Name' },
      { key: 'studentEmail', label: 'Email' },
      { key: 'courseCode', label: 'Course Code' },
      { key: 'riskLevel', label: 'Risk Level' },
      { key: 'predictedScore', label: 'Predicted Grade' },
      { key: 'quizAvg', label: 'Quiz Avg' },
      { key: 'assignmentAvg', label: 'Assignment Avg' },
      { key: 'daysInactive', label: 'Inactivity' },
      { key: 'primaryRiskFactors', label: 'Risk Indicators' }
    ],
    rows: reportRows
  };
};

/**
 * 4. ASSIGNMENT SUBMISSIONS REPORT
 */
const generateAssignmentReport = async (filters = {}, currentUser) => {
  const courseIds = await getAuthorizedCourseIds(currentUser, filters.courseId);
  const dateFilter = buildDateFilter(filters.timeframe, filters.startDate, filters.endDate, 'submittedAt');

  const subQuery = { courseId: { $in: courseIds }, ...dateFilter };
  if (filters.status && filters.status !== 'All') {
    subQuery.status = filters.status;
  }

  const submissions = await Submission.find(subQuery)
    .populate('studentId', 'name email')
    .populate('assignmentId', 'title maxMarks deadline')
    .populate('courseId', 'title code')
    .sort({ submittedAt: -1 })
    .lean();

  let gradedCount = 0;
  let lateCount = 0;

  const reportRows = submissions.map((sub) => {
    if (sub.status === 'Graded') gradedCount++;
    if (sub.isLate) lateCount++;

    return {
      assignmentTitle: sub.assignmentId?.title || 'N/A',
      courseCode: sub.courseId?.code || 'N/A',
      studentName: sub.studentId?.name || 'N/A',
      studentEmail: sub.studentId?.email || 'N/A',
      submittedAt: sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'N/A',
      deadline: sub.assignmentId?.deadline ? new Date(sub.assignmentId.deadline).toLocaleString() : 'N/A',
      isLate: sub.isLate ? 'Late' : 'On-Time',
      status: sub.status || 'Submitted',
      marksEarned: sub.marks !== undefined ? sub.marks : 'Ungraded',
      maxMarks: sub.assignmentId?.maxMarks || 100,
      feedback: sub.feedback || 'None'
    };
  });

  return {
    reportType: 'ASSIGNMENT_SUBMISSIONS',
    title: 'Assignment Submissions & Grading Audit Report',
    generatedAt: new Date(),
    totalRecords: reportRows.length,
    summary: [
      { label: 'Total Submissions', value: reportRows.length },
      { label: 'Graded Submissions', value: gradedCount },
      { label: 'Late Submissions', value: lateCount }
    ],
    columns: [
      { key: 'assignmentTitle', label: 'Assignment' },
      { key: 'courseCode', label: 'Course' },
      { key: 'studentName', label: 'Student' },
      { key: 'submittedAt', label: 'Submitted Date' },
      { key: 'isLate', label: 'Submission Timing' },
      { key: 'status', label: 'Status' },
      { key: 'marksEarned', label: 'Marks Earned' },
      { key: 'maxMarks', label: 'Max Marks' }
    ],
    rows: reportRows
  };
};

/**
 * 5. QUIZ PERFORMANCE REPORT
 */
const generateQuizReport = async (filters = {}, currentUser) => {
  const courseIds = await getAuthorizedCourseIds(currentUser, filters.courseId);
  const dateFilter = buildDateFilter(filters.timeframe, filters.startDate, filters.endDate, 'createdAt');

  const quizFilter = { courseId: { $in: courseIds }, ...dateFilter };
  if (filters.quizId) quizFilter.quizId = filters.quizId;

  const attempts = await QuizAttempt.find(quizFilter)
    .populate('studentId', 'name email')
    .populate('quizId', 'title passingMarks maxAttempts')
    .populate('courseId', 'title code')
    .sort({ createdAt: -1 })
    .lean();

  let passedCount = 0;
  let totalScore = 0;

  const reportRows = attempts.map((att) => {
    if (att.passed) passedCount++;
    totalScore += (att.percentage || 0);

    return {
      quizTitle: att.quizId?.title || 'Quiz Attempt',
      courseCode: att.courseId?.code || 'N/A',
      studentName: att.studentId?.name || 'N/A',
      attemptNumber: att.attemptNumber || 1,
      score: att.score || 0,
      maxScore: att.maxScore || 100,
      percentage: `${att.percentage || 0}%`,
      status: att.passed ? 'Passed' : 'Needs Improvement',
      attemptDate: att.createdAt ? new Date(att.createdAt).toLocaleString() : 'N/A'
    };
  });

  const avgPct = attempts.length > 0 ? Math.round(totalScore / attempts.length) : 0;

  return {
    reportType: 'QUIZ_PERFORMANCE',
    title: 'Quiz Assessment & Attempt Log Report',
    generatedAt: new Date(),
    totalRecords: reportRows.length,
    summary: [
      { label: 'Total Attempts', value: reportRows.length },
      { label: 'Average Score', value: `${avgPct}%` },
      { label: 'Pass Rate', value: attempts.length > 0 ? `${Math.round((passedCount / attempts.length) * 100)}%` : '0%' }
    ],
    columns: [
      { key: 'quizTitle', label: 'Quiz Title' },
      { key: 'courseCode', label: 'Course' },
      { key: 'studentName', label: 'Student' },
      { key: 'attemptNumber', label: 'Attempt #' },
      { key: 'score', label: 'Score' },
      { key: 'maxScore', label: 'Max Marks' },
      { key: 'percentage', label: 'Percentage' },
      { key: 'status', label: 'Result Status' },
      { key: 'attemptDate', label: 'Attempt Date' }
    ],
    rows: reportRows
  };
};

/**
 * 6. COURSE ENROLLMENT & COMPLETION REPORT
 */
const generateEnrollmentReport = async (filters = {}, currentUser) => {
  const courseIds = await getAuthorizedCourseIds(currentUser, filters.courseId);
  const dateFilter = buildDateFilter(filters.timeframe, filters.startDate, filters.endDate, 'createdAt');

  const enrollmentQuery = { course: { $in: courseIds }, ...dateFilter };
  if (filters.status && filters.status !== 'All') {
    enrollmentQuery.status = filters.status;
  }

  const enrollments = await Enrollment.find(enrollmentQuery)
    .populate('student', 'name email')
    .populate('course', 'title code instructor')
    .sort({ createdAt: -1 })
    .lean();

  let completedCount = 0;
  let activeCount = 0;

  const reportRows = enrollments.map((en) => {
    if (en.status === 'Completed') completedCount++;
    if (en.status === 'Active') activeCount++;

    return {
      studentName: en.student?.name || 'N/A',
      studentEmail: en.student?.email || 'N/A',
      courseCode: en.course?.code || 'N/A',
      courseTitle: en.course?.title || 'N/A',
      enrollmentDate: en.createdAt ? new Date(en.createdAt).toLocaleDateString() : 'N/A',
      progress: `${en.progress || 0}%`,
      status: en.status || 'Active',
      lastUpdated: en.updatedAt ? new Date(en.updatedAt).toLocaleDateString() : 'N/A'
    };
  });

  return {
    reportType: 'ENROLLMENT_COMPLETION',
    title: 'Course Enrollment & Completion Report',
    generatedAt: new Date(),
    totalRecords: reportRows.length,
    summary: [
      { label: 'Total Enrolled', value: reportRows.length },
      { label: 'Active Learners', value: activeCount },
      { label: 'Completed Cohort', value: completedCount }
    ],
    columns: [
      { key: 'studentName', label: 'Student Name' },
      { key: 'studentEmail', label: 'Email' },
      { key: 'courseCode', label: 'Course Code' },
      { key: 'courseTitle', label: 'Course Title' },
      { key: 'enrollmentDate', label: 'Enrolled Date' },
      { key: 'progress', label: 'Syllabus Progress' },
      { key: 'status', label: 'Enrollment Status' },
      { key: 'lastUpdated', label: 'Last Updated' }
    ],
    rows: reportRows
  };
};

/**
 * 7. OVERALL ACADEMIC SUMMARY (Admin-level overview)
 */
const generateAcademicSummaryReport = async (filters = {}, currentUser) => {
  const adminAnalytics = await analyticsService.getAdminSystemAnalytics(filters.timeframe || '30d');

  const reportRows = adminAnalytics.courseComparisons.map((c) => ({
    courseCode: c.code,
    courseTitle: c.title,
    instructor: c.instructor,
    enrolledStudents: c.enrolledStudents,
    avgProgress: `${c.avgCourseProgress}%`,
    avgQuizScore: `${c.avgQuizScore}%`,
    avgAssignmentScore: `${c.avgAssignmentScore}%`,
    avgPredictedGrade: `${c.avgPredictedScore}%`,
    atRiskStudents: c.atRiskCount
  }));

  return {
    reportType: 'ACADEMIC_SUMMARY',
    title: 'Institutional Academic Executive Summary',
    generatedAt: new Date(),
    totalRecords: reportRows.length,
    summary: [
      { label: 'Total Users', value: adminAnalytics.totals.totalUsers },
      { label: 'Total Courses', value: adminAnalytics.totals.totalCourses },
      { label: 'System Completion', value: `${adminAnalytics.totals.systemCompletionRate}%` },
      { label: 'High Risk Learners', value: adminAnalytics.riskBreakdown.high }
    ],
    insights: adminAnalytics.insights,
    columns: [
      { key: 'courseCode', label: 'Code' },
      { key: 'courseTitle', label: 'Course' },
      { key: 'instructor', label: 'Faculty' },
      { key: 'enrolledStudents', label: 'Students' },
      { key: 'avgProgress', label: 'Progress' },
      { key: 'avgQuizScore', label: 'Quiz Avg' },
      { key: 'avgAssignmentScore', label: 'Assignment Avg' },
      { key: 'avgPredictedGrade', label: 'Predicted Grade' },
      { key: 'atRiskStudents', label: 'At-Risk Count' }
    ],
    rows: reportRows
  };
};

const REPORT_CATALOG = [
  {
    id: 'STUDENT_PERFORMANCE',
    title: 'Student Academic Performance',
    description: 'Comprehensive evaluation of student course progress, quiz averages, assignment scores, and Module 9 predicted grades.',
    category: 'Academic',
    allowedRoles: ['Admin', 'Faculty']
  },
  {
    id: 'COURSE_PERFORMANCE',
    title: 'Course Cohort Performance',
    description: 'Course-level summaries of enrollment size, syllabus progress, assessment averages, and at-risk distribution.',
    category: 'Academic',
    allowedRoles: ['Admin', 'Faculty']
  },
  {
    id: 'AT_RISK_STUDENTS',
    title: 'At-Risk Student Early Warning',
    description: 'Actionable monitoring report identifying students needing academic intervention based on Module 9 ML risk features.',
    category: 'Intervention',
    allowedRoles: ['Admin', 'Faculty']
  },
  {
    id: 'ASSIGNMENT_SUBMISSIONS',
    title: 'Assignment Submissions & Grading',
    description: 'Audit log of student homework submissions, submission timestamps, late status, and instructor grading marks.',
    category: 'Assessment',
    allowedRoles: ['Admin', 'Faculty']
  },
  {
    id: 'QUIZ_PERFORMANCE',
    title: 'Quiz Assessment & Attempts Log',
    description: 'Granular log of student online quiz attempts, raw scores, earned percentages, and pass/fail thresholds.',
    category: 'Assessment',
    allowedRoles: ['Admin', 'Faculty']
  },
  {
    id: 'ENROLLMENT_COMPLETION',
    title: 'Course Enrollment & Completion',
    description: 'Tracking cohort registration dates, active vs completed statuses, and syllabus completion timestamps.',
    category: 'Administration',
    allowedRoles: ['Admin', 'Faculty']
  },
  {
    id: 'ACADEMIC_SUMMARY',
    title: 'Institutional Academic Executive Summary',
    description: 'Platform-wide executive overview with total user demographics, system completion rates, and cross-course comparisons.',
    category: 'Executive',
    allowedRoles: ['Admin']
  }
];

/**
 * Get catalog of available reports for user role
 */
const getReportCatalog = (currentUser) => {
  if (!currentUser) return REPORT_CATALOG;
  return REPORT_CATALOG.filter(r => r.allowedRoles.includes(currentUser.role));
};

/**
 * Master report generator dispatcher
 */
const generateReport = async (reportType, filters = {}, currentUser) => {
  let result;
  switch (reportType) {
    case 'STUDENT_PERFORMANCE':
      result = await generateStudentPerformanceReport(filters, currentUser);
      break;
    case 'COURSE_PERFORMANCE':
      result = await generateCoursePerformanceReport(filters, currentUser);
      break;
    case 'AT_RISK_STUDENTS':
    case 'AT_RISK_SUMMARY':
      result = await generateAtRiskReport(filters, currentUser);
      break;
    case 'ASSIGNMENT_SUBMISSIONS':
      result = await generateAssignmentReport(filters, currentUser);
      break;
    case 'QUIZ_PERFORMANCE':
      result = await generateQuizReport(filters, currentUser);
      break;
    case 'ENROLLMENT_COMPLETION':
      result = await generateEnrollmentReport(filters, currentUser);
      break;
    case 'ACADEMIC_SUMMARY':
      result = await generateAcademicSummaryReport(filters, currentUser);
      break;
    default: {
      const err = new Error(`Unsupported report type: ${reportType}`);
      err.statusCode = 400;
      throw err;
    }
  }

  // Attach standardized metadata
  result.metadata = {
    reportType: result.reportType,
    reportTitle: result.title,
    generatedAt: result.generatedAt || new Date(),
    totalRecords: result.rows ? result.rows.length : 0,
    filters: filters || {},
    generatedBy: currentUser ? {
      id: currentUser._id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role
    } : null
  };

  return result;
};

/**
 * Convert report data to CSV string format
 */
const convertReportToCsv = (reportData) => {
  if (!reportData || !reportData.columns || !reportData.rows) return '';

  const headerMeta = [
    `# AI-LMS Structured Academic Report: ${reportData.metadata?.reportTitle || reportData.metadata?.reportType || 'Academic Report'}`,
    `# Generated At: ${reportData.metadata?.generatedAt || new Date().toISOString()}`,
    `# Generated By: ${reportData.metadata?.generatedBy?.name || 'Authorized User'}`
  ].join('\n');

  const headers = reportData.columns.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',');
  const rowLines = reportData.rows.map(row => {
    return reportData.columns.map(col => {
      const val = row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '';
      return `"${val.replace(/"/g, '""')}"`;
    }).join(',');
  });

  return `${headerMeta}\n\n${headers}\n${rowLines.join('\n')}`;
};

module.exports = {
  getReportCatalog,
  generateReport,
  convertReportToCsv,
  generateStudentPerformanceReport,
  generateCoursePerformanceReport,
  generateAtRiskReport,
  generateAssignmentReport,
  generateQuizReport,
  generateEnrollmentReport,
  generateAcademicSummaryReport
};

const analyticsService = require('../services/analytics.service');
const Enrollment = require('../models/enrollment.model');
const Course = require('../models/course.model');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get performance prediction and ML risk features for a student in a course
 * GET /api/analytics/student-performance?courseId=xxx&studentId=yyy
 */
const getStudentPerformance = async (req, res, next) => {
  try {
    const { courseId } = req.query;
    let studentId = req.query.studentId;

    if (req.user.role === 'Student') {
      studentId = req.user._id.toString();
    } else if (!studentId) {
      return errorResponse(res, 'Student ID parameter is required for Faculty/Admin view', 400);
    }

    if (!courseId) {
      const enrollment = await Enrollment.findOne({ student: studentId, status: 'Active' });
      if (!enrollment) {
        return errorResponse(res, 'No active course enrollments found for this student', 404);
      }
      const perf = await analyticsService.calculateStudentPerformance(studentId, enrollment.course);
      return successResponse(res, 'Student performance analytics retrieved successfully', perf);
    }

    const performance = await analyticsService.calculateStudentPerformance(studentId, courseId);
    if (!performance) {
      return errorResponse(res, 'Student is not enrolled in this course', 404);
    }

    return successResponse(res, 'Student performance analytics retrieved successfully', performance);
  } catch (error) {
    next(error);
  }
};

/**
 * Get course performance & risk aggregation summary
 * GET /api/analytics/course-summary/:courseId
 */
const getCourseAnalytics = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const analytics = await analyticsService.getCourseAnalyticsSummary(courseId);
    return successResponse(res, 'Course analytics summary retrieved successfully', analytics);
  } catch (error) {
    next(error);
  }
};

/**
 * Get list of at-risk students (Faculty & Admin scope)
 * GET /api/analytics/at-risk-students?courseId=xxx&riskLevel=High
 */
const getAtRiskStudents = async (req, res, next) => {
  try {
    const filters = {
      courseId: req.query.courseId,
      riskLevel: req.query.riskLevel || 'All'
    };

    const atRiskData = await analyticsService.getAtRiskStudentsList(filters, req.user);
    return successResponse(res, 'At-risk students list retrieved successfully', atRiskData);
  } catch (error) {
    next(error);
  }
};

/**
 * Get general analytics metrics for user role dashboard
 * GET /api/analytics/dashboard-metrics
 */
const getDashboardAnalytics = async (req, res, next) => {
  try {
    if (req.user.role === 'Student') {
      const enrollments = await Enrollment.find({ student: req.user._id, status: 'Active' });
      const performances = [];

      for (const en of enrollments) {
        const p = await analyticsService.calculateStudentPerformance(req.user._id, en.course);
        if (p) performances.push(p);
      }

      let sumScore = 0;
      let atRiskCoursesCount = 0;
      performances.forEach(p => {
        sumScore += p.prediction.predictedScore;
        if (p.prediction.riskLevel === 'High' || p.prediction.riskLevel === 'Medium') {
          atRiskCoursesCount++;
        }
      });

      const avgPredictedScore = performances.length > 0 ? Math.round(sumScore / performances.length) : 0;

      return successResponse(res, 'Student dashboard analytics retrieved', {
        avgPredictedScore,
        enrolledCoursesCount: performances.length,
        atRiskCoursesCount,
        coursePerformances: performances
      });
    } else {
      const atRiskData = await analyticsService.getAtRiskStudentsList({}, req.user);
      return successResponse(res, 'Faculty/Admin analytics overview retrieved', {
        totalAtRiskStudents: atRiskData.totalCount,
        highRiskCount: atRiskData.highRiskCount,
        mediumRiskCount: atRiskData.mediumRiskCount,
        recentAtRisk: atRiskData.students.slice(0, 5)
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * MODULE 10: Detailed Student Analytics (Student View)
 * GET /api/analytics/student/detailed?timeframe=30d
 */
const getStudentDetailedAnalytics = async (req, res, next) => {
  try {
    let studentId = req.user._id.toString();
    if (req.user.role !== 'Student' && req.query.studentId) {
      studentId = req.query.studentId;
    }
    const timeframe = req.query.timeframe || '30d';

    const analytics = await analyticsService.getStudentDetailedAnalytics(studentId, timeframe);
    return successResponse(res, 'Student detailed analytics retrieved successfully', analytics);
  } catch (error) {
    next(error);
  }
};

/**
 * MODULE 10: Detailed Course Analytics & Item Analysis (Faculty View)
 * GET /api/analytics/course/:courseId/detailed?timeframe=30d
 */
const getCourseDetailedAnalytics = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const timeframe = req.query.timeframe || '30d';

    // Faculty access check
    if (req.user.role === 'Faculty') {
      const course = await Course.findById(courseId);
      if (!course || (course.instructor?.toString() !== req.user._id.toString() && course.createdBy?.toString() !== req.user._id.toString())) {
        return errorResponse(res, 'You are not authorized to view analytics for this course', 403);
      }
    }

    const analytics = await analyticsService.getCourseDetailedAnalytics(courseId, timeframe);
    return successResponse(res, 'Course detailed analytics retrieved successfully', analytics);
  } catch (error) {
    next(error);
  }
};

/**
 * MODULE 10: Admin System Overview Analytics (Admin View)
 * GET /api/analytics/admin/overview?timeframe=30d
 */
const getAdminSystemAnalytics = async (req, res, next) => {
  try {
    const timeframe = req.query.timeframe || '30d';
    const analytics = await analyticsService.getAdminSystemAnalytics(timeframe);
    return successResponse(res, 'Admin system analytics retrieved successfully', analytics);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentPerformance,
  getCourseAnalytics,
  getAtRiskStudents,
  getDashboardAnalytics,
  getStudentDetailedAnalytics,
  getCourseDetailedAnalytics,
  getAdminSystemAnalytics
};

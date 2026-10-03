const express = require('express');
const router = express.Router();
const {
  getStudentPerformance,
  getCourseAnalytics,
  getAtRiskStudents,
  getDashboardAnalytics,
  getStudentDetailedAnalytics,
  getCourseDetailedAnalytics,
  getAdminSystemAnalytics
} = require('../controllers/analytics.controller');

const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const {
  validateCourseAnalytics,
  validateAtRiskStudents
} = require('../validators/analytics.validator');

// Student & General User Routes
router.get('/student-performance', protect, getStudentPerformance);
router.get('/dashboard-metrics', protect, getDashboardAnalytics);
router.get('/student/detailed', protect, getStudentDetailedAnalytics);

// Faculty & Admin Course Analytics Routes
router.get(
  '/course-summary/:courseId',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateCourseAnalytics,
  getCourseAnalytics
);

router.get(
  '/course/:courseId/detailed',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateCourseAnalytics,
  getCourseDetailedAnalytics
);

router.get(
  '/at-risk-students',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateAtRiskStudents,
  getAtRiskStudents
);

// Admin-Only System Overview Analytics Route
router.get(
  '/admin/overview',
  protect,
  authorizeRoles('Admin'),
  getAdminSystemAnalytics
);

module.exports = router;

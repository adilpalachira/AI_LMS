const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const {
  validateCreateCourse,
  validateUpdateCourse,
  validateIdParam
} = require('../validators/course.validator');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { uploadCourseThumbnail } = require('../middlewares/courseUpload.middleware');

// Public & Student discovery routes
router.get('/', protect, courseController.getCourses);
router.get('/my-enrollments', protect, authorizeRoles('Student'), courseController.getMyEnrolledCourses);
router.get('/my-courses', protect, authorizeRoles('Admin', 'Faculty'), courseController.getMyTaughtCourses);
router.get('/:id', protect, courseController.getCourseById);

// Student enrollment actions
router.post('/:id/enroll', protect, authorizeRoles('Student'), validateIdParam, courseController.enrollStudent);
router.delete('/:id/enroll', protect, authorizeRoles('Student'), validateIdParam, courseController.unenrollStudent);

// Faculty & Admin Course Management routes
router.post(
  '/',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  uploadCourseThumbnail,
  validateCreateCourse,
  courseController.createCourse
);

router.put(
  '/:id',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  uploadCourseThumbnail,
  validateUpdateCourse,
  courseController.updateCourse
);

router.patch(
  '/:id/publish',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateIdParam,
  courseController.publishCourse
);

router.patch(
  '/:id/archive',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateIdParam,
  courseController.archiveCourse
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateIdParam,
  courseController.deleteCourse
);

router.get(
  '/:id/students',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateIdParam,
  courseController.getCourseStudents
);

module.exports = router;

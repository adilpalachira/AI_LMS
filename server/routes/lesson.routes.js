const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lesson.controller');
const {
  validateCreateLesson,
  validateUpdateLesson,
  validateIdParam
} = require('../validators/lesson.validator');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// Public / Authenticated discovery routes
router.get('/', protect, lessonController.getLessonsBySection);
router.get('/:id', protect, validateIdParam, lessonController.getLessonById);

// Admin & Faculty management routes
router.post(
  '/',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateCreateLesson,
  lessonController.createLesson
);

router.put(
  '/:id',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateUpdateLesson,
  lessonController.updateLesson
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateIdParam,
  lessonController.deleteLesson
);

module.exports = router;

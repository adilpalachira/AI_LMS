const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');
const {
  validateCreateQuiz,
  validateUpdateQuiz,
  validateIdParam
} = require('../validators/quiz.validator');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

router.get('/', protect, quizController.getQuizzes);
router.get('/:id', protect, validateIdParam, quizController.getQuizById);
router.get('/:id/attempts', protect, validateIdParam, quizController.getQuizAttempts);

// Student quiz attempt route
router.post(
  '/:id/attempt',
  protect,
  authorizeRoles('Student'),
  validateIdParam,
  quizController.submitQuizAttempt
);

// Faculty & Admin quiz management routes
router.post(
  '/',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateCreateQuiz,
  quizController.createQuiz
);

router.put(
  '/:id',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateUpdateQuiz,
  quizController.updateQuiz
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateIdParam,
  quizController.deleteQuiz
);

module.exports = router;

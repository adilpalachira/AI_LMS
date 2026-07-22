const express = require('express');
const router = express.Router();
const aiQuizController = require('../controllers/aiQuiz.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// Generate questions using AI
router.post(
  '/generate',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  aiQuizController.generateQuiz
);

// Get AI generation history logs
router.get(
  '/generation-history',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  aiQuizController.getGenerationHistory
);

// Bulk save approved AI generated questions
router.post(
  '/bulk-save',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  aiQuizController.bulkSaveQuestions
);

module.exports = router;

const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learning.controller');
const { protect, authorizeRoles } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(protect);

// Student learning profile & preferences
router.get('/profile', learningController.getLearningProfile);
router.put('/profile', learningController.updateLearningProfile);

// Adaptive performance analysis & weak topic detection
router.post('/analyze', learningController.analyzePerformance);

// Active recommendations
router.get('/recommendations', learningController.getRecommendations);

// Personalized learning path for a course
router.get('/path/:courseId', learningController.getLearningPath);

module.exports = router;

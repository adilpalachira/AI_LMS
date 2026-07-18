const express = require('express');
const router = express.Router();
const aiTutorController = require('../controllers/aiTutor.controller');
const { protect } = require('../middlewares/auth.middleware');

// Ask question / execute RAG query
router.post('/chat', protect, aiTutorController.askQuestion);

// Create new chat session
router.post('/sessions', protect, aiTutorController.createSession);

// Get user chat sessions
router.get('/sessions', protect, aiTutorController.getSessions);

// Get session message history
router.get('/sessions/:id', protect, aiTutorController.getSessionById);

// Delete chat session
router.delete('/sessions/:id', protect, aiTutorController.deleteSession);

module.exports = router;

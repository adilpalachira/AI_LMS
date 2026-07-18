const tutorService = require('../services/ai/tutor.service');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Controller for AI Tutor Student & Course Assistant operations
 */

/**
 * Create a new chat session
 * POST /api/ai/tutor/sessions
 */
const createSession = async (req, res) => {
  try {
    const { courseId, title } = req.body;
    if (!courseId) {
      return errorResponse(res, 'Course ID is required', 400);
    }

    const session = await tutorService.createChatSession(courseId, req.user, title);
    return successResponse(res, 'Chat session created successfully', session, 201);
  } catch (error) {
    return errorResponse(res, error.message, error.message.includes('Access denied') ? 403 : 500);
  }
};

/**
 * Get user chat sessions
 * GET /api/ai/tutor/sessions
 */
const getSessions = async (req, res) => {
  try {
    const { courseId } = req.query;
    const sessions = await tutorService.getUserChatSessions(req.user, courseId);
    return successResponse(res, 'Chat sessions retrieved successfully', sessions);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Get session details with message history
 * GET /api/ai/tutor/sessions/:id
 */
const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await tutorService.getSessionById(id, req.user);
    return successResponse(res, 'Session history retrieved successfully', data);
  } catch (error) {
    return errorResponse(res, error.message, error.message.includes('Unauthorized') ? 403 : 404);
  }
};

/**
 * Ask a question in an AI Tutor chat session
 * POST /api/ai/tutor/chat
 */
const askQuestion = async (req, res) => {
  try {
    const { sessionId, question, courseId } = req.body;
    
    if (!question || !question.trim()) {
      return errorResponse(res, 'Question content is required', 400);
    }

    let activeSessionId = sessionId;

    // If no sessionId provided but courseId is given, auto-create a session
    if (!activeSessionId) {
      if (!courseId) {
        return errorResponse(res, 'Either sessionId or courseId must be provided', 400);
      }
      const newSession = await tutorService.createChatSession(courseId, req.user, question.slice(0, 45));
      activeSessionId = newSession._id;
    }

    const result = await tutorService.askTutorQuestion(activeSessionId, question, req.user);
    return successResponse(res, 'AI response generated successfully', {
      sessionId: activeSessionId,
      ...result
    });
  } catch (error) {
    console.error('[AI Tutor Controller Error]:', error.message);
    const statusCode = error.message.includes('Access denied') || error.message.includes('Unauthorized')
      ? 403
      : (error.message.includes('not found') ? 404 : 500);

    return errorResponse(res, error.message, statusCode);
  }
};

/**
 * Delete a chat session
 * DELETE /api/ai/tutor/sessions/:id
 */
const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await tutorService.deleteChatSession(id, req.user);
    return successResponse(res, result.message, null);
  } catch (error) {
    return errorResponse(res, error.message, error.message.includes('Unauthorized') ? 403 : 404);
  }
};

module.exports = {
  createSession,
  getSessions,
  getSessionById,
  askQuestion,
  deleteSession
};

const quizService = require('../services/quiz.service');
const { successResponse } = require('../utils/response');

const createQuiz = async (req, res, next) => {
  try {
    const quiz = await quizService.createQuiz(req.body, req.user);
    return successResponse(res, 'Quiz created successfully', quiz, 201);
  } catch (error) {
    next(error);
  }
};

const getQuizzes = async (req, res, next) => {
  try {
    const courseId = req.query.courseId || req.params.courseId;
    if (!courseId) {
      return res.status(400).json({ success: false, message: 'courseId is required' });
    }
    const quizzes = await quizService.getQuizzesByCourse(courseId, req.user);
    return successResponse(res, 'Quizzes retrieved successfully', quizzes);
  } catch (error) {
    next(error);
  }
};

const getQuizById = async (req, res, next) => {
  try {
    const quiz = await quizService.getQuizById(req.params.id, req.user);
    return successResponse(res, 'Quiz details retrieved successfully', quiz);
  } catch (error) {
    next(error);
  }
};

const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await quizService.updateQuiz(req.params.id, req.body, req.user);
    return successResponse(res, 'Quiz updated successfully', quiz);
  } catch (error) {
    next(error);
  }
};

const deleteQuiz = async (req, res, next) => {
  try {
    const result = await quizService.deleteQuiz(req.params.id, req.user);
    return successResponse(res, result.message, null);
  } catch (error) {
    next(error);
  }
};

const submitQuizAttempt = async (req, res, next) => {
  try {
    const answers = req.body.answers || {};
    const attempt = await quizService.submitQuizAttempt(req.params.id, answers, req.user);
    return successResponse(res, 'Quiz attempt submitted successfully', attempt, 201);
  } catch (error) {
    next(error);
  }
};

const getQuizAttempts = async (req, res, next) => {
  try {
    const attempts = await quizService.getQuizAttempts(req.params.id, req.user);
    return successResponse(res, 'Quiz attempts retrieved successfully', attempts);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  submitQuizAttempt,
  getQuizAttempts
};

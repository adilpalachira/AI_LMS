const quizGeneratorService = require('../services/ai/quizGenerator.service');
const questionService = require('../services/question.service');
const { successResponse } = require('../utils/response');

/**
 * Generate structured AI questions based on course material RAG context
 */
const generateQuiz = async (req, res, next) => {
  try {
    const {
      courseId,
      lessonId,
      materialId,
      topic,
      questionType,
      difficulty,
      questionCount
    } = req.body;

    const count = parseInt(questionCount, 10) || 5;

    const result = await quizGeneratorService.generateQuestions({
      courseId,
      lessonId,
      materialId,
      topic,
      questionType: questionType || 'MCQ',
      difficulty: difficulty || 'Medium',
      count,
      user: req.user
    });

    return successResponse(res, 'AI questions generated successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get AI generation history logs for faculty/admin
 */
const getGenerationHistory = async (req, res, next) => {
  try {
    const { courseId } = req.query;
    const history = await quizGeneratorService.getGenerationHistory(req.user._id, courseId);
    return successResponse(res, 'Generation history fetched successfully', history);
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk save approved questions from AI Review into Question Bank or Quiz
 */
const bulkSaveQuestions = async (req, res, next) => {
  try {
    const { questions, quizId, courseId, status } = req.body;
    const saved = await questionService.bulkSaveQuestions(
      { questions, quizId, courseId, status },
      req.user
    );
    return successResponse(res, `${saved.length} questions saved successfully`, saved, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateQuiz,
  getGenerationHistory,
  bulkSaveQuestions
};

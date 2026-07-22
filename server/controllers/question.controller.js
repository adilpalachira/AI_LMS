const questionService = require('../services/question.service');
const { successResponse } = require('../utils/response');

const getQuestions = async (req, res, next) => {
  try {
    const questions = await questionService.getQuestionBankQuestions(req.query, req.user);
    return successResponse(res, 'Questions retrieved successfully', questions);
  } catch (error) {
    next(error);
  }
};

const createQuestion = async (req, res, next) => {
  try {
    const question = await questionService.createQuestion(req.body, req.user);
    return successResponse(res, 'Question added successfully', question, 201);
  } catch (error) {
    next(error);
  }
};

const updateQuestion = async (req, res, next) => {
  try {
    const question = await questionService.updateQuestion(req.params.id, req.body, req.user);
    return successResponse(res, 'Question updated successfully', question);
  } catch (error) {
    next(error);
  }
};

const deleteQuestion = async (req, res, next) => {
  try {
    const result = await questionService.deleteQuestion(req.params.id, req.user);
    return successResponse(res, result.message, null);
  } catch (error) {
    next(error);
  }
};

const approveQuestion = async (req, res, next) => {
  try {
    const question = await questionService.approveQuestion(req.params.id, req.user);
    return successResponse(res, 'Question approved successfully', question);
  } catch (error) {
    next(error);
  }
};

const archiveQuestion = async (req, res, next) => {
  try {
    const question = await questionService.archiveQuestion(req.params.id, req.user);
    return successResponse(res, 'Question archived successfully', question);
  } catch (error) {
    next(error);
  }
};

const addQuestionsToQuiz = async (req, res, next) => {
  try {
    const { questionIds } = req.body;
    const added = await questionService.addQuestionsToQuiz(req.params.id, questionIds, req.user);
    return successResponse(res, `${added.length} questions added to quiz successfully`, added, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  approveQuestion,
  archiveQuestion,
  addQuestionsToQuiz
};

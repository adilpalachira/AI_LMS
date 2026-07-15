const questionService = require('../services/question.service');
const { successResponse } = require('../utils/response');

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

module.exports = {
  createQuestion,
  updateQuestion,
  deleteQuestion
};

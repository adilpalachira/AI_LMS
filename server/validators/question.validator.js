const { body, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { errorResponse } = require('../utils/response');

const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    return errorResponse(res, 'Validation failed', 400, errorArray);
  }
  next();
};

const validateCreateQuestion = [
  body('quizId')
    .optional({ nullable: true })
    .custom(val => !val || mongoose.Types.ObjectId.isValid(val) || Promise.reject('Invalid Quiz ID format')),

  body('question')
    .trim()
    .notEmpty()
    .withMessage('Question text is required'),

  body('type')
    .notEmpty()
    .withMessage('Question type is required')
    .isIn(['Multiple Choice', 'MCQ', 'True/False', 'Short Answer', 'Essay', 'Descriptive'])
    .withMessage('Invalid question type'),

  body('correctAnswer')
    .notEmpty()
    .withMessage('Correct answer specification is required'),

  validateResults
];

const validateUpdateQuestion = [
  param('id')
    .custom(val => mongoose.Types.ObjectId.isValid(val) || Promise.reject('Invalid Question ID format')),

  body('question')
    .optional()
    .trim()
    .notEmpty(),

  validateResults
];

const validateIdParam = [
  param('id')
    .custom(val => mongoose.Types.ObjectId.isValid(val) || Promise.reject('Invalid ID format')),
  validateResults
];

module.exports = {
  validateCreateQuestion,
  validateUpdateQuestion,
  validateIdParam
};

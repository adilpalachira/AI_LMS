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

const validateCreateQuiz = [
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .custom(val => mongoose.Types.ObjectId.isValid(val) || Promise.reject('Invalid Course ID format')),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Quiz title is required')
    .isLength({ max: 200 }),

  body('durationMinutes')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 minute'),

  body('passingMarks')
    .optional()
    .isInt({ min: 0 }),

  body('maxAttempts')
    .optional()
    .isInt({ min: 1 }),

  validateResults
];

const validateUpdateQuiz = [
  param('id')
    .custom(val => mongoose.Types.ObjectId.isValid(val) || Promise.reject('Invalid Quiz ID format')),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .isLength({ max: 200 }),

  validateResults
];

const validateIdParam = [
  param('id')
    .custom(val => mongoose.Types.ObjectId.isValid(val) || Promise.reject('Invalid ID format')),
  validateResults
];

module.exports = {
  validateCreateQuiz,
  validateUpdateQuiz,
  validateIdParam
};

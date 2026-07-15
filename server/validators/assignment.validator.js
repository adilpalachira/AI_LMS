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

const validateCreateAssignment = [
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .custom(val => mongoose.Types.ObjectId.isValid(val) || Promise.reject('Invalid Course ID format')),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Assignment title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('maxMarks')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum marks must be a positive integer'),

  body('deadline')
    .notEmpty()
    .withMessage('Deadline is required')
    .isISO8601()
    .withMessage('Invalid deadline date format'),

  body('status')
    .optional()
    .isIn(['Draft', 'Published', 'Archived']),

  validateResults
];

const validateUpdateAssignment = [
  param('id')
    .custom(val => mongoose.Types.ObjectId.isValid(val) || Promise.reject('Invalid Assignment ID format')),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .isLength({ max: 200 }),

  body('maxMarks')
    .optional()
    .isInt({ min: 1 }),

  body('deadline')
    .optional()
    .isISO8601(),

  validateResults
];

const validateIdParam = [
  param('id')
    .custom(val => mongoose.Types.ObjectId.isValid(val) || Promise.reject('Invalid ID format')),
  validateResults
];

module.exports = {
  validateCreateAssignment,
  validateUpdateAssignment,
  validateIdParam
};

const { body, param, query, validationResult } = require('express-validator');
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

const validateCreateSection = [
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .custom((val) => {
      if (!mongoose.Types.ObjectId.isValid(val)) {
        throw new Error('Invalid Course ID format');
      }
      return true;
    }),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Section title is required')
    .isLength({ max: 150 })
    .withMessage('Title cannot exceed 150 characters'),

  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),

  body('description')
    .optional()
    .trim(),

  validateResults
];

const validateUpdateSection = [
  param('id')
    .custom((val) => {
      if (!mongoose.Types.ObjectId.isValid(val)) {
        throw new Error('Invalid Section ID format');
      }
      return true;
    }),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 150 })
    .withMessage('Title cannot exceed 150 characters'),

  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),

  validateResults
];

const validateIdParam = [
  param('id')
    .custom((val) => {
      if (!mongoose.Types.ObjectId.isValid(val)) {
        throw new Error('Invalid ID format');
      }
      return true;
    }),
  validateResults
];

module.exports = {
  validateCreateSection,
  validateUpdateSection,
  validateIdParam
};

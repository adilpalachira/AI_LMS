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

const allowedContentTypes = [
  'PDF',
  'PowerPoint',
  'Word Document',
  'Image',
  'Video',
  'YouTube',
  'External URL',
  'Text Note'
];

const validateCreateLesson = [
  body('sectionId')
    .notEmpty()
    .withMessage('Section ID is required')
    .custom((val) => {
      if (!mongoose.Types.ObjectId.isValid(val)) {
        throw new Error('Invalid Section ID format');
      }
      return true;
    }),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Lesson title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('contentType')
    .notEmpty()
    .withMessage('Content type is required')
    .isIn(allowedContentTypes)
    .withMessage(`Content type must be one of: ${allowedContentTypes.join(', ')}`),

  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),

  body('duration')
    .optional()
    .trim(),

  body('isPreview')
    .optional()
    .isBoolean()
    .withMessage('isPreview must be a boolean value'),

  validateResults
];

const validateUpdateLesson = [
  param('id')
    .custom((val) => {
      if (!mongoose.Types.ObjectId.isValid(val)) {
        throw new Error('Invalid Lesson ID format');
      }
      return true;
    }),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 }),

  body('contentType')
    .optional()
    .isIn(allowedContentTypes)
    .withMessage(`Content type must be one of: ${allowedContentTypes.join(', ')}`),

  body('order')
    .optional()
    .isInt({ min: 0 }),

  body('isPreview')
    .optional()
    .isBoolean(),

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
  validateCreateLesson,
  validateUpdateLesson,
  validateIdParam
};

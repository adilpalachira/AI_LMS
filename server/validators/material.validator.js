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

const validateUploadMaterial = [
  body('lessonId')
    .notEmpty()
    .withMessage('Lesson ID is required')
    .custom((val) => {
      if (!mongoose.Types.ObjectId.isValid(val)) {
        throw new Error('Invalid Lesson ID format');
      }
      return true;
    }),

  validateResults
];

const validateLessonIdParam = [
  param('lessonId')
    .custom((val) => {
      if (!mongoose.Types.ObjectId.isValid(val)) {
        throw new Error('Invalid Lesson ID parameter format');
      }
      return true;
    }),
  validateResults
];

const validateIdParam = [
  param('id')
    .custom((val) => {
      if (!mongoose.Types.ObjectId.isValid(val)) {
        throw new Error('Invalid Material ID format');
      }
      return true;
    }),
  validateResults
];

module.exports = {
  validateUploadMaterial,
  validateLessonIdParam,
  validateIdParam
};

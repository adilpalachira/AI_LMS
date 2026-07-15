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

const validateGradeSubmission = [
  param('id')
    .custom(val => mongoose.Types.ObjectId.isValid(val) || Promise.reject('Invalid Submission ID format')),

  body('marks')
    .notEmpty()
    .withMessage('Marks are required')
    .isFloat({ min: 0 })
    .withMessage('Marks must be a non-negative number'),

  body('feedback')
    .optional()
    .trim(),

  validateResults
];

const validateIdParam = [
  param('id')
    .custom(val => mongoose.Types.ObjectId.isValid(val) || Promise.reject('Invalid ID format')),
  validateResults
];

module.exports = {
  validateGradeSubmission,
  validateIdParam
};

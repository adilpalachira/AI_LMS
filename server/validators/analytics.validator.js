const { query, param, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

/**
 * Middleware to check validator results and return formatted errors
 */
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

const validateCourseAnalytics = [
  param('courseId')
    .optional()
    .isMongoId()
    .withMessage('Invalid Course ID format'),
  validateResults
];

const validateAtRiskStudents = [
  query('courseId')
    .optional()
    .isMongoId()
    .withMessage('Invalid Course ID format'),
  query('riskLevel')
    .optional()
    .isIn(['High', 'Medium', 'Low', 'Unevaluated', 'All'])
    .withMessage('Invalid risk level filter'),
  validateResults
];

module.exports = {
  validateCourseAnalytics,
  validateAtRiskStudents
};

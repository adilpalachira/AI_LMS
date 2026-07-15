const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Course = require('../models/course.model');
const Category = require('../models/category.model');
const User = require('../models/user.model');
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

const validateCreateCourse = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Course title is required')
    .isLength({ min: 3, max: 120 })
    .withMessage('Title must be between 3 and 120 characters'),

  body('code')
    .trim()
    .notEmpty()
    .withMessage('Course code is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Course code must be between 2 and 20 characters')
    .custom(async (code) => {
      const existing = await Course.findOne({ code: code.trim().toUpperCase() });
      if (existing) {
        throw new Error(`Course code '${code.toUpperCase()}' is already in use.`);
      }
    }),

  body('shortDescription')
    .trim()
    .notEmpty()
    .withMessage('Short description is required')
    .isLength({ max: 300 })
    .withMessage('Short description cannot exceed 300 characters'),

  body('fullDescription')
    .trim()
    .notEmpty()
    .withMessage('Full description is required'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .custom(async (catId) => {
      if (!mongoose.Types.ObjectId.isValid(catId)) {
        throw new Error('Invalid Category ID format');
      }
      const category = await Category.findById(catId);
      if (!category) {
        throw new Error('Selected category does not exist');
      }
    }),

  body('level')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Level must be Beginner, Intermediate, or Advanced'),

  body('instructor')
    .optional()
    .custom(async (instId) => {
      if (instId) {
        if (!mongoose.Types.ObjectId.isValid(instId)) {
          throw new Error('Invalid Instructor ID format');
        }
        const user = await User.findById(instId);
        if (!user || !['Faculty', 'Admin'].includes(user.role)) {
          throw new Error('Instructor must be a valid Faculty or Admin user');
        }
      }
    }),

  body('status')
    .optional()
    .isIn(['Draft', 'Published', 'Archived'])
    .withMessage('Status must be Draft, Published, or Archived'),

  validateResults
];

const validateUpdateCourse = [
  param('id')
    .custom((id) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid Course ID format');
      }
      return true;
    }),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 3, max: 120 }),

  body('code')
    .optional()
    .trim()
    .custom(async (code, { req }) => {
      if (code) {
        const existing = await Course.findOne({
          code: code.trim().toUpperCase(),
          _id: { $ne: req.params.id }
        });
        if (existing) {
          throw new Error(`Course code '${code.toUpperCase()}' is already in use by another course.`);
        }
      }
    }),

  body('category')
    .optional()
    .custom(async (catId) => {
      if (catId) {
        if (!mongoose.Types.ObjectId.isValid(catId)) {
          throw new Error('Invalid Category ID format');
        }
        const category = await Category.findById(catId);
        if (!category) {
          throw new Error('Selected category does not exist');
        }
      }
    }),

  body('level')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced']),

  body('status')
    .optional()
    .isIn(['Draft', 'Published', 'Archived']),

  validateResults
];

const validateIdParam = [
  param('id')
    .custom((id) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID parameter format');
      }
      return true;
    }),
  validateResults
];

module.exports = {
  validateCreateCourse,
  validateUpdateCourse,
  validateIdParam
};

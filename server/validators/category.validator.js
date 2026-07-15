const { body, validationResult } = require('express-validator');
const Category = require('../models/category.model');
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

const validateCreateCategory = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .custom(async (name) => {
      const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
      if (existing) {
        throw new Error('A category with this name already exists');
      }
    }),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 250 })
    .withMessage('Description cannot exceed 250 characters'),

  body('icon')
    .optional()
    .trim(),

  validateResults
];

const validateUpdateCategory = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category name cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .custom(async (name, { req }) => {
      if (name) {
        const existing = await Category.findOne({
          name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
          _id: { $ne: req.params.id }
        });
        if (existing) {
          throw new Error('A category with this name already exists');
        }
      }
    }),

  body('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be Active or Inactive'),

  validateResults
];

module.exports = {
  validateCreateCategory,
  validateUpdateCategory
};

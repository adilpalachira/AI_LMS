const { body, validationResult } = require('express-validator');
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

/**
 * Update Profile validation rules
 */
const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
    
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number (E.164 format)'),
    
  validateResults
];

/**
 * Change Password validation rules
 */
const validateChangePassword = [
  body('oldPassword')
    .notEmpty()
    .withMessage('Old password is required'),
    
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .custom((value, { req }) => {
      if (value === req.body.oldPassword) {
        throw new Error('New password cannot be the same as the old password');
      }
      return true;
    }),
    
  validateResults
];

const User = require('../models/user.model');

/**
 * Create User validation rules (Admin action)
 */
const validateCreateUser = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
    
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) {
        throw new Error('Email is already registered');
      }
    }),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
    
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['Admin', 'Faculty', 'Student'])
    .withMessage('Role must be either Admin, Faculty, or Student'),
    
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number (E.164 format)'),
    
  body('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be either Active or Inactive'),
    
  validateResults
];

/**
 * Patch User Status validation rules
 */
const validateUserStatus = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be either Active or Inactive'),
    
  validateResults
];

/**
 * Patch User Role validation rules
 */
const validateUserRole = [
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['Admin', 'Faculty', 'Student'])
    .withMessage('Role must be either Admin, Faculty, or Student'),
    
  validateResults
];

/**
 * Reset User Password validation rules
 */
const validateResetUserPassword = [
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
    
  validateResults
];

module.exports = {
  validateUpdateProfile,
  validateChangePassword,
  validateCreateUser,
  validateUserStatus,
  validateUserRole,
  validateResetUserPassword
};

const { errorResponse } = require('../utils/response');

/**
 * Express centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error to console for developers
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error Details]', err);
  } else {
    console.error(`[Error] ${err.name}: ${err.message}`);
  }

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    return errorResponse(res, message, 404);
  }

  // Mongoose Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value entered: ${field}. Please use another value.`;
    return errorResponse(res, message, 400);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return errorResponse(res, message, 400);
  }

  // JWT Token Invalid
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Not authorized, token failed', 401);
  }

  // JWT Token Expired
  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Not authorized, token expired', 401);
  }

  // Fallback server error
  return errorResponse(
    res,
    error.message || 'Internal Server Error',
    error.statusCode || 500
  );
};

module.exports = errorHandler;

/**
 * Format and send a successful JSON response
 * @param {Object} res - Express response object
 * @param {string} message - Feedback message
 * @param {any} data - Response payload data
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Format and send an error JSON response
 * @param {Object} res - Express response object
 * @param {string} message - Error explanation message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {any} errors - Detailed errors array/object (e.g. validator outputs)
 */
const errorResponse = (res, message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse
};

const { errorResponse } = require('../utils/response');

/**
 * Middleware to restrict route access based on specific roles
 * @param  {...string} roles - Array of authorized roles (e.g. 'Admin', 'Faculty')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'User session not found. Authentication required.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Role (${req.user.role}) is not authorized to access this resource.`,
        403
      );
    }

    next();
  };
};

module.exports = {
  authorizeRoles
};

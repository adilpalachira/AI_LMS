const { verifyAccessToken } = require('../services/jwt.service');
const User = require('../models/user.model');
const { errorResponse } = require('../utils/response');

/**
 * Guard middleware to protect private API endpoints
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Check for token in Authorization Header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Return error if token is missing
  if (!token) {
    return errorResponse(res, 'Not authorized to access this resource, token missing', 401);
  }

  try {
    // 3. Verify token payload
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return errorResponse(res, 'Not authorized, invalid token signature or expired', 401);
    }

    // 4. Find the user in the database
    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 'The user belonging to this token no longer exists', 401);
    }

    // 5. Verify account is active
    if (user.status === 'Inactive') {
      return errorResponse(res, 'Your account is inactive. Please contact the administrator.', 403);
    }

    // 6. Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 'Authentication failed', 401);
  }
};

module.exports = {
  protect
};

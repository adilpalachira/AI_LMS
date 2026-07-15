const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_ai_lms_2026';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '2h';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_jwt_refresh_key_for_ai_lms_2026';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';

/**
 * Generate an Access Token
 * @param {Object} payload - Data to embed in token (id, role)
 * @returns {string} Signed JWT Token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

/**
 * Generate a Refresh Token
 * @param {Object} payload - Data to embed in token (id)
 * @returns {string} Signed Refresh Token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRE });
};

/**
 * Verify an Access Token
 * @param {string} token - JWT Access Token
 * @returns {Object|null} Decoded payload or null if invalid
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Verify a Refresh Token
 * @param {string} token - JWT Refresh Token
 * @returns {Object|null} Decoded payload or null if invalid
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};

const crypto = require('crypto');
const User = require('../models/user.model');
const { hashPassword, comparePassword } = require('../services/password.service');
const { generateAccessToken, generateRefreshToken } = require('../services/jwt.service');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [Admin, Faculty, Student]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation failed or email exists
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Reject self-registration for Admin or Faculty
    if (role && role !== 'Student') {
      return errorResponse(res, 'Public registration is restricted to Students only. Admin and Faculty accounts must be created by an Administrator.', 400);
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create user (strictly as Student)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      role: 'Student',
      status: 'Active'
    });

    // Remove password from output object
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profileImage: user.profileImage,
      status: user.status,
      createdAt: user.createdAt
    };

    // Generate tokens
    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    return successResponse(res, 'Registration successful', {
      user: userResponse,
      accessToken,
      refreshToken
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly select password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Check account status
    if (user.status === 'Inactive') {
      return errorResponse(res, 'Your account is inactive. Please contact the administrator.', 403);
    }

    // Match password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Update lastLogin timestamp in database
    user.lastLogin = Date.now();
    await user.save();

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profileImage: user.profileImage,
      status: user.status,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };

    // Generate tokens
    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    return successResponse(res, 'Login successful', {
      user: userResponse,
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout current user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 */
const logout = async (req, res, next) => {
  try {
    // Statistically clear token on client side. For server cookies, we could clear cookies here.
    return successResponse(res, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset link
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset email token generated
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return errorResponse(res, 'No user found with that email address', 404);
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set expiry
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    await user.save();

    // In a real application, we would send an email with this URL:
    // `http://localhost:5173/reset-password/${resetToken}`
    // Since we are developing locally, we will return the resetToken in the response 
    // to facilitate testing and mock execution without needing an SMTP configuration.
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

    return successResponse(res, 'Password reset token generated. Use the link or token to reset.', {
      resetToken,
      resetUrl
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset user password using token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Hash token to compare with DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid token and not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return errorResponse(res, 'Invalid or expired password reset token', 400);
    }

    // Update password (hash it first)
    user.password = await hashPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return successResponse(res, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword
};

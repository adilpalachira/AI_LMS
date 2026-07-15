const User = require('../models/user.model');
const userService = require('../services/user.service');
const { hashPassword, comparePassword } = require('../services/password.service');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Retrieve profile of logged in user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    return successResponse(res, 'Profile retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update profile of logged in user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    if (req.file) {
      user.profileImage = req.file.path;
    }

    await user.save();
    return successResponse(res, 'Profile updated successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Password updated successfully
 */
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid current password', 400);
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    return successResponse(res, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN USER MANAGEMENT ENDPOINTS
// ==========================================

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with filtering, sorting, pagination (Admin only)
 *     tags: [Admin User Management]
 *     security:
 *       - bearerAuth: []
 */
const getUsers = async (req, res, next) => {
  try {
    const result = await userService.queryUsers(req.query);
    return successResponse(res, 'Users retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user details by ID (Admin only)
 *     tags: [Admin User Management]
 *     security:
 *       - bearerAuth: []
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return successResponse(res, 'User details retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Admin User Management]
 *     security:
 *       - bearerAuth: []
 */
const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    return successResponse(res, 'User created successfully', user, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user details by ID (Admin only)
 *     tags: [Admin User Management]
 *     security:
 *       - bearerAuth: []
 */
const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    return successResponse(res, 'User updated successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user by ID (Admin only)
 *     tags: [Admin User Management]
 *     security:
 *       - bearerAuth: []
 */
const deleteUser = async (req, res, next) => {
  try {
    const result = await userService.deleteUser(req.params.id, req.user.id);
    return successResponse(res, result.message, null);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Update user account activation status (Admin only)
 *     tags: [Admin User Management]
 *     security:
 *       - bearerAuth: []
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const user = await userService.updateStatus(req.params.id, status, req.user.id);
    return successResponse(res, `User status updated to '${status}' successfully`, user);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Update user role (Admin only)
 *     tags: [Admin User Management]
 *     security:
 *       - bearerAuth: []
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await userService.updateRole(req.params.id, role, req.user.id);
    return successResponse(res, `User role updated to '${role}' successfully`, user);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}/reset-password:
 *   patch:
 *     summary: Reset user password (Admin only)
 *     tags: [Admin User Management]
 *     security:
 *       - bearerAuth: []
 */
const resetUserPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const result = await userService.resetPassword(req.params.id, password);
    return successResponse(res, result.message, null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  updateUserRole,
  resetUserPassword
};

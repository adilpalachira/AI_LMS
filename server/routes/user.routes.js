const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { uploadProfileImage } = require('../middlewares/upload.middleware');
const {
  validateUpdateProfile,
  validateChangePassword,
  validateCreateUser,
  validateUserStatus,
  validateUserRole,
  validateResetUserPassword
} = require('../validators/user.validator');

// Standard user profile routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, uploadProfileImage, validateUpdateProfile, updateProfile);
router.put('/change-password', protect, validateChangePassword, changePassword);

// Administrative User Management routes (Admin only)
router.get('/', protect, authorizeRoles('Admin'), getUsers);
router.get('/:id', protect, authorizeRoles('Admin'), getUserById);
router.post('/', protect, authorizeRoles('Admin'), validateCreateUser, createUser);
router.put('/:id', protect, authorizeRoles('Admin'), validateUpdateProfile, updateUser);
router.delete('/:id', protect, authorizeRoles('Admin'), deleteUser);
router.patch('/:id/status', protect, authorizeRoles('Admin'), validateUserStatus, updateUserStatus);
router.patch('/:id/role', protect, authorizeRoles('Admin'), validateUserRole, updateUserRole);
router.patch('/:id/reset-password', protect, authorizeRoles('Admin'), validateResetUserPassword, resetUserPassword);

module.exports = router;

const User = require('../models/user.model');
const { hashPassword } = require('./password.service');

/**
 * Query users with search, filters, pagination and sorting
 */
const queryUsers = async (queryParams) => {
  const { search, role, status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = queryParams;

  // 1. Build Query Filters
  const query = {};

  // Case-insensitive search on name, email, or phone
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  // Filter by role
  if (role && role !== 'All') {
    query.role = role;
  }

  // Filter by status
  if (status && status !== 'All') {
    query.status = status;
  }

  // 2. Pagination Calculations
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  // 3. Sorting Options
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // 4. Run Queries
  const users = await User.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  const totalUsers = await User.countDocuments(query);

  return {
    users,
    pagination: {
      totalUsers,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
      limit: limitNum
    }
  };
};

/**
 * Fetch a single user by ID
 */
const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

/**
 * Create a new user (hashes password and saves)
 */
const createUser = async (userData) => {
  const { name, email, password, role, phone, status } = userData;

  // Double check email uniqueness
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email is already registered');
  }

  // Hash the password
  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    phone: phone || '',
    status: status || 'Active',
    isVerified: true // Admins create already-verified users
  });

  // Exclude password from output
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

/**
 * Update an existing user's information
 */
const updateUser = async (id, updateData) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error('User not found');
  }

  const { name, email, phone } = updateData;

  // If email changes, make sure it is not taken by another user
  if (email && email.toLowerCase() !== user.email) {
    const emailTaken = await User.findOne({ email: email.toLowerCase() });
    if (emailTaken) {
      throw new Error('Email is already in use by another user');
    }
    user.email = email.toLowerCase();
  }

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;

  await user.save();
  return user;
};

/**
 * Delete a user (preventing self-deletion)
 */
const deleteUser = async (id, adminId) => {
  if (id === adminId.toString()) {
    throw new Error('Admins cannot delete their own account');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new Error('User not found');
  }

  await User.findByIdAndDelete(id);
  return { success: true, message: 'User deleted successfully' };
};

/**
 * Update user status (preventing self-deactivation)
 */
const updateStatus = async (id, status, adminId) => {
  if (id === adminId.toString() && status === 'Inactive') {
    throw new Error('Admins cannot deactivate their own account');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new Error('User not found');
  }

  user.status = status;
  await user.save();
  return user;
};

/**
 * Update user role (logging changes)
 */
const updateRole = async (id, role, adminId) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error('User not found');
  }

  const oldRole = user.role;
  user.role = role;
  await user.save();

  // Log the role change as required by the business rules
  console.log(`[Admin Activity Log] User ID: ${id} | Role updated from '${oldRole}' to '${role}' by Admin ID: ${adminId}`);

  return user;
};

/**
 * Reset user password (hashes and updates)
 */
const resetPassword = async (id, newPassword) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error('User not found');
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;
  
  await user.save();
  return { success: true, message: 'Password reset successfully' };
};

module.exports = {
  queryUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateStatus,
  updateRole,
  resetPassword
};

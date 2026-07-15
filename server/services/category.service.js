const Category = require('../models/category.model');
const Course = require('../models/course.model');

/**
 * Fetch all categories with optional status filter
 */
const getCategories = async (queryStatus) => {
  const query = {};
  if (queryStatus) {
    query.status = queryStatus;
  }
  return await Category.find(query).sort({ name: 1 });
};

/**
 * Fetch category by ID
 */
const getCategoryById = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new Error('Category not found');
  }
  return category;
};

/**
 * Create a new category
 */
const createCategory = async (categoryData, userId) => {
  return await Category.create({
    ...categoryData,
    createdBy: userId
  });
};

/**
 * Update an existing category
 */
const updateCategory = async (id, updateData) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new Error('Category not found');
  }

  if (updateData.name) category.name = updateData.name;
  if (updateData.description !== undefined) category.description = updateData.description;
  if (updateData.icon) category.icon = updateData.icon;
  if (updateData.status) category.status = updateData.status;

  await category.save();
  return category;
};

/**
 * Delete a category (checks if any course references it)
 */
const deleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new Error('Category not found');
  }

  // Check if courses exist under this category
  const courseCount = await Course.countDocuments({ category: id });
  if (courseCount > 0) {
    throw new Error(`Cannot delete category. There are ${courseCount} course(s) assigned to it.`);
  }

  await Category.findByIdAndDelete(id);
  return { success: true, message: 'Category deleted successfully' };
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};

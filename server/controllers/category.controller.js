const categoryService = require('../services/category.service');
const { successResponse } = require('../utils/response');

const getCategories = async (req, res, next) => {
  try {
    const { status } = req.query;
    const categories = await categoryService.getCategories(status);
    return successResponse(res, 'Categories retrieved successfully', categories);
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    return successResponse(res, 'Category details retrieved successfully', category);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body, req.user._id);
    return successResponse(res, 'Category created successfully', category, 201);
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    return successResponse(res, 'Category updated successfully', category);
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id);
    return successResponse(res, result.message, null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};

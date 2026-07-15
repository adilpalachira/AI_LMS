const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { validateCreateCategory, validateUpdateCategory } = require('../validators/category.validator');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// Public / Authenticated route to view active categories
router.get('/', protect, categoryController.getCategories);
router.get('/:id', protect, categoryController.getCategoryById);

// Admin-only routes
router.post('/', protect, authorizeRoles('Admin'), validateCreateCategory, categoryController.createCategory);
router.put('/:id', protect, authorizeRoles('Admin'), validateUpdateCategory, categoryController.updateCategory);
router.delete('/:id', protect, authorizeRoles('Admin'), categoryController.deleteCategory);

module.exports = router;

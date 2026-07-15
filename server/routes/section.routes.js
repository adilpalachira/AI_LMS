const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/section.controller');
const {
  validateCreateSection,
  validateUpdateSection,
  validateIdParam
} = require('../validators/section.validator');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// Public / Authenticated route to get sections by course
router.get('/', protect, sectionController.getSectionsByCourse);

// Admin & Faculty content creation & management routes
router.post(
  '/',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateCreateSection,
  sectionController.createSection
);

router.put(
  '/:id',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateUpdateSection,
  sectionController.updateSection
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateIdParam,
  sectionController.deleteSection
);

module.exports = router;

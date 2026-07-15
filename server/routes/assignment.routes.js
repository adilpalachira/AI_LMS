const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');
const {
  validateCreateAssignment,
  validateUpdateAssignment,
  validateIdParam
} = require('../validators/assignment.validator');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

router.get('/', protect, assignmentController.getAssignments);
router.get('/:id', protect, validateIdParam, assignmentController.getAssignmentById);

router.post(
  '/',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateCreateAssignment,
  assignmentController.createAssignment
);

router.put(
  '/:id',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateUpdateAssignment,
  assignmentController.updateAssignment
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateIdParam,
  assignmentController.deleteAssignment
);

module.exports = router;

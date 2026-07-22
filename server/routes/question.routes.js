const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.controller');
const {
  validateCreateQuestion,
  validateUpdateQuestion,
  validateIdParam
} = require('../validators/question.validator');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

router.get(
  '/',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  questionController.getQuestions
);

router.post(
  '/',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateCreateQuestion,
  questionController.createQuestion
);

router.put(
  '/:id',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateUpdateQuestion,
  questionController.updateQuestion
);

router.patch(
  '/:id/approve',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateIdParam,
  questionController.approveQuestion
);

router.patch(
  '/:id/archive',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateIdParam,
  questionController.archiveQuestion
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateIdParam,
  questionController.deleteQuestion
);

module.exports = router;

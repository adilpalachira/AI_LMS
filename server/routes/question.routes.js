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

router.delete(
  '/:id',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateIdParam,
  questionController.deleteQuestion
);

module.exports = router;

const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submission.controller');
const {
  validateGradeSubmission,
  validateIdParam
} = require('../validators/submission.validator');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { uploadSubmissionFile } = require('../middlewares/submissionUpload.middleware');

// Student upload submission route
router.post(
  '/',
  protect,
  authorizeRoles('Student'),
  uploadSubmissionFile,
  submissionController.submitAssignment
);

// Faculty get submissions by assignment
router.get(
  '/',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  submissionController.getSubmissions
);

// Faculty grade submission route
router.put(
  '/:id',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateGradeSubmission,
  submissionController.gradeSubmission
);

module.exports = router;

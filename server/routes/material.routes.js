const express = require('express');
const router = express.Router();
const materialController = require('../controllers/material.controller');
const {
  validateUploadMaterial,
  validateLessonIdParam,
  validateIdParam
} = require('../validators/material.validator');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { uploadMaterialFile } = require('../middlewares/contentUpload.middleware');

// Fetch materials for a lesson
router.get('/:lessonId', protect, validateLessonIdParam, materialController.getMaterialsByLesson);

// Upload material file (Faculty & Admin only)
router.post(
  '/upload',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  uploadMaterialFile,
  validateUploadMaterial,
  materialController.uploadMaterial
);

// Delete material file (Faculty & Admin only)
router.delete(
  '/:id',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  validateIdParam,
  materialController.deleteMaterial
);

module.exports = router;

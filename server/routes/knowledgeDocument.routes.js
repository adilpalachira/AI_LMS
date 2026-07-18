const express = require('express');
const router = express.Router();
const knowledgeDocController = require('../controllers/knowledgeDocument.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// Get knowledge documents status list (Faculty & Admin)
router.get(
  '/',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  knowledgeDocController.getKnowledgeDocuments
);

// Get single document status (Faculty & Admin)
router.get(
  '/:id',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  knowledgeDocController.getDocumentById
);

// Retry processing for a document (Faculty & Admin)
router.post(
  '/:id/retry',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  knowledgeDocController.retryProcessing
);

// Remove document from vector index (Faculty & Admin)
router.delete(
  '/:id',
  protect,
  authorizeRoles('Admin', 'Faculty'),
  knowledgeDocController.deleteKnowledgeDocument
);

module.exports = router;

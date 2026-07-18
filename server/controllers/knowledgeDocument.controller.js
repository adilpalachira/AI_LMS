const KnowledgeDocument = require('../models/knowledgeDocument.model');
const LearningMaterial = require('../models/material.model');
const documentProcessor = require('../services/rag/documentProcessor.service');
const vectorStoreService = require('../services/rag/vectorStore.service');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Controller for Faculty & Admin Knowledge Document management
 */

/**
 * Get knowledge documents list with status filters
 * GET /api/ai/knowledge-documents
 */
const getKnowledgeDocuments = async (req, res) => {
  try {
    const { courseId, status } = req.query;
    const query = {};

    if (courseId) {
      query.courseId = courseId;
    }
    if (status && status !== 'All') {
      query.processingStatus = status;
    }

    const documents = await KnowledgeDocument.find(query)
      .populate('courseId', 'title code')
      .populate('lessonId', 'title')
      .populate('materialId', 'fileName fileType fileSize fileUrl')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, 'Knowledge documents retrieved successfully', documents);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Get knowledge document status by ID
 * GET /api/ai/knowledge-documents/:id
 */
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await KnowledgeDocument.findById(id)
      .populate('courseId', 'title code')
      .populate('lessonId', 'title')
      .populate('materialId', 'fileName fileType fileSize fileUrl')
      .populate('createdBy', 'name email role')
      .lean();

    if (!document) {
      return errorResponse(res, 'Knowledge document not found', 404);
    }

    return successResponse(res, 'Knowledge document retrieved successfully', document);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Retry vector processing for a failed or pending document
 * POST /api/ai/knowledge-documents/:id/retry
 */
const retryProcessing = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await KnowledgeDocument.findById(id);
    if (!document) {
      return errorResponse(res, 'Knowledge document not found', 404);
    }

    // Trigger document processor asynchronously or synchronously
    documentProcessor.processMaterialDocument(document.materialId, req.user._id)
      .catch(err => console.error(`[Async Retry Failed for ${id}]:`, err.message));

    return successResponse(res, 'Document reprocessing started successfully', {
      id: document._id,
      status: 'PROCESSING'
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Delete document from knowledge base and remove Pinecone vectors
 * DELETE /api/ai/knowledge-documents/:id
 */
const deleteKnowledgeDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await KnowledgeDocument.findById(id);
    if (!document) {
      return errorResponse(res, 'Knowledge document not found', 404);
    }

    // Remove vectors from Pinecone
    if (document.materialId) {
      await vectorStoreService.deleteVectorsByMaterial(document.materialId);
    }

    await KnowledgeDocument.findByIdAndDelete(id);
    return successResponse(res, 'Document removed from knowledge base successfully', null);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getKnowledgeDocuments,
  getDocumentById,
  retryProcessing,
  deleteKnowledgeDocument
};

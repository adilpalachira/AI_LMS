const mongoose = require('mongoose');

/**
 * KnowledgeDocument Schema
 * Tracks processing state and metadata for learning material vectorization
 */
const KnowledgeDocumentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required']
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'Lesson reference is required']
    },
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningMaterial',
      required: [true, 'Material reference is required']
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true
    },
    fileType: {
      type: String,
      required: [true, 'File type is required'],
      trim: true
    },
    sourceUrl: {
      type: String,
      required: [true, 'Source URL is required']
    },
    processingStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PENDING'
    },
    chunkCount: {
      type: Number,
      default: 0
    },
    embeddingStatus: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'],
      default: 'NOT_STARTED'
    },
    errorMessage: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user ID is required']
    }
  },
  {
    timestamps: true
  }
);

KnowledgeDocumentSchema.index({ courseId: 1, materialId: 1 }, { unique: true });
KnowledgeDocumentSchema.index({ processingStatus: 1 });

module.exports = mongoose.model('KnowledgeDocument', KnowledgeDocumentSchema);

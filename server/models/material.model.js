const mongoose = require('mongoose');

const LearningMaterialSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'Lesson ID is required']
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required']
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true
    },
    fileType: {
      type: String,
      required: [true, 'File type category is required'],
      trim: true
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL path is required'],
      trim: true
    },
    fileSize: {
      type: Number,
      default: 0
    },
    mimeType: {
      type: String,
      default: ''
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader user ID is required']
    },
    // Future AI Prep Fields (Vector Embeddings, PDF OCR/Extraction)
    extractedText: {
      type: String,
      default: ''
    },
    aiMetadata: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

LearningMaterialSchema.index({ lessonId: 1 });
LearningMaterialSchema.index({ courseId: 1 });

module.exports = mongoose.model('LearningMaterial', LearningMaterialSchema);

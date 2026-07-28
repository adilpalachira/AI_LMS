const mongoose = require('mongoose');

/**
 * LearningRecommendation Schema
 * Stores adaptive topic & resource recommendations for a student
 */
const LearningRecommendationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required']
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required']
    },
    type: {
      type: String,
      enum: ['Lesson', 'Material', 'Quiz', 'Assignment', 'Revision', 'AI Tutor'],
      required: [true, 'Recommendation type is required']
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true
    },
    reason: {
      type: String,
      required: [true, 'Reason for recommendation is required'],
      trim: true
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    resourceModel: {
      type: String,
      enum: ['Lesson', 'LearningMaterial', 'Quiz', 'Assignment', null],
      default: null
    },
    status: {
      type: String,
      enum: ['Active', 'Dismissed', 'Completed'],
      default: 'Active'
    },
    expiresAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

LearningRecommendationSchema.index({ studentId: 1, courseId: 1, status: 1 });

module.exports = mongoose.model('LearningRecommendation', LearningRecommendationSchema);

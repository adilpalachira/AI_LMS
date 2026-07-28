const mongoose = require('mongoose');

/**
 * LearningProfile Schema
 * Tracks student personalization state, study preferences, weak/strong topics, and analysis timestamps
 */
const LearningProfileSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
      unique: true
    },
    learningPreferences: {
      type: [String],
      default: ['Visual', 'Interactive Quizzes']
    },
    preferredStudyTime: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening', 'Night'],
      default: 'Evening'
    },
    availableStudyHours: {
      type: Number,
      default: 2,
      min: [0.5, 'Available study hours must be at least 0.5']
    },
    learningGoal: {
      type: String,
      default: 'Master course concepts and excel in upcoming assessments',
      trim: true
    },
    strongTopics: [
      {
        topic: { type: String, required: true },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        scorePercentage: { type: Number, default: 85 }
      }
    ],
    weakTopics: [
      {
        topic: { type: String, required: true },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        weakScore: { type: Number, default: 0 },
        reason: { type: String, default: 'Low score on quiz attempt' },
        status: { type: String, enum: ['Weak', 'Needs Improvement'], default: 'Weak' }
      }
    ],
    lastAnalyzedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

LearningProfileSchema.index({ studentId: 1 });

module.exports = mongoose.model('LearningProfile', LearningProfileSchema);

const mongoose = require('mongoose');

/**
 * StudyPlan Schema
 * Tracks student personalized study plans for courses and exam preparation
 */
const StudyPlanSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, 'Study plan title is required'],
      trim: true
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    examDate: {
      type: Date,
      required: [true, 'Exam date is required']
    },
    availableHoursPerDay: {
      type: Number,
      default: 2,
      min: [0.5, 'Must have at least 0.5 hours per day']
    },
    preferredStudyTime: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening', 'Night'],
      default: 'Evening'
    },
    learningGoal: {
      type: String,
      default: ''
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    totalTasksCount: {
      type: Number,
      default: 0
    },
    completedTasksCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Draft', 'Active', 'Completed', 'Archived'],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

StudyPlanSchema.index({ studentId: 1, courseId: 1, status: 1 });

module.exports = mongoose.model('StudyPlan', StudyPlanSchema);

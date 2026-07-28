const mongoose = require('mongoose');

/**
 * StudyPlanTask Schema
 * Individual daily study tasks associated with a StudyPlan
 */
const StudyPlanTaskSchema = new mongoose.Schema(
  {
    studyPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyPlan',
      required: [true, 'Study Plan reference is required']
    },
    date: {
      type: Date,
      required: [true, 'Task date is required']
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    topic: {
      type: String,
      default: ''
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    resourceType: {
      type: String,
      enum: ['Lesson', 'Quiz', 'Assignment', 'Revision', 'AI Tutor', 'General'],
      default: 'General'
    },
    durationMinutes: {
      type: Number,
      default: 45
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Skipped', 'Rescheduled'],
      default: 'Pending'
    },
    completedAt: {
      type: Date
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

StudyPlanTaskSchema.index({ studyPlanId: 1, date: 1, status: 1 });

module.exports = mongoose.model('StudyPlanTask', StudyPlanTaskSchema);

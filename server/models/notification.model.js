const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification recipient is required'],
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    type: {
      type: String,
      enum: [
        'ASSIGNMENT_CREATED',
        'ASSIGNMENT_DUE_SOON',
        'ASSIGNMENT_SUBMITTED',
        'ASSIGNMENT_GRADED',
        'QUIZ_AVAILABLE',
        'QUIZ_RESULT',
        'COURSE_ENROLLED',
        'COURSE_CONTENT_UPDATED',
        'COURSE_COMPLETED',
        'STUDY_PLAN_REMINDER',
        'PERFORMANCE_RISK',
        'SYSTEM_ANNOUNCEMENT'
      ],
      required: [true, 'Notification type is required']
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: 150
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: 500
    },
    priority: {
      type: String,
      enum: ['Normal', 'Important'],
      default: 'Normal'
    },
    relatedEntity: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    relatedEntityType: {
      type: String,
      enum: ['Course', 'Assignment', 'Quiz', 'Submission', 'QuizAttempt', 'StudyPlanTask', 'User', 'System'],
      default: 'System'
    },
    actionUrl: {
      type: String,
      trim: true,
      default: ''
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date,
      default: null
    },
    eventId: {
      type: String,
      sparse: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for high-efficiency recipient notification sorting and unread lookups
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

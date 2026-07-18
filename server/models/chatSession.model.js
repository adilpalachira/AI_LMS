const mongoose = require('mongoose');

/**
 * ChatSession Schema
 * Stores AI Tutor conversation sessions between student and AI course assistant
 */
const ChatSessionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID reference is required']
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID reference is required']
    },
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
      default: 'New Conversation'
    }
  },
  {
    timestamps: true
  }
);

ChatSessionSchema.index({ studentId: 1, courseId: 1 });

module.exports = mongoose.model('ChatSession', ChatSessionSchema);

const mongoose = require('mongoose');

const QuizAttemptSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz ID is required']
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required']
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required']
    },
    score: {
      type: Number,
      default: 0
    },
    maxScore: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    passed: {
      type: Boolean,
      default: false
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
          required: true
        },
        studentAnswer: {
          type: mongoose.Schema.Types.Mixed
        },
        isCorrect: {
          type: Boolean,
          default: false
        },
        marksAwarded: {
          type: Number,
          default: 0
        },
        feedback: {
          type: String,
          default: ''
        }
      }
    ],
    startedAt: {
      type: Date,
      default: Date.now
    },
    submittedAt: {
      type: Date
    },
    attemptNumber: {
      type: Number,
      default: 1
    },
    status: {
      type: String,
      enum: ['In-Progress', 'Completed'],
      default: 'Completed'
    },
    // Future AI Feedback Prep
    aiEvaluationSummary: {
      type: String,
      default: ''
    },
    aiSkillGapAnalysis: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

QuizAttemptSchema.index({ quizId: 1, studentId: 1 });

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);

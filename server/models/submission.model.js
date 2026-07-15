const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: [true, 'Assignment ID is required']
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
    fileUrl: {
      type: String,
      required: [true, 'Submission file URL is required'],
      trim: true
    },
    fileName: {
      type: String,
      trim: true,
      default: 'Submission File'
    },
    fileSize: {
      type: Number,
      default: 0
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    isLate: {
      type: Boolean,
      default: false
    },
    marks: {
      type: Number,
      default: null
    },
    feedback: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['Submitted', 'Graded', 'Resubmitted'],
      default: 'Submitted'
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    gradedAt: {
      type: Date
    },
    // Future AI Automated Evaluation Prep
    aiGradedScore: {
      type: Number,
      default: null
    },
    aiFeedback: {
      type: String,
      default: ''
    },
    aiConfidence: {
      type: Number,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes for quick lookup of student submissions per assignment
SubmissionSchema.index({ assignmentId: 1, studentId: 1 });
SubmissionSchema.index({ courseId: 1 });

module.exports = mongoose.model('Submission', SubmissionSchema);

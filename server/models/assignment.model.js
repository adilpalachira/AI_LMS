const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required']
    },
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    instructions: {
      type: String,
      trim: true,
      default: ''
    },
    maxMarks: {
      type: Number,
      default: 100,
      min: [1, 'Maximum marks must be at least 1']
    },
    deadline: {
      type: Date,
      required: [true, 'Submission deadline date is required']
    },
    allowedFileTypes: {
      type: [String],
      default: ['pdf', 'doc', 'docx', 'zip', 'png', 'jpg']
    },
    maxFileSizeMB: {
      type: Number,
      default: 25
    },
    lateSubmissionPolicy: {
      type: String,
      enum: ['Allowed', 'Disallowed', 'DeductMarks'],
      default: 'Allowed'
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Published'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user ID is required']
    },
    // Future AI Assessment Prep
    aiGradingPrompt: {
      type: String,
      default: ''
    },
    aiRubric: {
      type: Object,
      default: {}
    },
    aiDifficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Adaptive'],
      default: 'Medium'
    }
  },
  {
    timestamps: true
  }
);

AssignmentSchema.index({ courseId: 1, deadline: 1 });

module.exports = mongoose.model('Assignment', AssignmentSchema);

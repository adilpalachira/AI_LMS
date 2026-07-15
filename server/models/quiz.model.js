const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required']
    },
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    durationMinutes: {
      type: Number,
      default: 30,
      min: [1, 'Duration must be at least 1 minute']
    },
    passingMarks: {
      type: Number,
      default: 50
    },
    maxAttempts: {
      type: Number,
      default: 1,
      min: [1, 'Max attempts must be at least 1']
    },
    shuffleQuestions: {
      type: Boolean,
      default: false
    },
    shuffleOptions: {
      type: Boolean,
      default: false
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
    // Future AI Quiz Generation Prep
    aiGenerated: {
      type: Boolean,
      default: false
    },
    aiTopic: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

QuizSchema.index({ courseId: 1, status: 1 });

module.exports = mongoose.model('Quiz', QuizSchema);

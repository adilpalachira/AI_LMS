const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: false
    },
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['Multiple Choice', 'MCQ', 'True/False', 'Short Answer', 'Essay', 'Descriptive'],
      required: [true, 'Question type is required']
    },
    options: {
      type: [String],
      default: []
    },
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Correct answer specification is required']
    },
    explanation: {
      type: String,
      default: '',
      trim: true
    },
    marks: {
      type: Number,
      default: 1,
      min: [1, 'Question marks must be at least 1']
    },
    order: {
      type: Number,
      default: 0
    },
    // Module 7 Smart Question Bank & AI metadata
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: false
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: false
    },
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningMaterial',
      required: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    status: {
      type: String,
      enum: ['Generated', 'Draft', 'Approved', 'Archived'],
      default: 'Approved'
    },
    isAiGenerated: {
      type: Boolean,
      default: false
    },
    source: {
      type: String,
      default: ''
    },
    sourcePage: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    },
    aiEvaluationCriteria: {
      type: String,
      default: ''
    },
    aiDifficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    }
  },
  {
    timestamps: true
  }
);

QuestionSchema.index({ quizId: 1, order: 1 });
QuestionSchema.index({ courseId: 1, status: 1 });
QuestionSchema.index({ status: 1 });

module.exports = mongoose.model('Question', QuestionSchema);

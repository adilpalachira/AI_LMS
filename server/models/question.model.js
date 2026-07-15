const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz ID is required']
    },
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['Multiple Choice', 'True/False', 'Short Answer', 'Essay'],
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
    // Future AI Prep
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

module.exports = mongoose.model('Question', QuestionSchema);

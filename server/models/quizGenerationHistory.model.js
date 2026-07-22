const mongoose = require('mongoose');

const QuizGenerationHistorySchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user ID is required']
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required']
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      default: null
    },
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningMaterial',
      default: null
    },
    topic: {
      type: String,
      default: ''
    },
    questionType: {
      type: String,
      default: 'MCQ'
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    },
    questionCount: {
      type: Number,
      required: true,
      default: 5
    },
    status: {
      type: String,
      enum: ['PENDING', 'GENERATING', 'COMPLETED', 'FAILED'],
      default: 'PENDING'
    },
    generatedQuestions: [
      {
        question: String,
        type: String,
        difficulty: String,
        options: [String],
        correctAnswer: mongoose.Schema.Types.Mixed,
        explanation: String,
        marks: Number,
        source: String,
        sourcePage: mongoose.Schema.Types.Mixed
      }
    ],
    generatedQuestionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
      }
    ],
    errorMessage: {
      type: String,
      default: ''
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

QuizGenerationHistorySchema.index({ createdBy: 1, createdAt: -1 });
QuizGenerationHistorySchema.index({ courseId: 1 });

module.exports = mongoose.model('QuizGenerationHistory', QuizGenerationHistorySchema);

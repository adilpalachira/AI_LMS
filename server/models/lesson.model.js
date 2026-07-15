const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required']
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CourseSection',
      required: [true, 'Section ID is required']
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
      maxlength: [200, 'Lesson title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    duration: {
      type: String,
      default: '10 mins',
      trim: true
    },
    order: {
      type: Number,
      default: 0
    },
    contentType: {
      type: String,
      enum: [
        'PDF',
        'PowerPoint',
        'Word Document',
        'Image',
        'Video',
        'YouTube',
        'External URL',
        'Text Note'
      ],
      required: [true, 'Content type is required']
    },
    isPreview: {
      type: Boolean,
      default: false
    },
    textNote: {
      type: String,
      default: ''
    },
    externalUrl: {
      type: String,
      default: '',
      trim: true
    },
    // Future AI Prep Fields (RAG, Quiz Generation, Summarization)
    summary: {
      type: String,
      default: ''
    },
    aiMetadata: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for fast querying by section or course
LessonSchema.index({ sectionId: 1, order: 1 });
LessonSchema.index({ courseId: 1 });

module.exports = mongoose.model('Lesson', LessonSchema);

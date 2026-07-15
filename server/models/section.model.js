const mongoose = require('mongoose');

const CourseSectionSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required']
    },
    title: {
      type: String,
      required: [true, 'Section title is required'],
      trim: true,
      maxlength: [150, 'Section title cannot exceed 150 characters']
    },
    order: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient ordering & lookup per course
CourseSectionSchema.index({ courseId: 1, order: 1 });

module.exports = mongoose.model('CourseSection', CourseSectionSchema);

const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
      maxlength: [300, 'Short description cannot exceed 300 characters']
    },
    fullDescription: {
      type: String,
      required: [true, 'Full description is required'],
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    },
    duration: {
      type: String,
      default: 'Self-Paced'
    },
    language: {
      type: String,
      default: 'English'
    },
    thumbnail: {
      type: String,
      default: ''
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor assignment is required']
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Draft'
    },
    tags: {
      type: [String],
      default: []
    },
    learningOutcomes: {
      type: [String],
      default: []
    },
    prerequisites: {
      type: [String],
      default: []
    },
    enrolledCount: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast searching & filtering
CourseSchema.index({ title: 'text', code: 'text', shortDescription: 'text' });
CourseSchema.index({ category: 1, level: 1, status: 1 });
CourseSchema.index({ instructor: 1 });

// Auto-generate slug before saving if title is modified
CourseSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

module.exports = mongoose.model('Course', CourseSchema);

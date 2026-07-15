const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required']
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required']
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Dropped'],
      default: 'Active'
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Enforce single active enrollment per student per course
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);

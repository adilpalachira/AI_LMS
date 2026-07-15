const Assignment = require('../models/assignment.model');
const Submission = require('../models/submission.model');
const Course = require('../models/course.model');
const fs = require('fs');
const path = require('path');

/**
 * Verify course ownership for Faculty/Admin
 */
const checkCourseOwnership = async (courseId, user) => {
  if (user.role === 'Admin') return true;

  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  if (course.instructor.toString() !== user._id.toString() && course.createdBy.toString() !== user._id.toString()) {
    throw new Error('Unauthorized: You are not the instructor for this course');
  }
  return course;
};

/**
 * Create a new assignment
 */
const createAssignment = async (assignmentData, user) => {
  await checkCourseOwnership(assignmentData.courseId, user);
  assignmentData.createdBy = user._id;

  const assignment = await Assignment.create(assignmentData);
  return assignment;
};

/**
 * Get assignments by course (with submission status if student)
 */
const getAssignmentsByCourse = async (courseId, user) => {
  const query = { courseId };
  if (user.role === 'Student') {
    query.status = 'Published';
  }

  const assignments = await Assignment.find(query)
    .sort({ deadline: 1 })
    .populate('createdBy', 'name email')
    .lean();

  // Populate student submission status if student
  if (user.role === 'Student') {
    for (let assign of assignments) {
      const submission = await Submission.findOne({
        assignmentId: assign._id,
        studentId: user._id
      }).lean();
      assign.mySubmission = submission || null;
    }
  } else {
    // Populate submission count for Faculty/Admin
    for (let assign of assignments) {
      const count = await Submission.countDocuments({ assignmentId: assign._id });
      assign.submissionCount = count;
    }
  }

  return assignments;
};

/**
 * Get assignment by ID
 */
const getAssignmentById = async (assignmentId, user) => {
  const assignment = await Assignment.findById(assignmentId)
    .populate('courseId', 'title code')
    .populate('createdBy', 'name email')
    .lean();

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  if (user.role === 'Student') {
    const submission = await Submission.findOne({
      assignmentId,
      studentId: user._id
    }).lean();
    assignment.mySubmission = submission || null;
  }

  return assignment;
};

/**
 * Update assignment
 */
const updateAssignment = async (assignmentId, updateData, user) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new Error('Assignment not found');
  }

  await checkCourseOwnership(assignment.courseId, user);

  Object.assign(assignment, updateData);
  await assignment.save();
  return assignment;
};

/**
 * Delete assignment and its submissions
 */
const deleteAssignment = async (assignmentId, user) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new Error('Assignment not found');
  }

  await checkCourseOwnership(assignment.courseId, user);

  // Remove submission files on disk
  const submissions = await Submission.find({ assignmentId });
  submissions.forEach(sub => {
    if (sub.fileUrl && !sub.fileUrl.startsWith('http')) {
      const absolutePath = path.join(__dirname, '../', sub.fileUrl);
      if (fs.existsSync(absolutePath)) {
        try { fs.unlinkSync(absolutePath); } catch (e) {}
      }
    }
  });

  await Submission.deleteMany({ assignmentId });
  await Assignment.findByIdAndDelete(assignmentId);

  return { message: 'Assignment and all student submissions deleted successfully' };
};

const Enrollment = require('../models/enrollment.model');

/**
 * Get all assignments for the authenticated user across enrolled/taught courses
 */
const getAllAssignmentsForUser = async (user) => {
  let query = {};
  if (user.role === 'Student') {
    const enrollments = await Enrollment.find({ student: user._id, status: 'Active' });
    const courseIds = enrollments.map(e => e.course);
    query = { courseId: { $in: courseIds }, status: 'Published' };
  } else if (user.role === 'Faculty') {
    const courses = await Course.find({ $or: [{ instructor: user._id }, { createdBy: user._id }] });
    const courseIds = courses.map(c => c._id);
    query = { courseId: { $in: courseIds } };
  }

  const assignments = await Assignment.find(query)
    .sort({ deadline: 1 })
    .populate('courseId', 'title code')
    .populate('createdBy', 'name email')
    .lean();

  if (user.role === 'Student') {
    for (let assign of assignments) {
      const submission = await Submission.findOne({
        assignmentId: assign._id,
        studentId: user._id
      }).lean();
      assign.mySubmission = submission || null;
    }
  } else {
    for (let assign of assignments) {
      const count = await Submission.countDocuments({ assignmentId: assign._id });
      assign.submissionCount = count;
    }
  }

  return assignments;
};

module.exports = {
  createAssignment,
  getAssignmentsByCourse,
  getAllAssignmentsForUser,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  checkCourseOwnership
};

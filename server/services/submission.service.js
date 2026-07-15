const Submission = require('../models/submission.model');
const Assignment = require('../models/assignment.model');
const { checkCourseOwnership } = require('./assignment.service');
const fs = require('fs');
const path = require('path');

/**
 * Submit or update assignment submission (Student)
 */
const submitAssignment = async (assignmentId, fileInfo, user) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new Error('Assignment not found');
  }

  const now = new Date();
  const isLate = now > new Date(assignment.deadline);

  if (isLate && assignment.lateSubmissionPolicy === 'Disallowed') {
    throw new Error('Deadline has passed. Late submissions are not allowed for this assignment.');
  }

  // Check if existing submission exists
  let submission = await Submission.findOne({
    assignmentId: assignment._id,
    studentId: user._id
  });

  if (submission) {
    // Delete old physical file if exists
    if (submission.fileUrl && !submission.fileUrl.startsWith('http')) {
      const oldPath = path.join(__dirname, '../', submission.fileUrl);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (e) {}
      }
    }

    submission.fileUrl = fileInfo.relativePath || fileInfo.fileUrl;
    submission.fileName = fileInfo.originalname || fileInfo.fileName || 'Submission File';
    submission.fileSize = fileInfo.size || fileInfo.fileSize || 0;
    submission.submittedAt = now;
    submission.isLate = isLate;
    submission.status = 'Resubmitted';
    await submission.save();
  } else {
    submission = await Submission.create({
      assignmentId: assignment._id,
      courseId: assignment.courseId,
      studentId: user._id,
      fileUrl: fileInfo.relativePath || fileInfo.fileUrl,
      fileName: fileInfo.originalname || fileInfo.fileName || 'Submission File',
      fileSize: fileInfo.size || fileInfo.fileSize || 0,
      submittedAt: now,
      isLate,
      status: 'Submitted'
    });
  }

  return submission;
};

/**
 * Get submissions for an assignment (Faculty/Admin review)
 */
const getSubmissionsByAssignment = async (assignmentId, user) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new Error('Assignment not found');
  }

  await checkCourseOwnership(assignment.courseId, user);

  const submissions = await Submission.find({ assignmentId })
    .populate('studentId', 'name email role avatar')
    .populate('gradedBy', 'name')
    .sort({ submittedAt: -1 })
    .lean();

  return submissions;
};

/**
 * Grade student submission (Faculty/Admin)
 */
const gradeSubmission = async (submissionId, gradeData, user) => {
  const submission = await Submission.findById(submissionId);
  if (!submission) {
    throw new Error('Submission not found');
  }

  const assignment = await Assignment.findById(submission.assignmentId);
  if (!assignment) {
    throw new Error('Associated assignment not found');
  }

  await checkCourseOwnership(assignment.courseId, user);

  if (gradeData.marks !== undefined && (gradeData.marks < 0 || gradeData.marks > assignment.maxMarks)) {
    throw new Error(`Marks must be between 0 and ${assignment.maxMarks}`);
  }

  submission.marks = gradeData.marks;
  submission.feedback = gradeData.feedback || '';
  submission.status = 'Graded';
  submission.gradedBy = user._id;
  submission.gradedAt = new Date();

  await submission.save();
  return submission;
};

module.exports = {
  submitAssignment,
  getSubmissionsByAssignment,
  gradeSubmission
};

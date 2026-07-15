const submissionService = require('../services/submission.service');
const { successResponse } = require('../utils/response');

const submitAssignment = async (req, res, next) => {
  try {
    const assignmentId = req.body.assignmentId;
    if (!assignmentId) {
      return res.status(400).json({ success: false, message: 'assignmentId is required' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Submission file is required' });
    }

    const submission = await submissionService.submitAssignment(assignmentId, req.file, req.user);
    return successResponse(res, 'Assignment submitted successfully', submission, 201);
  } catch (error) {
    next(error);
  }
};

const getSubmissions = async (req, res, next) => {
  try {
    const assignmentId = req.query.assignmentId;
    if (!assignmentId) {
      return res.status(400).json({ success: false, message: 'assignmentId query param is required' });
    }
    const submissions = await submissionService.getSubmissionsByAssignment(assignmentId, req.user);
    return successResponse(res, 'Submissions retrieved successfully', submissions);
  } catch (error) {
    next(error);
  }
};

const gradeSubmission = async (req, res, next) => {
  try {
    const submission = await submissionService.gradeSubmission(req.params.id, req.body, req.user);
    return successResponse(res, 'Submission graded successfully', submission);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitAssignment,
  getSubmissions,
  gradeSubmission
};

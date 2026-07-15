const assignmentService = require('../services/assignment.service');
const { successResponse } = require('../utils/response');

const createAssignment = async (req, res, next) => {
  try {
    const assignment = await assignmentService.createAssignment(req.body, req.user);
    return successResponse(res, 'Assignment created successfully', assignment, 201);
  } catch (error) {
    next(error);
  }
};

const getAssignments = async (req, res, next) => {
  try {
    const courseId = req.query.courseId || req.params.courseId;
    let assignments;
    if (courseId) {
      assignments = await assignmentService.getAssignmentsByCourse(courseId, req.user);
    } else {
      assignments = await assignmentService.getAllAssignmentsForUser(req.user);
    }
    return successResponse(res, 'Assignments retrieved successfully', assignments);
  } catch (error) {
    next(error);
  }
};

const getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await assignmentService.getAssignmentById(req.params.id, req.user);
    return successResponse(res, 'Assignment details retrieved successfully', assignment);
  } catch (error) {
    next(error);
  }
};

const updateAssignment = async (req, res, next) => {
  try {
    const assignment = await assignmentService.updateAssignment(req.params.id, req.body, req.user);
    return successResponse(res, 'Assignment updated successfully', assignment);
  } catch (error) {
    next(error);
  }
};

const deleteAssignment = async (req, res, next) => {
  try {
    const result = await assignmentService.deleteAssignment(req.params.id, req.user);
    return successResponse(res, result.message, null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment
};

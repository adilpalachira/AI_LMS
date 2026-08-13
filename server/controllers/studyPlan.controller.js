const StudyPlan = require('../models/studyPlan.model');
const StudyPlanTask = require('../models/studyPlanTask.model');
const studyPlannerService = require('../services/studyPlanner.service');
const { formatResponse } = require('../utils/response');

/**
 * POST /api/study-plans
 * Generate a new AI Study Plan for a course
 */
const createStudyPlan = async (req, res, next) => {
  try {
    const studentId = req.user._id.toString();
    const { courseId, startDate, examDate, availableHoursPerDay, preferredStudyTime, learningGoal } = req.body;

    if (!courseId) {
      return res.status(400).json(formatResponse(false, 'Target course selection is required'));
    }

    if (!examDate) {
      return res.status(400).json(formatResponse(false, 'Exam / end date is required'));
    }

    const result = await studyPlannerService.generateStudyPlan({
      studentId,
      courseId,
      startDate,
      examDate,
      availableHoursPerDay,
      preferredStudyTime,
      learningGoal
    });

    return res.status(201).json(
      formatResponse(true, 'AI Study Plan generated successfully', result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/study-plans
 * Get all study plans for the logged in student
 */
const getStudyPlans = async (req, res, next) => {
  try {
    const studentId = req.user._id.toString();
    const plans = await StudyPlan.find({ studentId })
      .populate('courseId', 'title code duration thumbnail')
      .sort({ createdAt: -1 });

    return res.status(200).json(
      formatResponse(true, 'Study plans retrieved successfully', plans)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/study-plans/:id
 * Get study plan details with tasks
 */
const getStudyPlanById = async (req, res, next) => {
  try {
    const studentId = req.user._id.toString();
    const plan = await StudyPlan.findById(req.params.id).populate('courseId', 'title code duration');

    if (!plan) {
      return res.status(404).json(formatResponse(false, 'Study plan not found'));
    }

    if (plan.studentId.toString() !== studentId) {
      return res.status(403).json(formatResponse(false, 'Unauthorized access to study plan'));
    }

    const tasks = await StudyPlanTask.find({ studyPlanId: plan._id }).sort({ date: 1, order: 1 });

    return res.status(200).json(
      formatResponse(true, 'Study plan details retrieved', { plan, tasks })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/study-plans/:id
 * Delete a study plan and its associated tasks
 */
const deleteStudyPlan = async (req, res, next) => {
  try {
    const studentId = req.user._id.toString();
    const plan = await StudyPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json(formatResponse(false, 'Study plan not found'));
    }

    if (plan.studentId.toString() !== studentId) {
      return res.status(403).json(formatResponse(false, 'Unauthorized action'));
    }

    await StudyPlanTask.deleteMany({ studyPlanId: plan._id });
    await StudyPlan.findByIdAndDelete(plan._id);

    return res.status(200).json(
      formatResponse(true, 'Study plan and associated tasks deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/study-plans/tasks/:id/complete
 * Mark a study plan task as completed
 */
const completeTask = async (req, res, next) => {
  try {
    const studentId = req.user._id.toString();
    const result = await studyPlannerService.updateTaskStatus(req.params.id, studentId, 'Completed');
    return res.status(200).json(
      formatResponse(true, 'Task marked as complete', result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/study-plans/tasks/:id/status
 * Generic update status for a study plan task
 */
const updateTaskStatus = async (req, res, next) => {
  try {
    const studentId = req.user._id.toString();
    const { status } = req.body;
    const result = await studyPlannerService.updateTaskStatus(req.params.id, studentId, status);
    return res.status(200).json(
      formatResponse(true, `Task status updated to ${status}`, result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/study-plans/tasks/:id/reschedule
 * Reschedule a study task to a new date
 */
const rescheduleTask = async (req, res, next) => {
  try {
    const studentId = req.user._id.toString();
    const { newDate } = req.body;
    if (!newDate) {
      return res.status(400).json(formatResponse(false, 'New target date is required'));
    }

    const task = await studyPlannerService.rescheduleTask(req.params.id, studentId, newDate);
    return res.status(200).json(
      formatResponse(true, 'Study task rescheduled successfully', task)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/study-plans/tasks/:id/skip
 * Skip a study task
 */
const skipTask = async (req, res, next) => {
  try {
    const studentId = req.user._id.toString();
    const result = await studyPlannerService.updateTaskStatus(req.params.id, studentId, 'Skipped');
    return res.status(200).json(
      formatResponse(true, 'Study task skipped', result)
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStudyPlan,
  getStudyPlans,
  getStudyPlanById,
  deleteStudyPlan,
  completeTask,
  updateTaskStatus,
  rescheduleTask,
  skipTask
};

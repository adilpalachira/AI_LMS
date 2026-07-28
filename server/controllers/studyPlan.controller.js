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
    const studentId = req.user.id;
    const { courseId, examDate, availableHoursPerDay, preferredStudyTime, learningGoal } = req.body;

    if (!courseId || !examDate) {
      return res.status(400).json(
        formatResponse(false, 'Course ID and exam date are required')
      );
    }

    const result = await studyPlannerService.generateStudyPlan({
      studentId,
      courseId,
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
 * Get all active study plans for the logged in student
 */
const getStudyPlans = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const plans = await StudyPlan.find({ studentId }).populate('courseId', 'title code duration');
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
    const studentId = req.user.id;
    const plan = await StudyPlan.findById(req.params.id).populate('courseId', 'title code');

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
 * Delete or archive a study plan and associated tasks
 */
const deleteStudyPlan = async (req, res, next) => {
  try {
    const studentId = req.user.id;
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
      formatResponse(true, 'Study plan and tasks deleted successfully')
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
    const task = await StudyPlanTask.findById(req.params.id).populate('studyPlanId');
    if (!task) {
      return res.status(404).json(formatResponse(false, 'Task not found'));
    }

    if (task.studyPlanId.studentId.toString() !== req.user.id) {
      return res.status(403).json(formatResponse(false, 'Unauthorized task update'));
    }

    task.status = 'Completed';
    task.completedAt = new Date();
    await task.save();

    return res.status(200).json(
      formatResponse(true, 'Task marked as complete', task)
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
    const { newDate } = req.body;
    if (!newDate) {
      return res.status(400).json(formatResponse(false, 'New date is required'));
    }

    const task = await studyPlannerService.rescheduleTask(req.params.id, req.user.id, newDate);
    return res.status(200).json(
      formatResponse(true, 'Study task rescheduled', task)
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
    const task = await StudyPlanTask.findById(req.params.id).populate('studyPlanId');
    if (!task) {
      return res.status(404).json(formatResponse(false, 'Task not found'));
    }

    if (task.studyPlanId.studentId.toString() !== req.user.id) {
      return res.status(403).json(formatResponse(false, 'Unauthorized action'));
    }

    task.status = 'Skipped';
    await task.save();

    return res.status(200).json(
      formatResponse(true, 'Study task skipped', task)
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
  rescheduleTask,
  skipTask
};

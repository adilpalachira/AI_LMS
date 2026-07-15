const lessonService = require('../services/lesson.service');
const { successResponse } = require('../utils/response');

const createLesson = async (req, res, next) => {
  try {
    const lesson = await lessonService.createLesson(req.body, req.user);
    return successResponse(res, 'Lesson created successfully', lesson, 201);
  } catch (error) {
    next(error);
  }
};

const getLessonsBySection = async (req, res, next) => {
  try {
    const sectionId = req.query.sectionId || req.params.sectionId;
    if (!sectionId) {
      return res.status(400).json({ success: false, message: 'sectionId is required' });
    }
    const lessons = await lessonService.getLessonsBySection(sectionId, req.user);
    return successResponse(res, 'Lessons retrieved successfully', lessons);
  } catch (error) {
    next(error);
  }
};

const getLessonById = async (req, res, next) => {
  try {
    const lesson = await lessonService.getLessonById(req.params.id, req.user);
    return successResponse(res, 'Lesson retrieved successfully', lesson);
  } catch (error) {
    next(error);
  }
};

const updateLesson = async (req, res, next) => {
  try {
    const lesson = await lessonService.updateLesson(req.params.id, req.body, req.user);
    return successResponse(res, 'Lesson updated successfully', lesson);
  } catch (error) {
    next(error);
  }
};

const deleteLesson = async (req, res, next) => {
  try {
    const result = await lessonService.deleteLesson(req.params.id, req.user);
    return successResponse(res, result.message, null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLesson,
  getLessonsBySection,
  getLessonById,
  updateLesson,
  deleteLesson
};

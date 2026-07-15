const sectionService = require('../services/section.service');
const { successResponse } = require('../utils/response');

const createSection = async (req, res, next) => {
  try {
    const section = await sectionService.createSection(req.body, req.user);
    return successResponse(res, 'Section created successfully', section, 201);
  } catch (error) {
    next(error);
  }
};

const getSectionsByCourse = async (req, res, next) => {
  try {
    const courseId = req.query.courseId || req.params.courseId;
    if (!courseId) {
      return res.status(400).json({ success: false, message: 'courseId query or param is required' });
    }
    const sections = await sectionService.getSectionsByCourse(courseId, req.user);
    return successResponse(res, 'Sections retrieved successfully', sections);
  } catch (error) {
    next(error);
  }
};

const updateSection = async (req, res, next) => {
  try {
    const section = await sectionService.updateSection(req.params.id, req.body, req.user);
    return successResponse(res, 'Section updated successfully', section);
  } catch (error) {
    next(error);
  }
};

const deleteSection = async (req, res, next) => {
  try {
    const result = await sectionService.deleteSection(req.params.id, req.user);
    return successResponse(res, result.message, null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSection,
  getSectionsByCourse,
  updateSection,
  deleteSection
};

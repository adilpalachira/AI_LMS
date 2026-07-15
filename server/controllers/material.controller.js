const materialService = require('../services/material.service');
const { successResponse } = require('../utils/response');

const uploadMaterial = async (req, res, next) => {
  try {
    const lessonId = req.body.lessonId;
    if (!lessonId) {
      return res.status(400).json({ success: false, message: 'lessonId is required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const material = await materialService.uploadMaterial(lessonId, req.file, req.user);
    return successResponse(res, 'Material uploaded successfully', material, 201);
  } catch (error) {
    next(error);
  }
};

const getMaterialsByLesson = async (req, res, next) => {
  try {
    const materials = await materialService.getMaterialsByLesson(req.params.lessonId, req.user);
    return successResponse(res, 'Materials retrieved successfully', materials);
  } catch (error) {
    next(error);
  }
};

const deleteMaterial = async (req, res, next) => {
  try {
    const result = await materialService.deleteMaterial(req.params.id, req.user);
    return successResponse(res, result.message, null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadMaterial,
  getMaterialsByLesson,
  deleteMaterial
};

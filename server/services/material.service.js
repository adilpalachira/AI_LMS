const LearningMaterial = require('../models/material.model');
const Lesson = require('../models/lesson.model');
const { checkCourseOwnership } = require('./section.service');
const fs = require('fs');
const path = require('path');

/**
 * Handle material upload record creation
 */
const uploadMaterial = async (lessonId, fileInfo, user) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new Error('Lesson not found');
  }

  await checkCourseOwnership(lesson.courseId, user);

  const materialData = {
    lessonId: lesson._id,
    courseId: lesson.courseId,
    fileName: fileInfo.originalname || fileInfo.fileName || 'Uploaded Material',
    fileType: fileInfo.category || fileInfo.fileType || 'document',
    fileUrl: fileInfo.relativePath || fileInfo.fileUrl,
    fileSize: fileInfo.size || fileInfo.fileSize || 0,
    mimeType: fileInfo.mimetype || fileInfo.mimeType || '',
    uploadedBy: user._id
  };

  const material = await LearningMaterial.create(materialData);
  return material;
};

/**
 * Get materials by lesson ID
 */
const getMaterialsByLesson = async (lessonId, user) => {
  const materials = await LearningMaterial.find({ lessonId })
    .populate('uploadedBy', 'name email role')
    .sort({ createdAt: -1 })
    .lean();
  return materials;
};

/**
 * Delete material by ID and cleanup physical file
 */
const deleteMaterial = async (materialId, user) => {
  const material = await LearningMaterial.findById(materialId);
  if (!material) {
    throw new Error('Learning material not found');
  }

  const lesson = await Lesson.findById(material.lessonId);
  if (lesson) {
    await checkCourseOwnership(lesson.courseId, user);
  } else if (user.role !== 'Admin') {
    throw new Error('Unauthorized');
  }

  // Delete physical file from disk if local
  if (material.fileUrl && !material.fileUrl.startsWith('http')) {
    const absolutePath = path.join(__dirname, '../', material.fileUrl);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch (err) {
        console.error(`Failed to delete file from disk: ${absolutePath}`, err);
      }
    }
  }

  await LearningMaterial.findByIdAndDelete(materialId);
  return { message: 'Learning material deleted successfully' };
};

module.exports = {
  uploadMaterial,
  getMaterialsByLesson,
  deleteMaterial
};

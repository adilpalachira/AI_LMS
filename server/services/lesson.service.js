const Lesson = require('../models/lesson.model');
const CourseSection = require('../models/section.model');
const LearningMaterial = require('../models/material.model');
const { checkCourseOwnership } = require('./section.service');
const fs = require('fs');
const path = require('path');

/**
 * Create a new lesson
 */
const createLesson = async (lessonData, user) => {
  const section = await CourseSection.findById(lessonData.sectionId);
  if (!section) {
    throw new Error('Associated section not found');
  }

  // Ensure courseId matches section courseId
  lessonData.courseId = section.courseId;

  await checkCourseOwnership(section.courseId, user);

  // Check duplicate order inside the same section if explicit order provided
  if (lessonData.order !== undefined && lessonData.order !== null) {
    const existingOrder = await Lesson.findOne({
      sectionId: lessonData.sectionId,
      order: lessonData.order
    });
    if (existingOrder) {
      // Auto bump or warn
      const maxLesson = await Lesson.findOne({ sectionId: lessonData.sectionId }).sort({ order: -1 });
      lessonData.order = maxLesson ? maxLesson.order + 1 : 1;
    }
  } else {
    const maxLesson = await Lesson.findOne({ sectionId: lessonData.sectionId }).sort({ order: -1 });
    lessonData.order = maxLesson ? maxLesson.order + 1 : 1;
  }

  const lesson = await Lesson.create(lessonData);
  return lesson;
};

/**
 * Get lessons for a section populated with materials
 */
const getLessonsBySection = async (sectionId, user) => {
  const lessons = await Lesson.find({ sectionId }).sort({ order: 1 }).lean();
  for (let lesson of lessons) {
    lesson.materials = await LearningMaterial.find({ lessonId: lesson._id }).lean();
  }
  return lessons;
};

/**
 * Get single lesson details by ID
 */
const getLessonById = async (lessonId, user) => {
  const lesson = await Lesson.findById(lessonId).populate('sectionId', 'title order').lean();
  if (!lesson) {
    throw new Error('Lesson not found');
  }

  const materials = await LearningMaterial.find({ lessonId: lesson._id }).lean();
  lesson.materials = materials;
  return lesson;
};

/**
 * Update lesson
 */
const updateLesson = async (lessonId, updateData, user) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new Error('Lesson not found');
  }

  await checkCourseOwnership(lesson.courseId, user);

  Object.assign(lesson, updateData);
  await lesson.save();
  return lesson;
};

/**
 * Delete lesson and remove associated learning materials and physical files
 */
const deleteLesson = async (lessonId, user) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new Error('Lesson not found');
  }

  await checkCourseOwnership(lesson.courseId, user);

  // Find all materials in this lesson
  const materials = await LearningMaterial.find({ lessonId: lesson._id });

  // Delete physical files from disk
  materials.forEach(mat => {
    if (mat.fileUrl && !mat.fileUrl.startsWith('http')) {
      const absolutePath = path.join(__dirname, '../', mat.fileUrl);
      if (fs.existsSync(absolutePath)) {
        try {
          fs.unlinkSync(absolutePath);
        } catch (err) {
          console.error(`Failed to delete material file: ${absolutePath}`, err);
        }
      }
    }
  });

  await LearningMaterial.deleteMany({ lessonId: lesson._id });
  await Lesson.findByIdAndDelete(lessonId);

  return { message: 'Lesson and associated materials deleted successfully' };
};

module.exports = {
  createLesson,
  getLessonsBySection,
  getLessonById,
  updateLesson,
  deleteLesson
};

const CourseSection = require('../models/section.model');
const Lesson = require('../models/lesson.model');
const LearningMaterial = require('../models/material.model');
const Course = require('../models/course.model');
const fs = require('fs');
const path = require('path');

/**
 * Verify if user is course instructor or Admin
 */
const checkCourseOwnership = async (courseId, user) => {
  if (user.role === 'Admin') return true;

  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  if (course.instructor.toString() !== user._id.toString() && course.createdBy.toString() !== user._id.toString()) {
    throw new Error('Unauthorized: You are not the assigned instructor for this course');
  }
  return course;
};

/**
 * Create a new section
 */
const createSection = async (sectionData, user) => {
  await checkCourseOwnership(sectionData.courseId, user);

  // Auto assign order if not provided
  if (sectionData.order === undefined || sectionData.order === null) {
    const maxSection = await CourseSection.findOne({ courseId: sectionData.courseId })
      .sort({ order: -1 })
      .select('order');
    sectionData.order = maxSection ? maxSection.order + 1 : 1;
  }

  const section = await CourseSection.create(sectionData);
  return section;
};

/**
 * Get all sections for a course populated with lessons and materials
 */
const getSectionsByCourse = async (courseId, user) => {
  const sections = await CourseSection.find({ courseId }).sort({ order: 1 }).lean();

  // Populate lessons for each section
  for (let section of sections) {
    const lessons = await Lesson.find({ sectionId: section._id }).sort({ order: 1 }).lean();
    
    // Populate learning materials for each lesson
    for (let lesson of lessons) {
      const materials = await LearningMaterial.find({ lessonId: lesson._id }).lean();
      lesson.materials = materials;
    }
    
    section.lessons = lessons;
  }

  return sections;
};

/**
 * Update a section
 */
const updateSection = async (sectionId, updateData, user) => {
  const section = await CourseSection.findById(sectionId);
  if (!section) {
    throw new Error('Section not found');
  }

  await checkCourseOwnership(section.courseId, user);

  Object.assign(section, updateData);
  await section.save();
  return section;
};

/**
 * Delete a section with cascading delete of lessons and files
 */
const deleteSection = async (sectionId, user) => {
  const section = await CourseSection.findById(sectionId);
  if (!section) {
    throw new Error('Section not found');
  }

  await checkCourseOwnership(section.courseId, user);

  // Find all lessons in this section
  const lessons = await Lesson.find({ sectionId: section._id });
  const lessonIds = lessons.map(l => l._id);

  // Find all materials in these lessons
  const materials = await LearningMaterial.find({ lessonId: { $in: lessonIds } });

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

  // Delete materials and lessons from DB
  await LearningMaterial.deleteMany({ lessonId: { $in: lessonIds } });
  await Lesson.deleteMany({ sectionId: section._id });
  await CourseSection.findByIdAndDelete(sectionId);

  return { message: 'Section and associated content deleted successfully' };
};

module.exports = {
  createSection,
  getSectionsByCourse,
  updateSection,
  deleteSection,
  checkCourseOwnership
};

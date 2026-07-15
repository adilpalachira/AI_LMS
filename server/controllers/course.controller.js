const courseService = require('../services/course.service');
const { successResponse } = require('../utils/response');

const getCourses = async (req, res, next) => {
  try {
    const result = await courseService.queryCourses(req.query, req.user);
    return successResponse(res, 'Courses retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const course = await courseService.getCourseById(req.params.id, req.user);
    return successResponse(res, 'Course details retrieved successfully', course);
  } catch (error) {
    next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const courseData = { ...req.body };
    if (req.file) {
      courseData.thumbnail = req.file.path;
    }

    const course = await courseService.createCourse(courseData, req.user);
    return successResponse(res, 'Course created successfully', course, 201);
  } catch (error) {
    next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.thumbnail = req.file.path;
    }

    const course = await courseService.updateCourse(req.params.id, updateData, req.user);
    return successResponse(res, 'Course updated successfully', course);
  } catch (error) {
    next(error);
  }
};

const publishCourse = async (req, res, next) => {
  try {
    const course = await courseService.updateCourseStatus(req.params.id, 'Published', req.user);
    return successResponse(res, 'Course published successfully', course);
  } catch (error) {
    next(error);
  }
};

const archiveCourse = async (req, res, next) => {
  try {
    const course = await courseService.updateCourseStatus(req.params.id, 'Archived', req.user);
    return successResponse(res, 'Course archived successfully', course);
  } catch (error) {
    next(error);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const result = await courseService.deleteCourse(req.params.id, req.user);
    return successResponse(res, result.message, null);
  } catch (error) {
    next(error);
  }
};

const enrollStudent = async (req, res, next) => {
  try {
    const enrollment = await courseService.enrollStudent(req.params.id, req.user._id);
    return successResponse(res, 'Successfully enrolled in course', enrollment, 201);
  } catch (error) {
    next(error);
  }
};

const unenrollStudent = async (req, res, next) => {
  try {
    const result = await courseService.unenrollStudent(req.params.id, req.user._id);
    return successResponse(res, result.message, null);
  } catch (error) {
    next(error);
  }
};

const getMyEnrolledCourses = async (req, res, next) => {
  try {
    const enrollments = await courseService.getStudentEnrollments(req.user._id);
    return successResponse(res, 'Enrolled courses retrieved successfully', enrollments);
  } catch (error) {
    next(error);
  }
};

const getMyTaughtCourses = async (req, res, next) => {
  try {
    const courses = await courseService.getFacultyCourses(req.user._id);
    return successResponse(res, 'Taught courses retrieved successfully', courses);
  } catch (error) {
    next(error);
  }
};

const getCourseStudents = async (req, res, next) => {
  try {
    const students = await courseService.getCourseStudents(req.params.id, req.user);
    return successResponse(res, 'Enrolled students retrieved successfully', students);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  publishCourse,
  archiveCourse,
  deleteCourse,
  enrollStudent,
  unenrollStudent,
  getMyEnrolledCourses,
  getMyTaughtCourses,
  getCourseStudents
};

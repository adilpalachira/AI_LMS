const Course = require('../models/course.model');
const Enrollment = require('../models/enrollment.model');
const User = require('../models/user.model');
const Category = require('../models/category.model');

/**
 * Query courses with search, filters, pagination, and sorting
 */
const queryCourses = async (queryParams, currentUser) => {
  const {
    search,
    category,
    level,
    status,
    instructor,
    page = 1,
    limit = 9,
    sortBy = 'newest'
  } = queryParams;

  const query = {};

  // 1. Role-based Visibility Rules
  if (!currentUser || currentUser.role === 'Student') {
    // Public / Students can ONLY see Published courses
    query.status = 'Published';
  } else if (currentUser.role === 'Faculty') {
    // Faculty sees Published courses OR courses they own/teach unless specific status requested
    if (status) {
      query.status = status;
    }
  } else if (currentUser.role === 'Admin') {
    // Admin can filter by any status if provided
    if (status && status !== 'All') {
      query.status = status;
    }
  }

  // 2. Category Filter (Matches ID or Slug)
  if (category && category !== 'All') {
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      query.category = category;
    } else {
      const catObj = await Category.findOne({ slug: category });
      if (catObj) {
        query.category = catObj._id;
      }
    }
  }

  // 3. Level Filter
  if (level && level !== 'All') {
    query.level = level;
  }

  // 4. Instructor Filter
  if (instructor && instructor !== 'All') {
    if (instructor.match(/^[0-9a-fA-F]{24}$/)) {
      query.instructor = instructor;
    }
  }

  // 5. Search Filter (by title, code, or description)
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
      { shortDescription: { $regex: search, $options: 'i' } }
    ];
  }

  // 6. Pagination Calculations
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  // 7. Sorting Logic
  let sort = {};
  if (sortBy === 'oldest') {
    sort = { createdAt: 1 };
  } else if (sortBy === 'alphabetical') {
    sort = { title: 1 };
  } else if (sortBy === 'popular') {
    sort = { enrolledCount: -1 };
  } else {
    sort = { createdAt: -1 }; // newest default
  }

  // 8. Execute Query
  const courses = await Course.find(query)
    .populate('category', 'name slug icon')
    .populate('instructor', 'name email profileImage role')
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  const totalCourses = await Course.countDocuments(query);

  return {
    courses,
    pagination: {
      totalCourses,
      totalPages: Math.ceil(totalCourses / limitNum),
      currentPage: pageNum,
      limit: limitNum
    }
  };
};

/**
 * Fetch course details by ID or Slug
 */
const getCourseById = async (identifier, currentUser) => {
  let query = {};
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    query._id = identifier;
  } else {
    query.slug = identifier;
  }

  const course = await Course.findOne(query)
    .populate('category', 'name slug icon description')
    .populate('instructor', 'name email phone profileImage role')
    .populate('createdBy', 'name email role');

  if (!course) {
    throw new Error('Course not found');
  }

  // Check visibility for non-admin/non-assigned users if course is not Published
  if (course.status !== 'Published') {
    if (!currentUser) {
      throw new Error('Course not found');
    }
    const isOwner = course.instructor._id.toString() === currentUser._id.toString() ||
                    course.createdBy._id.toString() === currentUser._id.toString();
    if (currentUser.role !== 'Admin' && !isOwner) {
      throw new Error('You do not have permission to view this unpublished course');
    }
  }

  // Check enrollment status if current user is Student
  let isEnrolled = false;
  let enrollmentData = null;
  if (currentUser && currentUser.role === 'Student') {
    enrollmentData = await Enrollment.findOne({
      student: currentUser._id,
      course: course._id
    });
    isEnrolled = !!enrollmentData;
  }

  const courseObj = course.toObject();
  courseObj.isEnrolled = isEnrolled;
  courseObj.enrollment = enrollmentData;

  return courseObj;
};

/**
 * Create a new course
 */
const createCourse = async (courseData, currentUser) => {
  // If Faculty creates a course, they are automatically assigned as instructor unless specified
  let assignedInstructor = courseData.instructor;
  if (!assignedInstructor || currentUser.role === 'Faculty') {
    assignedInstructor = currentUser._id;
  }

  // Convert comma separated strings for tags/outcomes/prerequisites if sent as strings
  const formattedData = {
    ...courseData,
    instructor: assignedInstructor,
    createdBy: currentUser._id,
    tags: Array.isArray(courseData.tags)
      ? courseData.tags
      : (courseData.tags || '').split(',').map(s => s.trim()).filter(Boolean),
    learningOutcomes: Array.isArray(courseData.learningOutcomes)
      ? courseData.learningOutcomes
      : (courseData.learningOutcomes || '').split(',').map(s => s.trim()).filter(Boolean),
    prerequisites: Array.isArray(courseData.prerequisites)
      ? courseData.prerequisites
      : (courseData.prerequisites || '').split(',').map(s => s.trim()).filter(Boolean)
  };

  const course = await Course.create(formattedData);
  return await getCourseById(course._id.toString(), currentUser);
};

/**
 * Helper to check course edit permission
 */
const checkCoursePermission = (course, currentUser) => {
  if (currentUser.role === 'Admin') return true;
  const isInstructor = course.instructor.toString() === currentUser._id.toString();
  const isCreator = course.createdBy.toString() === currentUser._id.toString();
  if (currentUser.role === 'Faculty' && (isInstructor || isCreator)) return true;
  return false;
};

/**
 * Update course details
 */
const updateCourse = async (id, updateData, currentUser) => {
  const course = await Course.findById(id);
  if (!course) {
    throw new Error('Course not found');
  }

  if (!checkCoursePermission(course, currentUser)) {
    throw new Error('Unauthorized to update this course');
  }

  // Format array fields if passed
  if (updateData.tags !== undefined) {
    updateData.tags = Array.isArray(updateData.tags)
      ? updateData.tags
      : String(updateData.tags).split(',').map(s => s.trim()).filter(Boolean);
  }
  if (updateData.learningOutcomes !== undefined) {
    updateData.learningOutcomes = Array.isArray(updateData.learningOutcomes)
      ? updateData.learningOutcomes
      : String(updateData.learningOutcomes).split(',').map(s => s.trim()).filter(Boolean);
  }
  if (updateData.prerequisites !== undefined) {
    updateData.prerequisites = Array.isArray(updateData.prerequisites)
      ? updateData.prerequisites
      : String(updateData.prerequisites).split(',').map(s => s.trim()).filter(Boolean);
  }

  Object.assign(course, updateData);
  await course.save();

  return await getCourseById(course._id.toString(), currentUser);
};

/**
 * Update course status (Draft, Published, Archived)
 */
const updateCourseStatus = async (id, newStatus, currentUser) => {
  const course = await Course.findById(id);
  if (!course) {
    throw new Error('Course not found');
  }

  if (!checkCoursePermission(course, currentUser)) {
    throw new Error('Unauthorized to change status for this course');
  }

  course.status = newStatus;
  await course.save();
  return course;
};

/**
 * Delete a course
 */
const deleteCourse = async (id, currentUser) => {
  const course = await Course.findById(id);
  if (!course) {
    throw new Error('Course not found');
  }

  if (!checkCoursePermission(course, currentUser)) {
    throw new Error('Unauthorized to delete this course');
  }

  // Delete associated enrollments
  await Enrollment.deleteMany({ course: id });
  await Course.findByIdAndDelete(id);

  return { success: true, message: 'Course and related enrollments deleted successfully' };
};

/**
 * Enroll a student in a course
 */
const enrollStudent = async (courseId, studentId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  if (course.status !== 'Published') {
    throw new Error('Cannot enroll in a course that is not published');
  }

  const existing = await Enrollment.findOne({ student: studentId, course: courseId });
  if (existing) {
    throw new Error('You are already enrolled in this course');
  }

  const enrollment = await Enrollment.create({
    student: studentId,
    course: courseId,
    status: 'Active',
    progress: 0
  });

  // Increment course enrolledCount
  course.enrolledCount += 1;
  await course.save();

  return enrollment;
};

/**
 * Unenroll a student from a course
 */
const unenrollStudent = async (courseId, studentId) => {
  const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
  if (!enrollment) {
    throw new Error('No active enrollment found for this course');
  }

  await Enrollment.findByIdAndDelete(enrollment._id);

  // Decrement course enrolledCount safely
  const course = await Course.findById(courseId);
  if (course && course.enrolledCount > 0) {
    course.enrolledCount -= 1;
    await course.save();
  }

  return { success: true, message: 'Successfully unenrolled from course' };
};

/**
 * Get courses enrolled by a student
 */
const getStudentEnrollments = async (studentId) => {
  const enrollments = await Enrollment.find({ student: studentId })
    .populate({
      path: 'course',
      populate: [
        { path: 'category', select: 'name slug icon' },
        { path: 'instructor', select: 'name email profileImage' }
      ]
    })
    .sort({ createdAt: -1 });

  return enrollments;
};

/**
 * Get courses taught by a faculty member
 */
const getFacultyCourses = async (facultyId) => {
  return await Course.find({
    $or: [{ instructor: facultyId }, { createdBy: facultyId }]
  })
    .populate('category', 'name slug icon')
    .sort({ createdAt: -1 });
};

/**
 * Get enrolled students for a specific course (Faculty/Admin)
 */
const getCourseStudents = async (courseId, currentUser) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  if (!checkCoursePermission(course, currentUser)) {
    throw new Error('Unauthorized to view enrolled students for this course');
  }

  return await Enrollment.find({ course: courseId })
    .populate('student', 'name email phone profileImage status createdAt')
    .sort({ enrollmentDate: -1 });
};

module.exports = {
  queryCourses,
  getCourseById,
  createCourse,
  updateCourse,
  updateCourseStatus,
  deleteCourse,
  enrollStudent,
  unenrollStudent,
  getStudentEnrollments,
  getFacultyCourses,
  getCourseStudents
};

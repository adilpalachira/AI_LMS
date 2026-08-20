const User = require('../models/user.model');
const Enrollment = require('../models/enrollment.model');
const Course = require('../models/course.model');
const StudyPlan = require('../models/studyPlan.model');
const StudyPlanTask = require('../models/studyPlanTask.model');
const Assignment = require('../models/assignment.model');
const Submission = require('../models/submission.model');
const userService = require('../services/user.service');
const { hashPassword, comparePassword } = require('../services/password.service');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Retrieve profile of logged in user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    return successResponse(res, 'Profile retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update profile of logged in user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    if (req.file) {
      user.profileImage = req.file.path;
    }

    await user.save();
    return successResponse(res, 'Profile updated successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Password updated successfully
 */
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid current password', 400);
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    return successResponse(res, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN USER MANAGEMENT ENDPOINTS
// ==========================================

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with filtering, sorting, pagination (Admin only)
 *     tags: [Admin User Management]
 *     security:
 *       - bearerAuth: []
 */
const getUsers = async (req, res, next) => {
  try {
    const result = await userService.queryUsers(req.query);
    return successResponse(res, 'Users retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user details by ID (Admin only)
 *     tags: [Admin User Management]
 *     security:
 *       - bearerAuth: []
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return successResponse(res, 'User details retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Admin User Management]
 *     security:
 *       - bearerAuth: []
 */
const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    return successResponse(res, 'User created successfully', user, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user details by ID (Admin only)
 *     tags: [Admin User Management]
 *     security:
 *       - bearerAuth: []
 */
const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    return successResponse(res, 'User updated successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user by ID (Admin only)
 *     tags: [Admin User Management]
 *     security:
 *       - bearerAuth: []
 */
const deleteUser = async (req, res, next) => {
  try {
    const result = await userService.deleteUser(req.params.id, req.user.id);
    return successResponse(res, result.message, null);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Update user account activation status (Admin only)
 *     tags: [Admin User Management]
 *     security:
 *       - bearerAuth: []
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const user = await userService.updateStatus(req.params.id, status, req.user.id);
    return successResponse(res, `User status updated to '${status}' successfully`, user);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Update user role (Admin only)
 *     tags: [Admin User Management]
 *     security:
 *       - bearerAuth: []
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await userService.updateRole(req.params.id, role, req.user.id);
    return successResponse(res, `User role updated to '${role}' successfully`, user);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}/reset-password:
 *   patch:
 *     summary: Reset user password (Admin only)
 *     tags: [Admin User Management]
 *     security:
 *       - bearerAuth: []
 */
const resetUserPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const result = await userService.resetPassword(req.params.id, password);
    return successResponse(res, result.message, null);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/dashboard-summary
 * Get dynamic dashboard data for student or faculty/admin
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const userRole = req.user.role;

    if (userRole === 'Student') {
      // 1. Enrollments
      const enrollments = await Enrollment.find({ student: userId, status: 'Active' })
        .populate('course', 'title code category thumbnail shortDescription')
        .sort({ updatedAt: -1 });

      const courseIds = enrollments.map(e => e.course?._id).filter(Boolean);

      // 2. Study Plans & Tasks
      const studyPlans = await StudyPlan.find({ studentId: userId, status: { $ne: 'Archived' } })
        .populate('courseId', 'title code')
        .sort({ createdAt: -1 });

      const planIds = studyPlans.map(p => p._id);
      const pendingTasks = await StudyPlanTask.find({
        studyPlanId: { $in: planIds },
        status: { $in: ['Pending', 'In-Progress', 'Rescheduled'] }
      }).sort({ date: 1, order: 1 });

      const completedTasks = await StudyPlanTask.find({
        studyPlanId: { $in: planIds },
        status: 'Completed'
      }).sort({ completedAt: -1 }).limit(10);

      // 3. Assignments & Submissions
      const assignments = await Assignment.find({ courseId: { $in: courseIds }, status: 'Published' })
        .populate('courseId', 'title code')
        .sort({ deadline: 1 });

      const submissions = await Submission.find({ studentId: userId });
      const submittedAssignmentIds = submissions.map(s => s.assignmentId ? s.assignmentId.toString() : '');

      const unsubmittedAssignments = assignments.filter(a => !submittedAssignmentIds.includes(a._id.toString()));

      // Today's Focus / Topic
      let todayTopic = null;
      if (pendingTasks.length > 0) {
        const topTask = pendingTasks[0];
        const parentPlan = studyPlans.find(p => p._id.toString() === topTask.studyPlanId.toString());
        todayTopic = {
          courseTitle: parentPlan?.courseId?.title || 'Study Course',
          unitTitle: topTask.topic || parentPlan?.courseId?.code || 'Current Module',
          title: topTask.title,
          description: topTask.description || 'Focus on completing today\'s daily task.',
          estimatedMinutes: topTask.durationMinutes || 45,
          progressPercentage: parentPlan?.progressPercentage || 0
        };
      } else if (enrollments.length > 0) {
        const firstCourse = enrollments[0].course;
        todayTopic = {
          courseTitle: firstCourse?.title || 'Enrolled Course',
          unitTitle: firstCourse?.code || 'Unit 1',
          title: firstCourse?.title ? `Learning ${firstCourse.title}` : 'Continue Coursework',
          description: firstCourse?.shortDescription || 'Review active modules and lessons.',
          estimatedMinutes: 45,
          progressPercentage: enrollments[0].progress || 0
        };
      }

      // Next Exam / Exam Countdown
      let nextExam = null;
      const plansWithExam = studyPlans.filter(p => p.examDate && new Date(p.examDate) >= new Date())
        .sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

      if (plansWithExam.length > 0) {
        const plan = plansWithExam[0];
        const diffMs = new Date(plan.examDate).getTime() - new Date().getTime();
        const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        nextExam = {
          title: plan.title || `${plan.courseId?.title || 'Course'} Assessment`,
          date: new Date(plan.examDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
          daysLeft,
          courseCode: plan.courseId?.code || ''
        };
      } else if (unsubmittedAssignments.length > 0) {
        const nextAss = unsubmittedAssignments[0];
        const diffMs = new Date(nextAss.deadline).getTime() - new Date().getTime();
        const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        nextExam = {
          title: `Assignment: ${nextAss.title}`,
          date: new Date(nextAss.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
          daysLeft,
          courseCode: nextAss.courseId?.code || ''
        };
      }

      // Pending Works Checklist
      const pendingWorks = [];
      unsubmittedAssignments.slice(0, 3).forEach((ass) => {
        const diffMs = new Date(ass.deadline).getTime() - new Date().getTime();
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        pendingWorks.push({
          id: `ass_${ass._id}`,
          type: 'Assignment',
          title: ass.title,
          subject: ass.courseId?.title || 'Course Assignment',
          due: daysLeft <= 1 ? 'Due Soon' : `Due in ${daysLeft} days`,
          priority: daysLeft <= 2 ? 'High' : 'Medium',
          color: daysLeft <= 2 ? 'text-red-600 bg-red-50 border-red-200' : 'text-amber-600 bg-amber-50 border-amber-200'
        });
      });

      pendingTasks.slice(0, 5 - pendingWorks.length).forEach((task) => {
        const parentPlan = studyPlans.find(p => p._id.toString() === task.studyPlanId.toString());
        pendingWorks.push({
          id: `task_${task._id}`,
          type: 'Study Task',
          title: task.title,
          subject: parentPlan?.courseId?.title || 'Personal Study',
          due: new Date(task.date).toLocaleDateString(),
          priority: task.priority || 'Medium',
          color: task.priority === 'High' ? 'text-red-600 bg-red-50 border-red-200' : task.priority === 'Medium' ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-green-600 bg-green-50 border-green-200'
        });
      });

      // Today's Schedule Timeline
      const todayStr = new Date().toDateString();
      const todaysTasks = pendingTasks.filter(t => new Date(t.date).toDateString() === todayStr);
      const scheduleTasks = todaysTasks.length > 0 ? todaysTasks : pendingTasks.slice(0, 4);

      const scheduleColors = ['border-blue-600', 'border-emerald-600', 'border-amber-600', 'border-purple-600'];
      const schedule = scheduleTasks.map((t, idx) => {
        const parentPlan = studyPlans.find(p => p._id.toString() === t.studyPlanId.toString());
        return {
          id: t._id,
          time: `Session ${idx + 1}`,
          duration: `${t.durationMinutes || 45}m`,
          title: t.title,
          detail: parentPlan?.courseId?.title || t.topic || 'Daily Learning Session',
          color: scheduleColors[idx % scheduleColors.length]
        };
      });

      // Upcoming Exams List
      const upcomingExams = plansWithExam.slice(0, 3).map(plan => {
        const diffMs = new Date(plan.examDate).getTime() - new Date().getTime();
        const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        return {
          title: plan.title || `${plan.courseId?.title} Exam`,
          date: new Date(plan.examDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
          time: '10:00 AM',
          daysLeft
        };
      });

      // Recent Activity Log
      const activities = [];
      completedTasks.slice(0, 3).forEach(task => {
        activities.push({
          id: `comp_${task._id}`,
          text: `Completed: ${task.title}`,
          time: task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'Recently',
          iconColor: 'text-green-600 bg-green-50 border-green-100'
        });
      });
      submissions.slice(0, 3 - activities.length).forEach(sub => {
        activities.push({
          id: `sub_${sub._id}`,
          text: `Submitted assignment`,
          time: new Date(sub.createdAt).toLocaleDateString(),
          iconColor: 'text-purple-600 bg-purple-50 border-purple-100'
        });
      });
      enrollments.slice(0, 3 - activities.length).forEach(enr => {
        activities.push({
          id: `enr_${enr._id}`,
          text: `Enrolled in ${enr.course?.title || 'a course'}`,
          time: new Date(enr.createdAt || Date.now()).toLocaleDateString(),
          iconColor: 'text-blue-600 bg-blue-50 border-blue-100'
        });
      });

      return successResponse(res, 'Student dashboard summary retrieved successfully', {
        user: { name: req.user.name, role: req.user.role },
        todayTopic,
        nextExam,
        pendingWorks,
        schedule,
        upcomingExams,
        activities,
        stats: {
          enrolledCoursesCount: enrollments.length,
          activeStudyPlansCount: studyPlans.length,
          pendingTasksCount: pendingTasks.length,
          completedTasksCount: completedTasks.length
        }
      });
    } else if (req.user.role === 'Faculty') {
      // Faculty summary: ONLY courses taught/created by this specific faculty member
      const facultyCourses = await Course.find({
        $or: [{ instructor: req.user._id }, { createdBy: req.user._id }]
      }).populate('category', 'name icon');

      const facultyCourseIds = facultyCourses.map(c => c._id);
      const uniqueStudents = await Enrollment.distinct('student', { course: { $in: facultyCourseIds } });
      const facultyAssignments = await Assignment.distinct('_id', { course: { $in: facultyCourseIds } });
      const pendingSubmissionsCount = await Submission.countDocuments({
        assignment: { $in: facultyAssignments },
        status: 'Submitted'
      });

      return successResponse(res, 'Faculty dashboard summary retrieved successfully', {
        user: { name: req.user.name, role: req.user.role },
        stats: {
          totalCourses: facultyCourses.length,
          totalStudents: uniqueStudents.length,
          pendingSubmissionsCount
        },
        myCourses: facultyCourses,
        todayTopic: null,
        nextExam: null,
        pendingWorks: [],
        schedule: [],
        upcomingExams: [],
        activities: []
      });
    } else {
      // Admin role summary
      const Category = require('../models/category.model');
      const mongoose = require('mongoose');

      const totalUsers = await User.countDocuments();
      const studentCount = await User.countDocuments({ role: 'Student' });
      const facultyCount = await User.countDocuments({ role: 'Faculty' });
      const adminCount = await User.countDocuments({ role: 'Admin' });

      const totalCourses = await Course.countDocuments();
      const publishedCourses = await Course.countDocuments({ status: 'Published' });
      const draftCourses = await Course.countDocuments({ status: 'Draft' });

      const totalCategories = await Category.countDocuments();
      const totalEnrollments = await Enrollment.countDocuments();
      const pendingSubmissionsCount = await Submission.countDocuments({ status: 'Submitted' });

      // Recent Users
      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role status createdAt');

      // Recent Courses
      const recentCourses = await Course.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('category', 'name')
        .populate('instructor', 'name');

      // System Stats
      const systemInfo = {
        nodeVersion: process.version,
        platform: process.platform,
        dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        dbHost: mongoose.connection.host || 'localhost',
        memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
      };

      return successResponse(res, 'Admin dashboard summary retrieved successfully', {
        user: { name: req.user.name, role: req.user.role },
        stats: {
          totalUsers,
          studentCount,
          facultyCount,
          adminCount,
          totalCourses,
          publishedCourses,
          draftCourses,
          totalCategories,
          totalEnrollments,
          pendingSubmissionsCount
        },
        recentUsers,
        recentCourses,
        systemInfo,
        todayTopic: null,
        nextExam: null,
        pendingWorks: [],
        schedule: [],
        upcomingExams: [],
        activities: []
      });
    }

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  updateUserRole,
  resetUserPassword,
  getDashboardSummary
};


const StudyPlan = require('../models/studyPlan.model');
const StudyPlanTask = require('../models/studyPlanTask.model');
const Course = require('../models/course.model');
const Lesson = require('../models/lesson.model');
const Quiz = require('../models/quiz.model');
const Assignment = require('../models/assignment.model');
const Enrollment = require('../models/enrollment.model');
const QuizAttempt = require('../models/quizAttempt.model');
const Submission = require('../models/submission.model');
const { generateCompletion } = require('./ai/openai.service');
const { getOrCreateProfile } = require('./personalization.service');

/**
 * Recalculate and update the progress percentage for a study plan
 * @param {string} studyPlanId 
 */
const recalculatePlanProgress = async (studyPlanId) => {
  const plan = await StudyPlan.findById(studyPlanId);
  if (!plan) return null;

  const tasks = await StudyPlanTask.find({ studyPlanId });
  const activeTasks = tasks.filter(t => t.status !== 'Skipped');
  const completedTasks = tasks.filter(t => t.status === 'Completed');

  const totalTasksCount = activeTasks.length;
  const completedTasksCount = completedTasks.length;
  const progressPercentage = totalTasksCount > 0
    ? Math.min(100, Math.round((completedTasksCount / totalTasksCount) * 100))
    : 0;

  plan.totalTasksCount = tasks.length;
  plan.completedTasksCount = completedTasksCount;
  plan.progressPercentage = progressPercentage;

  if (progressPercentage === 100 && totalTasksCount > 0) {
    plan.status = 'Completed';
  }

  await plan.save();
  return plan;
};

/**
 * Generate an AI Study Plan with daily task allocations based on course content & student progress
 * @param {Object} params { studentId, courseId, startDate, examDate, availableHoursPerDay, preferredStudyTime, learningGoal }
 */
const generateStudyPlan = async ({
  studentId,
  courseId,
  startDate,
  examDate,
  availableHoursPerDay = 2,
  preferredStudyTime = 'Evening',
  learningGoal = ''
}) => {
  // 1. Fetch Course details
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error('Selected course not found');
  }

  // 2. Date parsing and validation
  const start = startDate ? new Date(startDate) : new Date();
  start.setHours(0, 0, 0, 0);

  const end = examDate ? new Date(examDate) : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  end.setHours(23, 59, 59, 999);

  if (isNaN(start.getTime())) {
    throw new Error('Invalid start date format');
  }
  if (isNaN(end.getTime())) {
    throw new Error('Invalid exam/end date format');
  }
  if (end.getTime() < start.getTime()) {
    throw new Error('Exam / end date must be on or after the start date.');
  }

  const hoursPerDay = Number(availableHoursPerDay);
  if (isNaN(hoursPerDay) || hoursPerDay <= 0 || hoursPerDay > 16) {
    throw new Error('Available study hours must be between 0.5 and 16 hours per day.');
  }

  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const dailyCapacityMins = Math.round(hoursPerDay * 60);

  // 3. Fetch Course Content
  const lessons = await Lesson.find({ courseId }).sort({ order: 1 }).lean();
  const quizzes = await Quiz.find({ courseId, status: 'Published' }).lean();
  const assignments = await Assignment.find({ courseId }).lean();

  // 4. Fetch Student Progress & Performance
  const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
  const profile = await getOrCreateProfile(studentId);
  const quizAttempts = await QuizAttempt.find({ studentId, courseId }).lean();
  const submissions = await Submission.find({ studentId, courseId }).lean();

  const completedLessonIds = new Set(enrollment?.completedLessons?.map(id => id.toString()) || []);
  const completedQuizIds = new Set(quizAttempts.filter(a => a.scorePercentage >= 70).map(a => a.quizId.toString()));

  const uncompletedLessons = lessons.filter(l => !completedLessonIds.has(l._id.toString()));
  const completedLessons = lessons.filter(l => completedLessonIds.has(l._id.toString()));

  const courseWeakTopics = profile.weakTopics
    .filter(w => !w.courseId || w.courseId.toString() === courseId.toString())
    .map(w => w.topic);

  const weakTopicsStr = courseWeakTopics.length > 0 ? courseWeakTopics.join(', ') : 'None identified yet';
  const uncompletedLessonTitles = uncompletedLessons.map(l => l.title).join(', ') || 'All curriculum lessons completed';
  const quizTitles = quizzes.map(q => q.title).join(', ') || 'No active quizzes';
  const assignmentTitles = assignments.map(a => a.title).join(', ') || 'No pending assignments';

  // 5. Construct AI Prompt with Curriculum & Progress Context
  const promptMessages = [
    {
      role: 'system',
      content: `You are an expert academic AI Study Planner for an advanced LMS.
Generate a realistic, balanced day-by-day JSON study plan for a student based on actual course curriculum, progress, and study capacity.

Strict Rules:
1. Return ONLY valid JSON with no extra commentary or markdown backticks outside of the JSON block.
2. Structure JSON as:
{
  "title": "Study Plan Title",
  "tasks": [
    {
      "dayOffset": 0,
      "title": "Task title",
      "description": "Action item description",
      "topic": "Topic name",
      "resourceType": "Lesson" | "Quiz" | "Assignment" | "Revision" | "General",
      "durationMinutes": 45,
      "priority": "High" | "Medium" | "Low"
    }
  ]
}
3. "dayOffset" must be an integer between 0 and ${totalDays - 1}.
4. Total durationMinutes of all tasks for any single day MUST NOT exceed ${dailyCapacityMins} minutes.
5. Prioritize uncompleted lessons and weak topics. Schedule quiz practice and assignment prep.`
    },
    {
      role: 'user',
      content: `Course: ${course.title} (${course.code})
Study Period: ${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]} (${totalDays} total days)
Daily Study Hours: ${hoursPerDay} hrs/day (${dailyCapacityMins} mins/day max)
Preferred Time: ${preferredStudyTime}
Learning Goal: ${learningGoal || 'Master course materials and excel in upcoming assessments'}

Course Content:
- Uncompleted Lessons: ${uncompletedLessonTitles}
- Quizzes: ${quizTitles}
- Assignments: ${assignmentTitles}
- Weak Topics Needing Revision: ${weakTopicsStr}
- Current Progress: ${enrollment ? enrollment.progress : 0}% (${completedLessons.length} of ${lessons.length} lessons completed)`
    }
  ];

  let parsedPlan = null;
  try {
    const aiResponseText = await generateCompletion(promptMessages, { temperature: 0.3 });
    if (aiResponseText) {
      const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedPlan = JSON.parse(jsonMatch[0]);
      }
    }
  } catch (err) {
    console.log('[StudyPlanner Service] AI generation unavailable/failed. Falling back to algorithmic plan generator.');
  }

  // 6. Algorithmic Fallback Schedule Generator
  if (!parsedPlan || !Array.isArray(parsedPlan.tasks) || parsedPlan.tasks.length === 0) {
    const fallbackTasks = [];
    let lessonIndex = 0;
    let quizIndex = 0;
    let assignmentIndex = 0;
    let weakIndex = 0;

    for (let day = 0; day < totalDays; day++) {
      let dayMins = 0;

      // 1. Weak topic revision on early days
      if (courseWeakTopics.length > 0 && weakIndex < courseWeakTopics.length && dayMins + 45 <= dailyCapacityMins) {
        const topic = courseWeakTopics[weakIndex++];
        fallbackTasks.push({
          dayOffset: day,
          title: `Revise Weak Topic: ${topic}`,
          description: `Targeted review session to reinforce understanding of ${topic}.`,
          topic,
          resourceType: 'Revision',
          durationMinutes: 45,
          priority: 'High'
        });
        dayMins += 45;
      }

      // 2. Uncompleted lessons sequentially
      while (lessonIndex < uncompletedLessons.length && dayMins + 45 <= dailyCapacityMins) {
        const les = uncompletedLessons[lessonIndex++];
        fallbackTasks.push({
          dayOffset: day,
          title: `Study Lesson: ${les.title}`,
          description: les.description || `Study materials and video notes for ${les.title}.`,
          topic: les.title,
          resourceType: 'Lesson',
          durationMinutes: 45,
          priority: 'High'
        });
        dayMins += 45;
      }

      // 3. Assignment prep if capacity remains
      if (assignmentIndex < assignments.length && dayMins + 45 <= dailyCapacityMins) {
        const assign = assignments[assignmentIndex++];
        fallbackTasks.push({
          dayOffset: day,
          title: `Assignment Work: ${assign.title}`,
          description: `Review requirements and prepare submission for ${assign.title}.`,
          topic: assign.title,
          resourceType: 'Assignment',
          durationMinutes: 45,
          priority: 'Medium'
        });
        dayMins += 45;
      }

      // 4. Quiz practice if capacity remains
      if (quizIndex < quizzes.length && dayMins + 30 <= dailyCapacityMins) {
        const quiz = quizzes[quizIndex++];
        fallbackTasks.push({
          dayOffset: day,
          title: `Practice Quiz: ${quiz.title}`,
          description: `Attempt practice quiz questions for ${quiz.title}.`,
          topic: quiz.title,
          resourceType: 'Quiz',
          durationMinutes: 30,
          priority: 'Medium'
        });
        dayMins += 30;
      }

      // 5. Final review on last days
      if (day >= totalDays - 2 && dayMins + 45 <= dailyCapacityMins) {
        fallbackTasks.push({
          dayOffset: day,
          title: `Final Course Review & Mock Test`,
          description: `Comprehensive exam preparation review covering core concepts of ${course.title}.`,
          topic: 'Course Review',
          resourceType: 'Revision',
          durationMinutes: Math.min(60, dailyCapacityMins - dayMins || 45),
          priority: 'High'
        });
      }
    }

    parsedPlan = {
      title: `${course.code} - ${learningGoal ? learningGoal.slice(0, 30) : 'Personalized Study Plan'}`,
      tasks: fallbackTasks
    };
  }

  // Archive any existing active study plans for this student and course
  await StudyPlan.updateMany(
    { studentId, courseId, status: 'Active' },
    { $set: { status: 'Archived' } }
  );

  // 7. Save StudyPlan to MongoDB
  const planTitle = parsedPlan.title || `${course.code} - Personalized Study Plan`;
  const studyPlan = await StudyPlan.create({
    studentId,
    courseId,
    title: planTitle,
    startDate: start,
    examDate: end,
    availableHoursPerDay: hoursPerDay,
    preferredStudyTime,
    learningGoal: learningGoal || '',
    progressPercentage: 0,
    totalTasksCount: 0,
    completedTasksCount: 0,
    status: 'Active'
  });

  // 8. Save StudyPlanTask documents to MongoDB
  const validResourceTypes = ['Lesson', 'Quiz', 'Assignment', 'Revision', 'AI Tutor', 'General'];
  const validPriorities = ['High', 'Medium', 'Low'];

  const taskDocs = (parsedPlan.tasks || []).map((t, idx) => {
    const taskOffset = typeof t.dayOffset === 'number' ? Math.max(0, Math.min(totalDays - 1, t.dayOffset)) : (idx % totalDays);
    const taskDate = new Date(start);
    taskDate.setDate(start.getDate() + taskOffset);

    return {
      studyPlanId: studyPlan._id,
      date: taskDate,
      title: t.title || `Study Task ${idx + 1}`,
      description: t.description || `Study session for ${course.code}`,
      topic: t.topic || 'General',
      resourceType: validResourceTypes.includes(t.resourceType) ? t.resourceType : 'General',
      durationMinutes: typeof t.durationMinutes === 'number' && t.durationMinutes > 0 ? t.durationMinutes : 45,
      priority: validPriorities.includes(t.priority) ? t.priority : 'Medium',
      status: 'Pending',
      order: idx
    };
  });

  if (taskDocs.length > 0) {
    await StudyPlanTask.insertMany(taskDocs);
  }

  studyPlan.totalTasksCount = taskDocs.length;
  await studyPlan.save();

  return {
    studyPlan,
    tasks: taskDocs
  };
};

/**
 * Reschedule a study plan task to a new target date
 */
const rescheduleTask = async (taskId, studentId, newDate) => {
  const task = await StudyPlanTask.findById(taskId).populate('studyPlanId');
  if (!task) {
    throw new Error('Study task not found');
  }

  if (task.studyPlanId.studentId.toString() !== studentId.toString()) {
    throw new Error('Unauthorized task access');
  }

  const targetDate = new Date(newDate);
  if (isNaN(targetDate.getTime())) {
    throw new Error('Invalid new date format');
  }

  task.date = targetDate;
  task.status = 'Rescheduled';
  await task.save();

  await recalculatePlanProgress(task.studyPlanId._id);

  return task;
};

/**
 * Update task status (Pending, In-Progress, Completed, Skipped)
 */
const updateTaskStatus = async (taskId, studentId, status) => {
  const task = await StudyPlanTask.findById(taskId).populate('studyPlanId');
  if (!task) {
    throw new Error('Study task not found');
  }

  if (task.studyPlanId.studentId.toString() !== studentId.toString()) {
    throw new Error('Unauthorized task access');
  }

  const allowedStatuses = ['Pending', 'In-Progress', 'Completed', 'Skipped', 'Rescheduled'];
  if (!allowedStatuses.includes(status)) {
    throw new Error('Invalid task status');
  }

  task.status = status;
  if (status === 'Completed') {
    task.completedAt = new Date();
  } else {
    task.completedAt = undefined;
  }

  await task.save();
  const updatedPlan = await recalculatePlanProgress(task.studyPlanId._id);

  return {
    task,
    plan: updatedPlan
  };
};

module.exports = {
  generateStudyPlan,
  rescheduleTask,
  updateTaskStatus,
  recalculatePlanProgress
};

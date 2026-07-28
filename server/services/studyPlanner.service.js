const StudyPlan = require('../models/studyPlan.model');
const StudyPlanTask = require('../models/studyPlanTask.model');
const Course = require('../models/course.model');
const Lesson = require('../models/lesson.model');
const Quiz = require('../models/quiz.model');
const { generateCompletion } = require('./ai/openai.service');
const { getOrCreateProfile } = require('./personalization.service');

/**
 * Generate an AI Study Plan with daily task allocations
 * @param {Object} params { studentId, courseId, examDate, availableHoursPerDay, preferredStudyTime, learningGoal }
 */
const generateStudyPlan = async ({
  studentId,
  courseId,
  examDate,
  availableHoursPerDay = 2,
  preferredStudyTime = 'Evening',
  learningGoal = ''
}) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  const profile = await getOrCreateProfile(studentId);
  const lessons = await Lesson.find({ courseId }).sort({ order: 1 });
  const quizzes = await Quiz.find({ courseId, status: 'Published' });

  const targetExamDate = new Date(examDate);
  const today = new Date();
  const diffTime = targetExamDate.getTime() - today.getTime();
  const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const weakTopicsList = profile.weakTopics.map(w => w.topic).join(', ') || 'None specified';
  const lessonTitles = lessons.map(l => l.title).join(', ') || 'General Syllabus';

  // Construct Structured AI Prompt
  const promptMessages = [
    {
      role: 'system',
      content: `You are an expert AI Study Planner. Create a structured JSON study schedule for a student preparing for an exam.
Return ONLY valid JSON matching this schema:
{
  "title": "Study Plan Title",
  "tasks": [
    {
      "dayOffset": 0,
      "title": "Task title",
      "description": "Short action item description",
      "topic": "Topic name",
      "resourceType": "Lesson" | "Quiz" | "Revision" | "General",
      "durationMinutes": 60,
      "priority": "High" | "Medium" | "Low"
    }
  ]
}`
    },
    {
      role: 'user',
      content: `Course: ${course.title} (${course.code})
Days until exam: ${totalDays} days (Exam Date: ${targetExamDate.toISOString().split('T')[0]})
Daily study capacity: ${availableHoursPerDay} hours/day (${preferredStudyTime} preference)
Weak topics requiring emphasis: ${weakTopicsList}
Course Lessons: ${lessonTitles}
Learning Goal: ${learningGoal || 'Master course concepts and pass exam'}`
    }
  ];

  let aiResponseText = await generateCompletion(promptMessages, { temperature: 0.3 });

  let parsedPlan = null;
  try {
    const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsedPlan = JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.log('[StudyPlanner Service] JSON Parse warning, building programmatic fallback plan.');
  }

  // Programmatic Fallback if AI JSON parsing is unavailable or failed
  if (!parsedPlan || !Array.isArray(parsedPlan.tasks) || parsedPlan.tasks.length === 0) {
    const fallbackTasks = [];
    const numDaysToPlan = Math.min(totalDays, 14);

    for (let day = 0; day < numDaysToPlan; day++) {
      const dayDate = new Date();
      dayDate.setDate(today.getDate() + day);

      if (day === 0 && profile.weakTopics.length > 0) {
        fallbackTasks.push({
          dayOffset: 0,
          title: `Revise Weak Topic: ${profile.weakTopics[0].topic}`,
          description: `Dedicated review session to solidify weak concepts in ${profile.weakTopics[0].topic}.`,
          topic: profile.weakTopics[0].topic,
          resourceType: 'Revision',
          durationMinutes: Math.min(90, availableHoursPerDay * 60),
          priority: 'High'
        });
      } else {
        const lessonIdx = day % (lessons.length || 1);
        const lesson = lessons[lessonIdx];
        fallbackTasks.push({
          dayOffset: day,
          title: lesson ? `Study: ${lesson.title}` : `Syllabus Unit ${day + 1}`,
          description: lesson ? `Study lecture content and materials for ${lesson.title}` : `Complete course reading notes`,
          topic: lesson ? lesson.title : `Unit ${day + 1}`,
          resourceType: lesson ? 'Lesson' : 'General',
          durationMinutes: Math.min(60, availableHoursPerDay * 60),
          priority: 'Medium'
        });
      }
    }

    parsedPlan = {
      title: `${course.code} Exam Prep Plan`,
      tasks: fallbackTasks
    };
  }

  // Create StudyPlan record
  const studyPlan = await StudyPlan.create({
    studentId,
    courseId,
    title: parsedPlan.title || `${course.title} Exam Plan`,
    examDate: targetExamDate,
    availableHoursPerDay,
    preferredStudyTime,
    learningGoal,
    status: 'Active'
  });

  // Create StudyPlanTask records
  const taskDocs = parsedPlan.tasks.map((t, idx) => {
    const taskDate = new Date(today);
    taskDate.setDate(today.getDate() + (t.dayOffset || idx));

    return {
      studyPlanId: studyPlan._id,
      date: taskDate,
      title: t.title || `Task ${idx + 1}`,
      description: t.description || '',
      topic: t.topic || 'General',
      resourceType: ['Lesson', 'Quiz', 'Assignment', 'Revision', 'AI Tutor', 'General'].includes(t.resourceType) ? t.resourceType : 'General',
      durationMinutes: t.durationMinutes || 45,
      priority: ['High', 'Medium', 'Low'].includes(t.priority) ? t.priority : 'Medium',
      status: 'Pending',
      order: idx
    };
  });

  await StudyPlanTask.insertMany(taskDocs);

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

  task.date = new Date(newDate);
  task.status = 'Rescheduled';
  await task.save();

  return task;
};

module.exports = {
  generateStudyPlan,
  rescheduleTask
};

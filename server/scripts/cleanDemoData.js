require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');

// Import all models
const User = require('../models/user.model');
const Category = require('../models/category.model');
const Course = require('../models/course.model');
const CourseSection = require('../models/section.model');
const Lesson = require('../models/lesson.model');
const LearningMaterial = require('../models/material.model');
const KnowledgeDocument = require('../models/knowledgeDocument.model');
const Assignment = require('../models/assignment.model');
const Quiz = require('../models/quiz.model');
const Question = require('../models/question.model');
const Enrollment = require('../models/enrollment.model');
const Submission = require('../models/submission.model');
const QuizAttempt = require('../models/quizAttempt.model');
const StudyPlan = require('../models/studyPlan.model');
const StudyPlanTask = require('../models/studyPlanTask.model');
const LearningProfile = require('../models/learningProfile.model');
const LearningRecommendation = require('../models/learningRecommendation.model');
const ChatSession = require('../models/chatSession.model');
const ChatMessage = require('../models/chatMessage.model');

async function cleanDemoData() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-lms';
    await mongoose.connect(mongoUri);
    console.log('[Clean Script] Connected to MongoDB:', mongoUri);

    console.log('[Clean Script] Deleting all demo courses, assignments, quizzes, and learning data...');

    await Course.deleteMany({});
    await CourseSection.deleteMany({});
    await Lesson.deleteMany({});
    await LearningMaterial.deleteMany({});
    await KnowledgeDocument.deleteMany({});
    await Assignment.deleteMany({});
    await Submission.deleteMany({});
    await Quiz.deleteMany({});
    await Question.deleteMany({});
    await QuizAttempt.deleteMany({});
    await Enrollment.deleteMany({});
    await StudyPlan.deleteMany({});
    await StudyPlanTask.deleteMany({});
    await ChatSession.deleteMany({});
    await ChatMessage.deleteMany({});
    await LearningProfile.deleteMany({});
    await LearningRecommendation.deleteMany({});

    // Keep core system accounts (Admin, Faculty, Student) for logging in, delete all extra seeded demo users
    const demoEmailsToDelete = [
      'sarah.jenkins@lms.com',
      'robert.chen@lms.com',
      'alan.turing@lms.com',
      'emily.watson@lms.com',
      'maria.garcia@lms.com',
      'david.kim@lms.com',
      'fakefaculty@example.com'
    ];

    await User.deleteMany({ email: { $in: demoEmailsToDelete } });

    console.log('[Clean Script] Demo data successfully cleared!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Clean Script Error]:', err);
    process.exit(1);
  }
}

cleanDemoData();

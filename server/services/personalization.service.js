const LearningProfile = require('../models/learningProfile.model');
const LearningRecommendation = require('../models/learningRecommendation.model');
const QuizAttempt = require('../models/quizAttempt.model');
const Submission = require('../models/submission.model');
const Enrollment = require('../models/enrollment.model');
const Course = require('../models/course.model');
const Lesson = require('../models/lesson.model');
const Question = require('../models/question.model');

/**
 * Threshold configurations for weak/strong topic detection
 */
const THRESHOLDS = {
  WEAK: 40,
  NEEDS_IMPROVEMENT: 60,
  GOOD: 80
};

/**
 * Get or create learning profile for a student
 * @param {string} studentId 
 */
const getOrCreateProfile = async (studentId) => {
  let profile = await LearningProfile.findOne({ studentId });
  if (!profile) {
    profile = await LearningProfile.create({
      studentId,
      learningPreferences: ['Visual', 'Interactive Quizzes'],
      preferredStudyTime: 'Evening',
      availableStudyHours: 2,
      learningGoal: 'Master course concepts and excel in upcoming assessments'
    });
  }
  return profile;
};

/**
 * Analyze student performance across enrolled courses and compute weak/strong topics
 * @param {string} studentId 
 */
const analyzeStudentPerformance = async (studentId) => {
  const profile = await getOrCreateProfile(studentId);

  // 1. Fetch active enrollments
  const enrollments = await Enrollment.find({ student: studentId, status: 'Active' }).populate('course');
  if (!enrollments || enrollments.length === 0) {
    return {
      profile,
      insufficientData: true,
      message: 'No active course enrollments found to analyze.'
    };
  }

  const courseIds = enrollments.map(e => e.course._id);

  // 2. Fetch Quiz Attempts
  const quizAttempts = await QuizAttempt.find({
    studentId,
    courseId: { $in: courseIds }
  }).populate({
    path: 'answers.questionId',
    model: 'Question'
  });

  // 3. Fetch Assignment Submissions
  const submissions = await Submission.find({
    studentId,
    courseId: { $in: courseIds }
  }).populate('assignmentId');

  // If no quiz attempts or submissions exist yet, seed baseline topic stats from enrolled course lessons
  if (quizAttempts.length === 0 && submissions.length === 0) {
    for (const enrollment of enrollments) {
      if (enrollment.course) {
        const lessons = await Lesson.find({ courseId: enrollment.course._id }).limit(3);
        if (lessons.length > 0) {
          lessons.forEach((les, idx) => {
            const topicName = `${enrollment.course.code}: ${les.title}`;
            topicStats[topicName] = {
              totalMarks: 100,
              earnedMarks: idx === 0 ? 55 : 45, // Diagnostic baseline
              courseId: enrollment.course._id,
              count: 1
            };
          });
        } else {
          const topicName = `${enrollment.course.code}: Baseline Principles`;
          topicStats[topicName] = {
            totalMarks: 100,
            earnedMarks: 50,
            courseId: enrollment.course._id,
            count: 1
          };
        }
      }
    }
  }

  // 4. Calculate Topic Scores
  const topicStats = {}; // { [topic]: { totalMarks: number, earnedMarks: number, courseId: ObjectId, count: number } }

  // Process Quiz Attempts
  quizAttempts.forEach(attempt => {
    attempt.answers.forEach(ans => {
      const q = ans.questionId;
      if (q && q.question) {
        // Extract topic keyword or fallback to question text slice
        const topicName = q.explanation?.split('.')[0] || q.source || 'General Quiz Concepts';
        if (!topicStats[topicName]) {
          topicStats[topicName] = {
            totalMarks: 0,
            earnedMarks: 0,
            courseId: attempt.courseId,
            count: 0
          };
        }
        topicStats[topicName].totalMarks += q.marks || 1;
        topicStats[topicName].earnedMarks += ans.marksAwarded || 0;
        topicStats[topicName].count += 1;
      }
    });
  });

  // Process Submissions
  submissions.forEach(sub => {
    if (sub.status === 'Graded' && sub.assignmentId) {
      const topicName = sub.assignmentId.title || 'Assignments';
      if (!topicStats[topicName]) {
        topicStats[topicName] = {
          totalMarks: 0,
          earnedMarks: 0,
          courseId: sub.courseId,
          count: 0
        };
      }
      topicStats[topicName].totalMarks += sub.assignmentId.maxMarks || 100;
      topicStats[topicName].earnedMarks += sub.marks || 0;
      topicStats[topicName].count += 1;
    }
  });

  // Categorize Strong & Weak Topics
  const weakTopics = [];
  const strongTopics = [];

  Object.keys(topicStats).forEach(topic => {
    const stat = topicStats[topic];
    const percentage = stat.totalMarks > 0 ? (stat.earnedMarks / stat.totalMarks) * 100 : 0;

    if (percentage < THRESHOLDS.WEAK) {
      weakTopics.push({
        topic,
        courseId: stat.courseId,
        weakScore: Math.round(percentage),
        reason: `Score of ${Math.round(percentage)}% is below the ${THRESHOLDS.WEAK}% threshold.`,
        status: 'Weak'
      });
    } else if (percentage < THRESHOLDS.NEEDS_IMPROVEMENT) {
      weakTopics.push({
        topic,
        courseId: stat.courseId,
        weakScore: Math.round(percentage),
        reason: `Score of ${Math.round(percentage)}% needs improvement.`,
        status: 'Needs Improvement'
      });
    } else if (percentage >= THRESHOLDS.GOOD) {
      strongTopics.push({
        topic,
        courseId: stat.courseId,
        scorePercentage: Math.round(percentage)
      });
    }
  });

  // Update Profile
  profile.weakTopics = weakTopics;
  profile.strongTopics = strongTopics;
  profile.lastAnalyzedAt = new Date();
  await profile.save();

  // Generate Recommendations for Weak Topics
  await generateRecommendationsForStudent(studentId, courseIds, weakTopics);

  return {
    profile,
    insufficientData: false,
    weakTopicsCount: weakTopics.length,
    strongTopicsCount: strongTopics.length
  };
};

/**
 * Generate adaptive learning recommendations based on weak topics
 */
const generateRecommendationsForStudent = async (studentId, courseIds, weakTopics) => {
  // Clear obsolete active recommendations
  await LearningRecommendation.deleteMany({ studentId, status: 'Active' });

  const recommendations = [];

  for (const weak of weakTopics) {
    // Find relevant lessons for this course
    const lessons = await Lesson.find({ courseId: weak.courseId }).limit(2);
    
    lessons.forEach(lesson => {
      recommendations.push({
        studentId,
        courseId: weak.courseId,
        type: 'Lesson',
        topic: weak.topic,
        reason: `Review lesson "${lesson.title}" to improve understanding of ${weak.topic}.`,
        priority: weak.status === 'Weak' ? 'High' : 'Medium',
        resourceId: lesson._id,
        resourceModel: 'Lesson',
        status: 'Active'
      });
    });

    // Add Revision recommendation
    recommendations.push({
      studentId,
      courseId: weak.courseId,
      type: 'Revision',
      topic: weak.topic,
      reason: `Self-paced revision recommended for topic: ${weak.topic}.`,
      priority: 'High',
      status: 'Active'
    });
  }

  if (recommendations.length > 0) {
    await LearningRecommendation.insertMany(recommendations);
  }
};

/**
 * Get personalized learning path for a student in a specific course
 */
const getLearningPath = async (studentId, courseId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
  const profile = await getOrCreateProfile(studentId);

  const courseWeakTopics = profile.weakTopics.filter(w => w.courseId && w.courseId.toString() === courseId.toString());
  const courseStrongTopics = profile.strongTopics.filter(s => s.courseId && s.courseId.toString() === courseId.toString());

  const lessons = await Lesson.find({ courseId }).sort({ order: 1 });

  const pathSteps = [];
  
  if (courseWeakTopics.length > 0) {
    courseWeakTopics.forEach((weak, idx) => {
      pathSteps.push({
        step: idx + 1,
        title: `Revise ${weak.topic}`,
        type: 'Revision',
        description: `Targeted review to address identified weakness (${weak.weakScore}% historical score).`,
        priority: 'High'
      });
    });
  } else {
    pathSteps.push({
      step: 1,
      title: 'Follow Standard Curriculum Sequence',
      type: 'Study',
      description: 'No critical weak topics detected. Continue with standard lesson order.',
      priority: 'Medium'
    });
  }

  // Add next lessons
  lessons.slice(0, 3).forEach((les, idx) => {
    pathSteps.push({
      step: pathSteps.length + 1,
      title: les.title,
      type: 'Lesson',
      description: les.description || `Study lesson module: ${les.title}`,
      resourceId: les._id,
      priority: 'Medium'
    });
  });

  pathSteps.push({
    step: pathSteps.length + 1,
    title: 'Attempt Knowledge Verification Quiz',
    type: 'Quiz',
    description: 'Complete a practice quiz to validate concept mastery.',
    priority: 'High'
  });

  return {
    course: {
      id: course._id,
      title: course.title,
      code: course.code,
      progress: enrollment ? enrollment.progress : 0
    },
    strongTopics: courseStrongTopics.map(t => t.topic),
    weakTopics: courseWeakTopics.map(t => t.topic),
    recommendedPath: pathSteps
  };
};

module.exports = {
  getOrCreateProfile,
  analyzeStudentPerformance,
  getLearningPath,
  THRESHOLDS
};

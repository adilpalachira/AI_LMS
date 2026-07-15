const Quiz = require('../models/quiz.model');
const Question = require('../models/question.model');
const QuizAttempt = require('../models/quizAttempt.model');
const { checkCourseOwnership } = require('./assignment.service');

/**
 * Create a new Quiz
 */
const createQuiz = async (quizData, user) => {
  await checkCourseOwnership(quizData.courseId, user);
  quizData.createdBy = user._id;

  const quiz = await Quiz.create(quizData);
  return quiz;
};

/**
 * Get quizzes by course
 */
const getQuizzesByCourse = async (courseId, user) => {
  const query = { courseId };
  if (user.role === 'Student') {
    query.status = 'Published';
  }

  const quizzes = await Quiz.find(query).sort({ createdAt: -1 }).lean();

  for (let quiz of quizzes) {
    const questionCount = await Question.countDocuments({ quizId: quiz._id });
    quiz.questionCount = questionCount;

    if (user.role === 'Student') {
      const attempts = await QuizAttempt.find({ quizId: quiz._id, studentId: user._id })
        .sort({ attemptNumber: -1 })
        .lean();
      quiz.attemptsCount = attempts.length;
      quiz.lastAttempt = attempts[0] || null;
      quiz.canAttempt = attempts.length < quiz.maxAttempts;
    }
  }

  return quizzes;
};

/**
 * Get single Quiz with questions
 */
const getQuizById = async (quizId, user) => {
  const quiz = await Quiz.findById(quizId).populate('courseId', 'title code').lean();
  if (!quiz) {
    throw new Error('Quiz not found');
  }

  // Fetch questions
  const questions = await Question.find({ quizId }).sort({ order: 1 }).lean();

  // If student, omit correct answers unless reviewing attempt
  if (user.role === 'Student') {
    questions.forEach(q => {
      delete q.correctAnswer;
      delete q.explanation;
    });
  }

  quiz.questions = questions;
  return quiz;
};

/**
 * Update Quiz
 */
const updateQuiz = async (quizId, updateData, user) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new Error('Quiz not found');
  }

  await checkCourseOwnership(quiz.courseId, user);

  Object.assign(quiz, updateData);
  await quiz.save();
  return quiz;
};

/**
 * Delete Quiz, its questions and attempts
 */
const deleteQuiz = async (quizId, user) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new Error('Quiz not found');
  }

  await checkCourseOwnership(quiz.courseId, user);

  await Question.deleteMany({ quizId });
  await QuizAttempt.deleteMany({ quizId });
  await Quiz.findByIdAndDelete(quizId);

  return { message: 'Quiz, questions, and attempt history deleted successfully' };
};

/**
 * Submit Quiz Attempt (Student) with auto-grading engine
 */
const submitQuizAttempt = async (quizId, studentAnswers, user) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new Error('Quiz not found');
  }

  // Check attempt limit
  const previousAttempts = await QuizAttempt.countDocuments({
    quizId: quiz._id,
    studentId: user._id
  });

  if (previousAttempts >= quiz.maxAttempts) {
    throw new Error(`Maximum allowed attempts (${quiz.maxAttempts}) reached for this quiz.`);
  }

  const questions = await Question.find({ quizId: quiz._id }).lean();
  const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

  let score = 0;
  let maxScore = 0;
  const processedAnswers = [];

  for (let q of questions) {
    maxScore += q.marks || 1;
    const qIdStr = q._id.toString();
    const studentAns = studentAnswers[qIdStr] !== undefined ? studentAnswers[qIdStr] : null;

    let isCorrect = false;
    let marksAwarded = 0;

    if (q.type === 'Multiple Choice' || q.type === 'True/False') {
      const correctStr = String(q.correctAnswer).trim().toLowerCase();
      const studentStr = String(studentAns).trim().toLowerCase();

      if (studentAns !== null && correctStr === studentStr) {
        isCorrect = true;
        marksAwarded = q.marks || 1;
        score += marksAwarded;
      }
    } else {
      // Short answer or Essay auto match prep
      if (studentAns && String(q.correctAnswer).trim().toLowerCase() === String(studentAns).trim().toLowerCase()) {
        isCorrect = true;
        marksAwarded = q.marks || 1;
        score += marksAwarded;
      }
    }

    processedAnswers.push({
      questionId: q._id,
      studentAnswer: studentAns,
      isCorrect,
      marksAwarded,
      feedback: isCorrect ? 'Correct' : 'Incorrect'
    });
  }

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const passed = percentage >= (quiz.passingMarks || 50);

  const attempt = await QuizAttempt.create({
    quizId: quiz._id,
    courseId: quiz.courseId,
    studentId: user._id,
    score,
    maxScore,
    percentage,
    passed,
    answers: processedAnswers,
    attemptNumber: previousAttempts + 1,
    status: 'Completed',
    submittedAt: new Date()
  });

  return attempt;
};

/**
 * Get Quiz Attempt results for student or faculty
 */
const getQuizAttempts = async (quizId, user) => {
  const query = { quizId };
  if (user.role === 'Student') {
    query.studentId = user._id;
  }

  const attempts = await QuizAttempt.find(query)
    .populate('studentId', 'name email role')
    .sort({ createdAt: -1 })
    .lean();

  return attempts;
};

module.exports = {
  createQuiz,
  getQuizzesByCourse,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  submitQuizAttempt,
  getQuizAttempts
};

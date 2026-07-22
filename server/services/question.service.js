const Question = require('../models/question.model');
const Quiz = require('../models/quiz.model');
const { checkCourseOwnership } = require('./assignment.service');

/**
 * Add question (direct or to question bank / quiz)
 */
const createQuestion = async (questionData, user) => {
  if (questionData.quizId) {
    const quiz = await Quiz.findById(questionData.quizId);
    if (!quiz) {
      throw new Error('Associated quiz not found');
    }
    await checkCourseOwnership(quiz.courseId, user);
    questionData.courseId = questionData.courseId || quiz.courseId;

    if (questionData.order === undefined || questionData.order === null) {
      const maxQ = await Question.findOne({ quizId: questionData.quizId }).sort({ order: -1 });
      questionData.order = maxQ ? maxQ.order + 1 : 1;
    }
  } else if (questionData.courseId) {
    await checkCourseOwnership(questionData.courseId, user);
  }

  questionData.createdBy = user._id;
  const question = await Question.create(questionData);
  return question;
};

/**
 * Get Question Bank items with filtering and search
 */
const getQuestionBankQuestions = async (queryParams = {}, user) => {
  const {
    courseId,
    lessonId,
    materialId,
    difficulty,
    type,
    status,
    source,
    search,
    isAiGenerated
  } = queryParams;

  const query = {};

  // For faculty, show questions created by them or approved in public bank or in courses they teach
  if (courseId) {
    query.courseId = courseId;
  }
  if (lessonId) {
    query.lessonId = lessonId;
  }
  if (materialId) {
    query.materialId = materialId;
  }
  if (difficulty) {
    query.difficulty = difficulty;
  }
  if (type) {
    query.type = type;
  }
  if (status) {
    query.status = status;
  }
  if (source) {
    query.source = { $regex: source, $options: 'i' };
  }
  if (isAiGenerated !== undefined && isAiGenerated !== '') {
    query.isAiGenerated = isAiGenerated === 'true' || isAiGenerated === true;
  }

  if (search && search.trim()) {
    query.$or = [
      { question: { $regex: search.trim(), $options: 'i' } },
      { explanation: { $regex: search.trim(), $options: 'i' } },
      { source: { $regex: search.trim(), $options: 'i' } }
    ];
  }

  const questions = await Question.find(query)
    .populate('courseId', 'title code')
    .populate('lessonId', 'title')
    .populate('materialId', 'fileName')
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 })
    .lean();

  return questions;
};

/**
 * Update question
 */
const updateQuestion = async (questionId, updateData, user) => {
  const question = await Question.findById(questionId);
  if (!question) {
    throw new Error('Question not found');
  }

  if (question.quizId) {
    const quiz = await Quiz.findById(question.quizId);
    if (quiz) {
      await checkCourseOwnership(quiz.courseId, user);
    }
  } else if (question.courseId) {
    await checkCourseOwnership(question.courseId, user);
  }

  Object.assign(question, updateData);
  await question.save();
  return question;
};

/**
 * Delete question
 */
const deleteQuestion = async (questionId, user) => {
  const question = await Question.findById(questionId);
  if (!question) {
    throw new Error('Question not found');
  }

  if (question.quizId) {
    const quiz = await Quiz.findById(question.quizId);
    if (quiz) {
      await checkCourseOwnership(quiz.courseId, user);
    }
  } else if (question.courseId) {
    await checkCourseOwnership(question.courseId, user);
  }

  await Question.findByIdAndDelete(questionId);
  return { message: 'Question deleted successfully' };
};

/**
 * Approve question
 */
const approveQuestion = async (questionId, user) => {
  const question = await Question.findById(questionId);
  if (!question) {
    throw new Error('Question not found');
  }

  if (question.courseId) {
    await checkCourseOwnership(question.courseId, user);
  }

  question.status = 'Approved';
  await question.save();
  return question;
};

/**
 * Archive question
 */
const archiveQuestion = async (questionId, user) => {
  const question = await Question.findById(questionId);
  if (!question) {
    throw new Error('Question not found');
  }

  if (question.courseId) {
    await checkCourseOwnership(question.courseId, user);
  }

  question.status = 'Archived';
  await question.save();
  return question;
};

/**
 * Bulk save questions from AI Review / Builder into Question Bank or Quiz
 */
const bulkSaveQuestions = async ({ questions, quizId, courseId, status = 'Approved' }, user) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('Questions array cannot be empty');
  }

  if (quizId) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw new Error('Target quiz not found');
    await checkCourseOwnership(quiz.courseId, user);
    courseId = quiz.courseId;
  } else if (courseId) {
    await checkCourseOwnership(courseId, user);
  }

  const savedQuestions = [];
  for (let idx = 0; idx < questions.length; idx++) {
    const qData = questions[idx];

    const questionDoc = await Question.create({
      quizId: quizId || qData.quizId || null,
      courseId: courseId || qData.courseId || null,
      lessonId: qData.lessonId || null,
      materialId: qData.materialId || null,
      question: qData.question,
      type: qData.type,
      options: qData.options || [],
      correctAnswer: qData.correctAnswer,
      explanation: qData.explanation || '',
      marks: qData.marks || 1,
      order: idx + 1,
      source: qData.source || '',
      sourcePage: qData.sourcePage || null,
      difficulty: qData.difficulty || 'Medium',
      status: qData.status || status,
      isAiGenerated: qData.isAiGenerated !== undefined ? qData.isAiGenerated : true,
      createdBy: user._id
    });

    savedQuestions.push(questionDoc);
  }

  return savedQuestions;
};

/**
 * Add existing questions from Question Bank to a specific Quiz
 */
const addQuestionsToQuiz = async (quizId, questionIds, user) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new Error('Quiz not found');
  }

  await checkCourseOwnership(quiz.courseId, user);

  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    throw new Error('No question IDs provided');
  }

  // Fetch current max order in quiz
  const maxQ = await Question.findOne({ quizId: quiz._id }).sort({ order: -1 });
  let currentOrder = maxQ ? maxQ.order + 1 : 1;

  const addedQuestions = [];

  for (let qId of questionIds) {
    const originalQ = await Question.findById(qId);
    if (!originalQ) continue;

    // Duplicate question into target quiz if it already belongs to another quiz or bank item
    const clonedQuestion = await Question.create({
      quizId: quiz._id,
      courseId: quiz.courseId,
      lessonId: originalQ.lessonId,
      materialId: originalQ.materialId,
      question: originalQ.question,
      type: originalQ.type,
      options: originalQ.options,
      correctAnswer: originalQ.correctAnswer,
      explanation: originalQ.explanation,
      marks: originalQ.marks,
      order: currentOrder++,
      source: originalQ.source,
      sourcePage: originalQ.sourcePage,
      difficulty: originalQ.difficulty,
      status: 'Approved',
      isAiGenerated: originalQ.isAiGenerated,
      createdBy: user._id
    });

    addedQuestions.push(clonedQuestion);
  }

  return addedQuestions;
};

module.exports = {
  createQuestion,
  getQuestionBankQuestions,
  updateQuestion,
  deleteQuestion,
  approveQuestion,
  archiveQuestion,
  bulkSaveQuestions,
  addQuestionsToQuiz
};

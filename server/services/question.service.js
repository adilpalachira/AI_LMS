const Question = require('../models/question.model');
const Quiz = require('../models/quiz.model');
const { checkCourseOwnership } = require('./assignment.service');

/**
 * Add question to a quiz
 */
const createQuestion = async (questionData, user) => {
  const quiz = await Quiz.findById(questionData.quizId);
  if (!quiz) {
    throw new Error('Associated quiz not found');
  }

  await checkCourseOwnership(quiz.courseId, user);

  // Auto set order if not supplied
  if (questionData.order === undefined || questionData.order === null) {
    const maxQ = await Question.findOne({ quizId: questionData.quizId }).sort({ order: -1 });
    questionData.order = maxQ ? maxQ.order + 1 : 1;
  }

  const question = await Question.create(questionData);
  return question;
};

/**
 * Update question
 */
const updateQuestion = async (questionId, updateData, user) => {
  const question = await Question.findById(questionId);
  if (!question) {
    throw new Error('Question not found');
  }

  const quiz = await Quiz.findById(question.quizId);
  if (quiz) {
    await checkCourseOwnership(quiz.courseId, user);
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

  const quiz = await Quiz.findById(question.quizId);
  if (quiz) {
    await checkCourseOwnership(quiz.courseId, user);
  }

  await Question.findByIdAndDelete(questionId);
  return { message: 'Question deleted successfully' };
};

module.exports = {
  createQuestion,
  updateQuestion,
  deleteQuestion
};

const Question = require('../../models/question.model');

/**
 * Quiz Validation Service
 * Validates AI-generated structured questions and checks for duplicates
 */

/**
 * Validate an individual question structure
 * @param {Object} q 
 * @returns {{ valid: boolean, errors: string[] }}
 */
const validateGeneratedQuestion = (q) => {
  const errors = [];

  if (!q.question || typeof q.question !== 'string' || !q.question.trim()) {
    errors.push('Question text is missing or empty.');
  }

  const validTypes = ['Multiple Choice', 'MCQ', 'True/False', 'Short Answer', 'Essay', 'Descriptive'];
  if (!q.type || !validTypes.includes(q.type)) {
    errors.push(`Invalid question type: ${q.type}`);
  }

  const typeUpper = (q.type || '').toUpperCase();

  // Validate MCQ
  if (typeUpper === 'MCQ' || typeUpper === 'MULTIPLE CHOICE') {
    if (!Array.isArray(q.options) || q.options.length < 2) {
      errors.push('MCQ must have at least 2 options.');
    }
    if (q.correctAnswer === undefined || q.correctAnswer === null || String(q.correctAnswer).trim() === '') {
      errors.push('MCQ correct answer is missing.');
    } else if (Array.isArray(q.options)) {
      const match = q.options.some(opt => String(opt).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase());
      if (!match) {
        errors.push(`MCQ correct answer "${q.correctAnswer}" does not match any of the provided options.`);
      }
    }
  }

  // Validate True/False
  if (typeUpper === 'TRUE/FALSE') {
    if (!Array.isArray(q.options) || q.options.length === 0) {
      q.options = ['True', 'False'];
    }
    const val = String(q.correctAnswer).trim().toLowerCase();
    if (val !== 'true' && val !== 'false') {
      errors.push('True/False correct answer must be either "True" or "False".');
    }
  }

  // Validate Marks
  if (q.marks === undefined || q.marks === null || isNaN(q.marks) || Number(q.marks) < 1) {
    q.marks = 1;
  }

  const validDifficulties = ['Easy', 'Medium', 'Hard'];
  if (!q.difficulty || !validDifficulties.includes(q.difficulty)) {
    q.difficulty = 'Medium';
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate batch of AI-generated questions
 * @param {Array} questions 
 * @returns {{ validQuestions: Array, invalidQuestions: Array }}
 */
const validateBatchQuestions = (questions) => {
  const validQuestions = [];
  const invalidQuestions = [];

  if (!Array.isArray(questions)) {
    return { validQuestions: [], invalidQuestions: [{ question: {}, errors: ['Response is not an array of questions'] }] };
  }

  questions.forEach(q => {
    const result = validateGeneratedQuestion(q);
    if (result.valid) {
      validQuestions.push(q);
    } else {
      invalidQuestions.push({ question: q, errors: result.errors });
    }
  });

  return { validQuestions, invalidQuestions };
};

/**
 * Check if a newly generated question is duplicate/similar to existing questions in the course
 * @param {string} courseId 
 * @param {string} questionText 
 * @returns {Promise<boolean>} isDuplicate
 */
const checkDuplicateQuestion = async (courseId, questionText) => {
  if (!courseId || !questionText) return false;

  const normalizedNew = questionText.toLowerCase().replace(/[^a-z0-9]/g, '');

  const existingQuestions = await Question.find({ courseId })
    .select('question')
    .lean();

  for (let eq of existingQuestions) {
    const normalizedExisting = (eq.question || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalizedExisting === normalizedNew) {
      return true;
    }
  }

  return false;
};

module.exports = {
  validateGeneratedQuestion,
  validateBatchQuestions,
  checkDuplicateQuestion
};

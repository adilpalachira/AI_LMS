const personalizationService = require('../services/personalization.service');
const LearningRecommendation = require('../models/learningRecommendation.model');
const LearningProfile = require('../models/learningProfile.model');
const { formatResponse } = require('../utils/response');

/**
 * GET /api/learning/profile
 * Get student learning profile and preferences
 */
const getLearningProfile = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const profile = await personalizationService.getOrCreateProfile(studentId);
    return res.status(200).json(
      formatResponse(true, 'Learning profile retrieved successfully', profile)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/learning/profile
 * Update student study preferences and learning goal
 */
const updateLearningProfile = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { preferredStudyTime, availableStudyHours, learningGoal, learningPreferences } = req.body;

    const profile = await personalizationService.getOrCreateProfile(studentId);

    if (preferredStudyTime) profile.preferredStudyTime = preferredStudyTime;
    if (availableStudyHours) profile.availableStudyHours = availableStudyHours;
    if (learningGoal !== undefined) profile.learningGoal = learningGoal;
    if (learningPreferences) profile.learningPreferences = learningPreferences;

    await profile.save();

    return res.status(200).json(
      formatResponse(true, 'Learning preferences updated successfully', profile)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/learning/analyze
 * Trigger adaptive analysis of student performance to detect weak/strong topics
 */
const analyzePerformance = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const result = await personalizationService.analyzeStudentPerformance(studentId);
    return res.status(200).json(
      formatResponse(true, 'Student performance analysis completed', result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/learning/recommendations
 * Fetch active personalized learning recommendations for the student
 */
const getRecommendations = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const recommendations = await LearningRecommendation.find({
      studentId,
      status: 'Active'
    }).populate('courseId', 'title code');

    return res.status(200).json(
      formatResponse(true, 'Recommendations retrieved successfully', recommendations)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/learning/path/:courseId
 * Get personalized learning path for a specific course
 */
const getLearningPath = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;

    const pathData = await personalizationService.getLearningPath(studentId, courseId);

    return res.status(200).json(
      formatResponse(true, 'Personalized learning path generated', pathData)
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLearningProfile,
  updateLearningProfile,
  analyzePerformance,
  getRecommendations,
  getLearningPath
};

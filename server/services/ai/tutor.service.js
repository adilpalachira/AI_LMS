const ChatSession = require('../../models/chatSession.model');
const ChatMessage = require('../../models/chatMessage.model');
const Course = require('../../models/course.model');
const Enrollment = require('../../models/enrollment.model');
const ragService = require('./rag.service');

/**
 * Tutor Service
 * Handles AI Tutor chat session management, authorization, and conversation flows
 */

/**
 * Check user permission to query course AI Tutor
 * @param {string} courseId 
 * @param {Object} user 
 */
const checkCourseAccess = async (courseId, user) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  if (!user || user.role === 'Admin') {
    return course;
  }

  if (user.role === 'Faculty') {
    const instructorId = course.instructor ? course.instructor.toString() : null;
    const createdById = course.createdBy ? course.createdBy.toString() : null;
    const userId = user._id ? user._id.toString() : null;

    const isOwner = (instructorId && instructorId === userId) ||
                    (createdById && createdById === userId);
    
    // Faculty can access AI Tutor for course materials
    return course;
  }

  if (user.role === 'Student') {
    let enrollment = await Enrollment.findOne({
      student: user._id,
      course: courseId
    });

    if (!enrollment) {
      // Auto-enroll student into active status so AI Tutor works seamlessly
      enrollment = await Enrollment.create({
        student: user._id,
        course: courseId,
        status: 'Active',
        progress: 0
      });
    }
    return course;
  }

  return course;
};

/**
 * Create a new AI Tutor chat session for a student and course
 */
const createChatSession = async (courseId, user, initialTitle) => {
  await checkCourseAccess(courseId, user);

  const title = initialTitle && initialTitle.trim()
    ? initialTitle.trim().slice(0, 50)
    : 'New Conversation';

  const session = await ChatSession.create({
    studentId: user._id,
    courseId,
    title
  });

  return session;
};

/**
 * Get all chat sessions for a user (optionally filtered by course)
 */
const getUserChatSessions = async (user, courseId) => {
  const query = { studentId: user._id };
  if (courseId) {
    query.courseId = courseId;
  }

  const sessions = await ChatSession.find(query)
    .populate('courseId', 'title code thumbnail')
    .sort({ updatedAt: -1 })
    .lean();

  return sessions;
};

/**
 * Get chat session by ID with message history
 */
const getSessionById = async (sessionId, user) => {
  const session = await ChatSession.findById(sessionId).populate('courseId', 'title code thumbnail');
  if (!session) {
    throw new Error('Chat session not found');
  }

  if (session.studentId.toString() !== user._id.toString() && user.role !== 'Admin') {
    throw new Error('Unauthorized to view this chat session');
  }

  const messages = await ChatMessage.find({ sessionId: session._id })
    .sort({ createdAt: 1 })
    .lean();

  return {
    session,
    messages
  };
};

/**
 * Ask a question in an AI Tutor session
 */
const askTutorQuestion = async (sessionId, question, user) => {
  let session = await ChatSession.findById(sessionId);
  if (!session) {
    throw new Error('Chat session not found');
  }

  if (session.studentId.toString() !== user._id.toString() && user.role !== 'Admin') {
    throw new Error('Unauthorized chat session access');
  }

  // Verify course authorization
  await checkCourseAccess(session.courseId, user);

  // Fetch past messages in session for conversation memory context
  const existingMessages = await ChatMessage.find({ sessionId: session._id })
    .sort({ createdAt: 1 })
    .lean();

  // Save student question message
  const userMessage = await ChatMessage.create({
    sessionId: session._id,
    role: 'user',
    content: question.trim(),
    sources: []
  });

  // If session title is default "New Conversation", auto-title it from the question
  if (session.title === 'New Conversation' || !session.title) {
    session.title = question.trim().slice(0, 45) + (question.length > 45 ? '...' : '');
  }
  session.updatedAt = new Date();
  await session.save();

  // Execute RAG Pipeline
  const ragResult = await ragService.answerQuestion(
    session.courseId,
    question,
    existingMessages
  );

  // Save assistant response message
  const assistantMessage = await ChatMessage.create({
    sessionId: session._id,
    role: 'assistant',
    content: ragResult.answer,
    sources: ragResult.sources || []
  });

  return {
    userMessage,
    assistantMessage
  };
};

/**
 * Delete a chat session
 */
const deleteChatSession = async (sessionId, user) => {
  const session = await ChatSession.findById(sessionId);
  if (!session) {
    throw new Error('Chat session not found');
  }

  if (session.studentId.toString() !== user._id.toString() && user.role !== 'Admin') {
    throw new Error('Unauthorized to delete this chat session');
  }

  await ChatMessage.deleteMany({ sessionId: session._id });
  await ChatSession.findByIdAndDelete(session._id);

  return { message: 'Chat session deleted successfully' };
};

module.exports = {
  checkCourseAccess,
  createChatSession,
  getUserChatSessions,
  getSessionById,
  askTutorQuestion,
  deleteChatSession
};

const embeddingService = require('./embedding.service');
const vectorStoreService = require('../rag/vectorStore.service');
const promptService = require('./prompt.service');
const openaiService = require('./openai.service');
const Course = require('../../models/course.model');

/**
 * RAG Service
 * Executes Retrieval-Augmented Generation pipeline for AI Tutor questions
 */

/**
 * Process a student query against course knowledge base
 * @param {string} courseId 
 * @param {string} question 
 * @param {Array<{ role: string, content: string }>} conversationHistory 
 * @returns {Promise<{ answer: string, sources: Array<{ fileName: string, lessonName: string, materialId: string, pageNumber: number, score: number }> }>}
 */
const answerQuestion = async (courseId, question, conversationHistory = []) => {
  if (!question || !question.trim()) {
    throw new Error('Question content cannot be empty');
  }

  try {
    // 1. Fetch Course details
    const course = await Course.findById(courseId);
    const courseTitle = course ? course.title : 'Course';

    // 2. Generate embedding for student question & search vector store
    let matchedChunks = [];
    try {
      console.log(`[RAG Service] Generating query embedding for course: ${courseTitle}`);
      const queryVector = await embeddingService.generateEmbedding(question);
      console.log(`[RAG Service] Searching vector store for relevant chunks...`);
      matchedChunks = await vectorStoreService.similaritySearch(queryVector, courseId, undefined, question);
    } catch (vectorErr) {
      console.warn('[RAG Service] Vector store search notice:', vectorErr.message);
    }

    // 3. Format context and system prompt
    const contextBlock = promptService.formatContext(matchedChunks);
    const systemPrompt = promptService.buildSystemPrompt(courseTitle, contextBlock);

    // 4. Construct conversation message payload
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Append past messages (up to 6 past messages for conversational history)
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-6);
      recentHistory.forEach(msg => {
        if (['user', 'assistant'].includes(msg.role) && msg.content) {
          messages.push({ role: msg.role, content: msg.content });
        }
      });
    }

    // Append current user question
    messages.push({ role: 'user', content: question });

    // 5. Generate answer from OpenAI or Fallback Engine
    console.log(`[RAG Service] Generating completion response...`);
    const answer = await openaiService.generateCompletion(messages);

    // 6. Extract source references from matched chunks
    const sourcesMap = new Map();
    matchedChunks.forEach(chunk => {
      const meta = chunk.metadata || {};
      const key = `${meta.materialId}_${meta.pageNumber || 1}`;
      if (!sourcesMap.has(key)) {
        sourcesMap.set(key, {
          fileName: meta.fileName || 'Course Material',
          lessonName: meta.lessonName || 'Lesson Material',
          materialId: meta.materialId || '',
          chunkId: meta.chunkId || '',
          pageNumber: meta.pageNumber || 1,
          score: Math.round((chunk.score || 0) * 100) / 100
        });
      }
    });

    const sources = Array.from(sourcesMap.values());

    return {
      answer: answer || "I'm sorry, I could not generate a response. Please try rephrasing your question.",
      sources
    };
  } catch (error) {
    console.error('[RAG Service Error - Utilizing Fallback Engine]:', error.message);
    const fallbackAnswer = openaiService.generateFallbackResponse([
      { role: 'system', content: `Course Q&A Assistant` },
      { role: 'user', content: question }
    ]);
    return {
      answer: fallbackAnswer,
      sources: []
    };
  }
};

module.exports = {
  answerQuestion
};

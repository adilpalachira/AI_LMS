const Course = require('../../models/course.model');
const Lesson = require('../../models/lesson.model');
const LearningMaterial = require('../../models/material.model');
const QuizGenerationHistory = require('../../models/quizGenerationHistory.model');
const openaiService = require('./openai.service');
const embeddingService = require('./embedding.service');
const vectorStoreService = require('../rag/vectorStore.service');
const textExtractor = require('../rag/textExtractor.service');
const quizPromptService = require('./quizPrompt.service');
const quizValidationService = require('./quizValidation.service');

/**
 * AI Quiz Generator Service
 * RAG context retrieval -> OpenAI structured question generation -> schema validation -> duplicate check
 */

/**
 * Retrieve content context from course material or Pinecone RAG store
 */
const retrieveCourseContext = async ({ courseId, lessonId, materialId, topic }) => {
  let contextBlocks = [];
  let sourceName = 'Course Material';

  // 1. If specific material selected, extract text directly
  if (materialId) {
    const material = await LearningMaterial.findById(materialId);
    if (material) {
      sourceName = material.fileName || sourceName;
      if (material.extractedText && material.extractedText.trim().length > 0) {
        contextBlocks.push(material.extractedText);
      } else if (material.fileUrl) {
        try {
          const extracted = await textExtractor.extractTextFromDocument(material.fileUrl, material.fileType);
          if (extracted && extracted.text) {
            contextBlocks.push(extracted.text);
            material.extractedText = extracted.text.slice(0, 5000);
            await material.save();
          }
        } catch (err) {
          console.warn(`[Quiz Generator] Direct extraction failed for ${material.fileName}:`, err.message);
        }
      }
    }
  }

  // 2. If lessonId selected and no material context yet, gather materials in lesson
  if (lessonId && contextBlocks.length === 0) {
    const materials = await LearningMaterial.find({ lessonId }).limit(3);
    for (let mat of materials) {
      if (mat.extractedText) {
        contextBlocks.push(mat.extractedText);
      }
    }
  }

  // 3. If RAG query vector search can enrich context or if no direct material text
  if (contextBlocks.length === 0 || topic) {
    try {
      const searchQuery = topic && topic.trim() ? topic : 'Core concepts, definitions, rules, and fundamental principles of the course';
      const queryVector = await embeddingService.generateEmbedding(searchQuery);
      const matches = await vectorStoreService.similaritySearch(queryVector, courseId, 6);

      if (matches && matches.length > 0) {
        const ragTexts = matches.map(m => m.metadata?.text).filter(Boolean);
        if (ragTexts.length > 0) {
          contextBlocks.push(ragTexts.join('\n\n'));
        }
      }
    } catch (err) {
      console.warn(`[Quiz Generator] Pinecone RAG search fallback warning:`, err.message);
    }
  }

  // Combine and truncate to avoid token overflow (~4000 words max context)
  const fullContext = contextBlocks.join('\n\n').trim();
  const truncatedContext = fullContext.length > 12000 ? fullContext.slice(0, 12000) + '...' : fullContext;

  return {
    context: truncatedContext,
    source: sourceName
  };
};

/**
 * Generate questions using OpenAI LLM with structured output
 */
const generateQuestions = async ({
  courseId,
  lessonId,
  materialId,
  topic,
  questionType = 'MCQ',
  difficulty = 'Medium',
  count = 5,
  user
}) => {
  if (!courseId) {
    throw new Error('Course ID is required for AI question generation');
  }

  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error('Target course not found');
  }

  // 1. Create PENDING history record
  const historyRecord = await QuizGenerationHistory.create({
    createdBy: user._id,
    courseId,
    lessonId: lessonId || null,
    materialId: materialId || null,
    topic: topic || '',
    questionType,
    difficulty,
    questionCount: count,
    status: 'GENERATING'
  });

  try {
    // 2. Retrieve learning context
    console.log(`[Quiz Generator] Retrieving context for course: ${course.title}...`);
    const { context, source } = await retrieveCourseContext({ courseId, lessonId, materialId, topic });

    if (!context || context.trim().length === 0) {
      throw new Error('No readable course content available to generate questions from. Please upload or vectorize course learning materials first.');
    }

    // 3. Construct Prompts
    const systemPrompt = quizPromptService.buildQuizSystemPrompt(course.title, questionType, difficulty, count);
    const userPrompt = quizPromptService.buildQuizUserPrompt(topic, context, questionType, difficulty, count);

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    // 4. Call OpenAI Completion
    console.log(`[Quiz Generator] Requesting LLM completion from OpenAI for ${count} ${questionType} questions...`);
    const rawResponse = await openaiService.generateCompletion(messages, {
      temperature: 0.3,
      max_tokens: 3000
    });

    // 5. Parse JSON Output
    let parsedData = null;
    try {
      let jsonStr = rawResponse.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
      }
      parsedData = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error('[Quiz Generator] Failed to parse OpenAI JSON output:', rawResponse);
      throw new Error('AI service returned unstructured or invalid JSON format. Please try again.');
    }

    const questionsList = parsedData.questions || parsedData.data || (Array.isArray(parsedData) ? parsedData : []);

    if (!Array.isArray(questionsList) || questionsList.length === 0) {
      throw new Error('AI service failed to produce valid questions list.');
    }

    // 6. Validate Batch Questions
    const { validQuestions, invalidQuestions } = quizValidationService.validateBatchQuestions(questionsList);

    if (validQuestions.length === 0) {
      throw new Error(`AI generated invalid questions: ${invalidQuestions.map(i => i.errors.join(', ')).join('; ')}`);
    }

    // 7. Process valid questions and add course metadata & duplicate flags
    const processedQuestions = [];
    for (let q of validQuestions) {
      const isDuplicate = await quizValidationService.checkDuplicateQuestion(courseId, q.question);

      processedQuestions.push({
        question: q.question.trim(),
        type: q.type || questionType,
        difficulty: q.difficulty || difficulty,
        options: Array.isArray(q.options) ? q.options.map(opt => String(opt).trim()) : [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        marks: Number(q.marks) || 1,
        source: q.source || source,
        sourcePage: q.sourcePage || null,
        courseId,
        lessonId: lessonId || null,
        materialId: materialId || null,
        createdBy: user._id,
        status: 'Generated',
        isAiGenerated: true,
        isDuplicate
      });
    }

    // 8. Update History Record to COMPLETED
    historyRecord.status = 'COMPLETED';
    historyRecord.generatedQuestions = processedQuestions;
    historyRecord.completedAt = new Date();
    await historyRecord.save();

    console.log(`[Quiz Generator] Successfully generated ${processedQuestions.length} questions.`);

    return {
      historyId: historyRecord._id,
      questions: processedQuestions,
      totalGenerated: processedQuestions.length,
      invalidCount: invalidQuestions.length
    };
  } catch (error) {
    console.error('[Quiz Generator] Generation Error:', error.message);
    historyRecord.status = 'FAILED';
    historyRecord.errorMessage = error.message;
    await historyRecord.save();
    throw error;
  }
};

/**
 * Get AI Generation History for user / course
 */
const getGenerationHistory = async (userId, courseId) => {
  const query = { createdBy: userId };
  if (courseId) {
    query.courseId = courseId;
  }

  const history = await QuizGenerationHistory.find(query)
    .populate('courseId', 'title code')
    .populate('lessonId', 'title')
    .sort({ createdAt: -1 })
    .lean();

  return history;
};

module.exports = {
  generateQuestions,
  getGenerationHistory,
  retrieveCourseContext
};

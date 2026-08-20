const { getOpenAIClient } = require('./openai.service');
const geminiService = require('./gemini.service');
const config = require('../../config/aiConfig');

/**
 * Embedding Service
 * Generates vector embeddings for text chunks and search queries using Gemini or OpenAI
 */

/**
 * Generate embedding vector for a single text string
 * @param {string} text 
 * @returns {Promise<number[]>} Array of float embedding vector values
 */
const generateEmbedding = async (text) => {
  if (!text || !text.trim()) {
    throw new Error('Cannot generate embedding for empty text');
  }

  const cleanedText = text.replace(/\n/g, ' ');

  // 1. Try Gemini Embedding API
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
    try {
      return await geminiService.generateGeminiEmbedding(cleanedText);
    } catch (err) {
      console.warn('[Embedding Service] Gemini Embedding Error (falling back):', err.message);
    }
  }

  // 2. Try OpenAI Client
  const client = getOpenAIClient();
  if (client) {
    try {
      const response = await client.embeddings.create({
        model: config.EMBEDDING_MODEL,
        input: cleanedText
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('[Embedding Service] OpenAI Embedding Generation Error:', error.message);
    }
  }

  // Synthetic fallback vector (1536 float dimensions)
  return new Array(1536).fill(0.01);
};

/**
 * Generate embedding vectors for batch array of text strings
 * @param {string[]} textArray 
 * @returns {Promise<number[][]>} Array of float embedding vectors
 */
const generateBatchEmbeddings = async (textArray) => {
  if (!Array.isArray(textArray) || textArray.length === 0) {
    return [];
  }

  const cleanedArray = textArray.map(t => (t || '').replace(/\n/g, ' '));

  // 1. Try Gemini Batch Embeddings
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
    try {
      const results = [];
      for (const item of cleanedArray) {
        const vec = await geminiService.generateGeminiEmbedding(item);
        results.push(vec);
      }
      return results;
    } catch (err) {
      console.warn('[Embedding Service] Gemini Batch Embedding Error (falling back):', err.message);
    }
  }

  // 2. Try OpenAI Client
  const client = getOpenAIClient();
  if (client) {
    try {
      const response = await client.embeddings.create({
        model: config.EMBEDDING_MODEL,
        input: cleanedArray
      });

      return response.data.map(d => d.embedding);
    } catch (error) {
      console.error('[Embedding Service] OpenAI Batch Generation Error:', error.message);
    }
  }

  return textArray.map(() => new Array(1536).fill(0.01));
};

module.exports = {
  generateEmbedding,
  generateBatchEmbeddings
};


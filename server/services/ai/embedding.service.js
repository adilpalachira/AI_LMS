const { getOpenAIClient } = require('./openai.service');
const config = require('../../config/aiConfig');

/**
 * Embedding Service
 * Generates vector embeddings for text chunks and search queries using OpenAI
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

  const client = getOpenAIClient();
  if (!client) {
    // Synthetic fallback vector (1536 float dimensions)
    return new Array(1536).fill(0.01);
  }

  const cleanedText = text.replace(/\n/g, ' ');

  try {
    const response = await client.embeddings.create({
      model: config.EMBEDDING_MODEL,
      input: cleanedText
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('[Embedding Service] Generation Error (using fallback vector):', error.message);
    return new Array(1536).fill(0.01);
  }
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

  const client = getOpenAIClient();
  if (!client) {
    return textArray.map(() => new Array(1536).fill(0.01));
  }

  const cleanedArray = textArray.map(t => (t || '').replace(/\n/g, ' '));

  try {
    const response = await client.embeddings.create({
      model: config.EMBEDDING_MODEL,
      input: cleanedArray
    });

    return response.data.map(d => d.embedding);
  } catch (error) {
    console.error('[Embedding Service] Batch Generation Error (using fallback vectors):', error.message);
    return textArray.map(() => new Array(1536).fill(0.01));
  }
};

module.exports = {
  generateEmbedding,
  generateBatchEmbeddings
};

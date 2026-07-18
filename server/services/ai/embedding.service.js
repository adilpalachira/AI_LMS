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
  const cleanedText = text.replace(/\n/g, ' ');

  try {
    const response = await client.embeddings.create({
      model: config.EMBEDDING_MODEL,
      input: cleanedText
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('[Embedding Service] Generation Error:', error.message);
    throw new Error(`Embedding generation failed: ${error.message}`);
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
  const cleanedArray = textArray.map(t => (t || '').replace(/\n/g, ' '));

  try {
    const response = await client.embeddings.create({
      model: config.EMBEDDING_MODEL,
      input: cleanedArray
    });

    return response.data.map(d => d.embedding);
  } catch (error) {
    console.error('[Embedding Service] Batch Generation Error:', error.message);
    throw new Error(`Batch embedding generation failed: ${error.message}`);
  }
};

module.exports = {
  generateEmbedding,
  generateBatchEmbeddings
};

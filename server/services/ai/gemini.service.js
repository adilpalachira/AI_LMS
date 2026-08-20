const { GoogleGenAI } = require('@google/genai');
const config = require('../../config/aiConfig');

/**
 * Google Gemini Service
 * Handles official Gemini API integration using @google/genai SDK
 * for AI Tutor, RAG completions, and intelligent academic query processing.
 */

let geminiClient = null;

/**
 * Get or initialize the Google GenAI client
 * @returns {GoogleGenAI|null}
 */
const getGeminiClient = () => {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return null;
  }

  if (!geminiClient || geminiClient.apiKey !== apiKey) {
    geminiClient = new GoogleGenAI({ apiKey });
  }

  return geminiClient;
};

/**
 * Format standard chat messages array into Gemini contents structure & systemInstruction
 * @param {Array<{ role: string, content: string }>} messages 
 */
const formatMessagesForGemini = (messages) => {
  let systemInstruction = '';
  const contents = [];

  for (const msg of messages) {
    if (!msg || !msg.content) continue;

    if (msg.role === 'system') {
      systemInstruction += (systemInstruction ? '\n\n' : '') + msg.content;
    } else if (msg.role === 'user') {
      contents.push({
        role: 'user',
        parts: [{ text: msg.content }]
      });
    } else if (msg.role === 'assistant' || msg.role === 'model') {
      contents.push({
        role: 'model',
        parts: [{ text: msg.content }]
      });
    }
  }

  // Ensure contents has at least one message
  if (contents.length === 0) {
    contents.push({
      role: 'user',
      parts: [{ text: 'Hello' }]
    });
  }

  return { systemInstruction, contents };
};

/**
 * Generate completion using Google Gemini API with model fallback sequence
 * @param {Array<{ role: string, content: string }>} messages 
 * @param {Object} options 
 * @returns {Promise<string>}
 */
const generateGeminiCompletion = async (messages, options = {}) => {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('GEMINI_API_KEY is not configured in server environment');
  }

  const { systemInstruction, contents } = formatMessagesForGemini(messages);

  // Model fallback candidate sequence
  const preferredModel = options.model || config.GEMINI_MODEL || 'gemini-3.6-flash';
  const fallbackModels = [
    preferredModel,
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.7-flash',
    'gemini-2.5-flash'
  ].filter((model, idx, arr) => arr.indexOf(model) === idx);


  let lastError = null;

  for (const modelName of fallbackModels) {
    try {
      console.log(`[Gemini Service] Requesting completion using model: ${modelName}`);

      const requestConfig = {
        temperature: options.temperature !== undefined ? options.temperature : config.LLM_TEMPERATURE
      };

      if (systemInstruction) {
        requestConfig.systemInstruction = systemInstruction;
      }

      const response = await client.models.generateContent({
        model: modelName,
        contents,
        config: requestConfig
      });

      if (response && response.text) {
        console.log(`[Gemini Service] Successfully generated response from ${modelName}`);
        return response.text;
      }
    } catch (err) {
      console.warn(`[Gemini Service] Model '${modelName}' returned error: ${err.message}. Trying next candidate...`);
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to generate response from Google Gemini API');
};

/**
 * Generate embedding vector using Gemini text-embedding-004 model
 * @param {string} text 
 * @returns {Promise<number[]>} Vector array
 */
const generateGeminiEmbedding = async (text) => {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('GEMINI_API_KEY is missing');
  }

  const embeddingModel = config.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001';
  const response = await client.models.embedContent({
    model: embeddingModel,
    contents: text
  });

  if (response && response.embeddings && response.embeddings[0] && response.embeddings[0].values) {
    return response.embeddings[0].values;
  }

  if (response && response.embedding && response.embedding.values) {
    return response.embedding.values;
  }

  throw new Error('Invalid embedding response structure from Gemini API');
};

module.exports = {
  getGeminiClient,
  generateGeminiCompletion,
  generateGeminiEmbedding
};

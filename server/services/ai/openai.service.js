const OpenAI = require('openai');
const config = require('../../config/aiConfig');

/**
 * OpenAI Service Wrapper
 * Handles API client initialization and execution for OpenAI calls
 */

let openaiClient = null;

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('OPENAI_API_KEY is not configured in environment variables');
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: apiKey.trim() });
  }
  return openaiClient;
};

/**
 * Generate chat completion response from OpenAI
 * @param {Array<{ role: string, content: string }>} messages 
 * @param {Object} options 
 * @returns {Promise<string>} LLM answer string
 */
const generateCompletion = async (messages, options = {}) => {
  const client = getOpenAIClient();
  const model = options.model || config.LLM_MODEL;
  const temperature = options.temperature !== undefined ? options.temperature : config.LLM_TEMPERATURE;
  const max_tokens = options.max_tokens || config.MAX_TOKENS;

  try {
    const response = await client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('[OpenAI Service] Chat Completion Error:', error.message);
    throw new Error(`AI service failure: ${error.message}`);
  }
};

module.exports = {
  getOpenAIClient,
  generateCompletion
};

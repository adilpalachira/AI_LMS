/**
 * Quiz Prompt Service
 * Constructs prompt templates for generating structured AI quiz questions based on context
 */

/**
 * Build system prompt for quiz generation
 * @param {string} courseTitle 
 * @param {string} questionType 
 * @param {string} difficulty 
 * @param {number} count 
 * @returns {string} System prompt
 */
const buildQuizSystemPrompt = (courseTitle, questionType, difficulty, count) => {
  return `You are an expert academic evaluator and assessment designer for the course "${courseTitle}".
Your objective is to generate exactly ${count} high-quality, academically rigorous questions based STRICTLY on the provided course learning context.

CRITICAL CONSTRAINTS:
1. Every question MUST be directly derived from the provided course material. Do NOT invent facts or hallucinate details outside the context.
2. Question Type: ${questionType} (Options: 'MCQ', 'True/False', 'Short Answer', 'Descriptive').
3. Difficulty Level: ${difficulty} (Options: 'Easy', 'Medium', 'Hard').
4. For MCQ questions: Provide exactly 4 options, with exactly 1 correct answer matching one of the options.
5. For True/False questions: Provide options ["True", "False"], with correctAnswer as either "True" or "False".
6. For Short Answer / Descriptive questions: Provide options as an empty array [], and provide a clear model answer as correctAnswer.
7. Include a clear, educational explanation for why the answer is correct.
8. Output MUST be valid, structured JSON adhering strictly to the JSON schema format requested. Do NOT include markdown code fences or conversational preambles.`;
};

/**
 * Build user prompt for quiz generation with retrieved context
 * @param {string} topic 
 * @param {string} contextBlock 
 * @param {string} questionType 
 * @param {string} difficulty 
 * @param {number} count 
 * @returns {string} User prompt
 */
const buildQuizUserPrompt = (topic, contextBlock, questionType, difficulty, count) => {
  const topicInstruction = topic && topic.trim() ? `Specific Focus Topic: "${topic.trim()}"\n` : '';

  return `${topicInstruction}Learning Material Context:
---
${contextBlock || 'General course contents.'}
---

Generate ${count} ${difficulty} level ${questionType} question(s) strictly using the material above.

Return a JSON object with a single key "questions" containing an array of ${count} question object(s).

JSON Structure Example:
{
  "questions": [
    {
      "question": "Which normal form removes partial dependency?",
      "type": "${questionType}",
      "difficulty": "${difficulty}",
      "options": ["1NF", "2NF", "3NF", "BCNF"],
      "correctAnswer": "2NF",
      "explanation": "2NF removes partial dependency on composite primary keys.",
      "marks": 1,
      "source": "Course Material",
      "sourcePage": 1
    }
  ]
}`;
};

module.exports = {
  buildQuizSystemPrompt,
  buildQuizUserPrompt
};

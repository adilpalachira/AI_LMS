/**
 * Centralized Configuration for AI Tutor & RAG System
 */
module.exports = {
  // Text Chunking Config
  CHUNK_SIZE: parseInt(process.env.RAG_CHUNK_SIZE, 10) || 1000,
  CHUNK_OVERLAP: parseInt(process.env.RAG_CHUNK_OVERLAP, 10) || 200,

  // Vector Search Config
  TOP_K: parseInt(process.env.RAG_TOP_K, 10) || 4,
  SIMILARITY_THRESHOLD: parseFloat(process.env.RAG_SIMILARITY_THRESHOLD) || 0.65,

  // OpenAI Model Config
  EMBEDDING_MODEL: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
  LLM_MODEL: process.env.OPENAI_LLM_MODEL || 'gpt-4o-mini',
  LLM_TEMPERATURE: 0.2,
  MAX_TOKENS: 800,

  // Pinecone Default Namespace
  PINECONE_INDEX: process.env.PINECONE_INDEX || 'ai-lms-knowledge',
  PINECONE_NAMESPACE: process.env.PINECONE_NAMESPACE || 'course-materials'
};

import api from './api';

/**
 * AI Tutor API Client Service
 */
export const aiTutorService = {
  // Ask a question / execute RAG completion
  askQuestion: async (sessionId, question, courseId) => {
    const response = await api.post('/ai/tutor/chat', {
      sessionId,
      question,
      courseId
    });
    return response.data;
  },

  // Create new session
  createSession: async (courseId, title) => {
    const response = await api.post('/ai/tutor/sessions', {
      courseId,
      title
    });
    return response.data;
  },

  // Get user chat sessions (filtered optional by courseId)
  getSessions: async (courseId = null) => {
    const url = courseId ? `/ai/tutor/sessions?courseId=${courseId}` : '/ai/tutor/sessions';
    const response = await api.get(url);
    return response.data;
  },

  // Get session message history by ID
  getSessionById: async (sessionId) => {
    const response = await api.get(`/ai/tutor/sessions/${sessionId}`);
    return response.data;
  },

  // Delete chat session
  deleteSession: async (sessionId) => {
    const response = await api.delete(`/ai/tutor/sessions/${sessionId}`);
    return response.data;
  },

  // Get knowledge base document processing statuses (Faculty/Admin)
  getKnowledgeDocuments: async (courseId = null, status = 'All') => {
    let url = `/ai/knowledge-documents?status=${status}`;
    if (courseId) {
      url += `&courseId=${courseId}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  // Retry document processing
  retryDocumentProcessing: async (documentId) => {
    const response = await api.post(`/ai/knowledge-documents/${documentId}/retry`);
    return response.data;
  },

  // Remove document from vector store
  deleteKnowledgeDocument: async (documentId) => {
    const response = await api.delete(`/ai/knowledge-documents/${documentId}`);
    return response.data;
  }
};

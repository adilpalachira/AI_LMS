import api from './api';

// ==========================================
// ASSIGNMENTS API SERVICES
// ==========================================

export const getAssignmentsByCourse = async (courseId) => {
  const url = courseId ? `/assignments?courseId=${courseId}` : '/assignments';
  const response = await api.get(url);
  return response.data;
};

export const getAllAssignments = async () => {
  const response = await api.get('/assignments');
  return response.data;
};

export const getAssignmentById = async (id) => {
  const response = await api.get(`/assignments/${id}`);
  return response.data;
};

export const createAssignment = async (assignmentData) => {
  const response = await api.post('/assignments', assignmentData);
  return response.data;
};

export const updateAssignment = async (id, assignmentData) => {
  const response = await api.put(`/assignments/${id}`, assignmentData);
  return response.data;
};

export const deleteAssignment = async (id) => {
  const response = await api.delete(`/assignments/${id}`);
  return response.data;
};

// ==========================================
// SUBMISSIONS API SERVICES
// ==========================================

export const submitAssignment = async (assignmentId, file, onProgress) => {
  const formData = new FormData();
  formData.append('assignmentId', assignmentId);
  formData.append('file', file);

  const response = await api.post('/submissions', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    }
  });
  return response.data;
};

export const getSubmissionsByAssignment = async (assignmentId) => {
  const response = await api.get(`/submissions?assignmentId=${assignmentId}`);
  return response.data;
};

export const gradeSubmission = async (id, gradeData) => {
  const response = await api.put(`/submissions/${id}`, gradeData);
  return response.data;
};

// ==========================================
// QUIZZES API SERVICES
// ==========================================

export const getQuizzesByCourse = async (courseId) => {
  const response = await api.get(`/quizzes?courseId=${courseId}`);
  return response.data;
};

export const getQuizById = async (id) => {
  const response = await api.get(`/quizzes/${id}`);
  return response.data;
};

export const createQuiz = async (quizData) => {
  const response = await api.post('/quizzes', quizData);
  return response.data;
};

export const updateQuiz = async (id, quizData) => {
  const response = await api.put(`/quizzes/${id}`, quizData);
  return response.data;
};

export const deleteQuiz = async (id) => {
  const response = await api.delete(`/quizzes/${id}`);
  return response.data;
};

export const submitQuizAttempt = async (quizId, answers) => {
  const response = await api.post(`/quizzes/${quizId}/attempt`, { answers });
  return response.data;
};

export const getQuizAttempts = async (quizId) => {
  const response = await api.get(`/quizzes/${quizId}/attempts`);
  return response.data;
};

// ==========================================
// QUESTIONS & QUESTION BANK API SERVICES
// ==========================================

export const getQuestionBank = async (params = {}) => {
  const query = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      query.append(key, params[key]);
    }
  });
  const response = await api.get(`/questions?${query.toString()}`);
  return response.data;
};

export const createQuestion = async (questionData) => {
  const response = await api.post('/questions', questionData);
  return response.data;
};

export const updateQuestion = async (id, questionData) => {
  const response = await api.put(`/questions/${id}`, questionData);
  return response.data;
};

export const deleteQuestion = async (id) => {
  const response = await api.delete(`/questions/${id}`);
  return response.data;
};

export const approveQuestionBankItem = async (id) => {
  const response = await api.patch(`/questions/${id}/approve`);
  return response.data;
};

export const archiveQuestionBankItem = async (id) => {
  const response = await api.patch(`/questions/${id}/archive`);
  return response.data;
};

export const addBankQuestionsToQuiz = async (quizId, questionIds) => {
  const response = await api.post(`/quizzes/${quizId}/questions`, { questionIds });
  return response.data;
};

// ==========================================
// AI QUIZ GENERATOR API SERVICES
// ==========================================

export const generateAiQuestions = async (payload) => {
  const response = await api.post('/ai/quizzes/generate', payload);
  return response.data;
};

export const getAiGenerationHistory = async (courseId) => {
  const url = courseId ? `/ai/quizzes/generation-history?courseId=${courseId}` : '/ai/quizzes/generation-history';
  const response = await api.get(url);
  return response.data;
};

export const bulkSaveQuestions = async (payload) => {
  const response = await api.post('/ai/quizzes/bulk-save', payload);
  return response.data;
};

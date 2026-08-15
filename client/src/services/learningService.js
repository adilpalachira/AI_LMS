import api from './api';

const learningService = {
  // Learning Profile & Performance Analysis
  getProfile: async () => {
    const response = await api.get('/learning/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/learning/profile', data);
    return response.data;
  },

  analyzePerformance: async () => {
    const response = await api.post('/learning/analyze');
    return response.data;
  },

  getRecommendations: async () => {
    const response = await api.get('/learning/recommendations');
    return response.data;
  },

  getLearningPath: async (courseId) => {
    const response = await api.get(`/learning/path/${courseId}`);
    return response.data;
  },

  // Study Plan Operations
  createStudyPlan: async (data) => {
    const response = await api.post('/study-plans', data);
    return response.data;
  },

  getStudyPlans: async () => {
    const response = await api.get('/study-plans');
    return response.data;
  },

  getStudyPlanById: async (id) => {
    const response = await api.get(`/study-plans/${id}`);
    return response.data;
  },

  deleteStudyPlan: async (id) => {
    const response = await api.delete(`/study-plans/${id}`);
    return response.data;
  },

  completeTask: async (taskId) => {
    const response = await api.patch(`/study-plans/tasks/${taskId}/complete`);
    return response.data;
  },

  rescheduleTask: async (taskId, newDate) => {
    const response = await api.patch(`/study-plans/tasks/${taskId}/reschedule`, { newDate });
    return response.data;
  },

  skipTask: async (taskId) => {
    const response = await api.patch(`/study-plans/tasks/${taskId}/skip`);
    return response.data;
  },

  updateTaskStatus: async (taskId, status) => {
    const response = await api.patch(`/study-plans/tasks/${taskId}/status`, { status });
    return response.data;
  }
};

export default learningService;

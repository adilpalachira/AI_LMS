import api from './api';

export const analyticsService = {
  /**
   * Get student performance & ML risk prediction
   * @param {string} courseId 
   * @param {string} studentId 
   */
  getStudentPerformance: async (courseId, studentId) => {
    const params = {};
    if (courseId) params.courseId = courseId;
    if (studentId) params.studentId = studentId;
    const response = await api.get('/analytics/student-performance', { params });
    return response.data;
  },

  /**
   * Get overall course analytics summary
   * @param {string} courseId 
   */
  getCourseAnalytics: async (courseId) => {
    const response = await api.get(`/analytics/course-summary/${courseId}`);
    return response.data;
  },

  /**
   * Get at-risk students list (Faculty/Admin scope)
   * @param {object} filters { courseId, riskLevel }
   */
  getAtRiskStudents: async (filters = {}) => {
    const response = await api.get('/analytics/at-risk-students', { params: filters });
    return response.data;
  },

  /**
   * Get dashboard analytics overview metrics
   */
  getDashboardAnalytics: async () => {
    const response = await api.get('/analytics/dashboard-metrics');
    return response.data;
  },

  /**
   * MODULE 10: Get detailed student learning analytics & trends
   * @param {string} timeframe '7d' | '30d' | '90d' | 'all'
   * @param {string} studentId optional student ID for faculty/admin view
   */
  getStudentDetailedAnalytics: async (timeframe = '30d', studentId = null) => {
    const params = { timeframe };
    if (studentId) params.studentId = studentId;
    const response = await api.get('/analytics/student/detailed', { params });
    return response.data;
  },

  /**
   * MODULE 10: Get detailed course analytics & item difficulty analysis
   * @param {string} courseId 
   * @param {string} timeframe '7d' | '30d' | '90d' | 'all'
   */
  getCourseDetailedAnalytics: async (courseId, timeframe = '30d') => {
    const response = await api.get(`/analytics/course/${courseId}/detailed`, { params: { timeframe } });
    return response.data;
  },

  /**
   * MODULE 10: Get admin system-wide academic overview & course comparison matrix
   * @param {string} timeframe '7d' | '30d' | '90d' | 'all'
   */
  getAdminSystemAnalytics: async (timeframe = '30d') => {
    const response = await api.get('/analytics/admin/overview', { params: { timeframe } });
    return response.data;
  }
};

export default analyticsService;

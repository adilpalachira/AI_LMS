import api from './api';

// ==========================================
// CATEGORY API SERVICES
// ==========================================

export const getCategories = async (params = {}) => {
  const response = await api.get('/categories', { params });
  return response.data;
};

export const getCategoryById = async (id) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await api.post('/categories', categoryData);
  return response.data;
};

export const updateCategory = async (id, categoryData) => {
  const response = await api.put(`/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

// ==========================================
// COURSE API SERVICES
// ==========================================

export const getCourses = async (params = {}) => {
  const response = await api.get('/courses', { params });
  return response.data;
};

export const getCourseById = async (id) => {
  const response = await api.get(`/courses/${id}`);
  return response.data;
};

export const createCourse = async (formData) => {
  const response = await api.post('/courses', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateCourse = async (id, formData) => {
  const response = await api.put(`/courses/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const publishCourse = async (id) => {
  const response = await api.patch(`/courses/${id}/publish`);
  return response.data;
};

export const archiveCourse = async (id) => {
  const response = await api.patch(`/courses/${id}/archive`);
  return response.data;
};

export const deleteCourse = async (id) => {
  const response = await api.delete(`/courses/${id}`);
  return response.data;
};

// ==========================================
// ENROLLMENT API SERVICES
// ==========================================

export const enrollCourse = async (courseId) => {
  const response = await api.post(`/courses/${courseId}/enroll`);
  return response.data;
};

export const unenrollCourse = async (courseId) => {
  const response = await api.delete(`/courses/${courseId}/enroll`);
  return response.data;
};

export const getMyEnrollments = async () => {
  const response = await api.get('/courses/my-enrollments');
  return response.data;
};

export const getMyTaughtCourses = async () => {
  const response = await api.get('/courses/my-courses');
  return response.data;
};

export const getCourseStudents = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/students`);
  return response.data;
};

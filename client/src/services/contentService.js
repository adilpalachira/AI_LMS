import api from './api';

// ==========================================
// SECTION API SERVICES
// ==========================================

export const getSectionsByCourse = async (courseId) => {
  const response = await api.get(`/sections?courseId=${courseId}`);
  return response.data;
};

export const createSection = async (sectionData) => {
  const response = await api.post('/sections', sectionData);
  return response.data;
};

export const updateSection = async (id, sectionData) => {
  const response = await api.put(`/sections/${id}`, sectionData);
  return response.data;
};

export const deleteSection = async (id) => {
  const response = await api.delete(`/sections/${id}`);
  return response.data;
};

// ==========================================
// LESSON API SERVICES
// ==========================================

export const getLessonsBySection = async (sectionId) => {
  const response = await api.get(`/lessons?sectionId=${sectionId}`);
  return response.data;
};

export const getLessonById = async (id) => {
  const response = await api.get(`/lessons/${id}`);
  return response.data;
};

export const createLesson = async (lessonData) => {
  const response = await api.post('/lessons', lessonData);
  return response.data;
};

export const updateLesson = async (id, lessonData) => {
  const response = await api.put(`/lessons/${id}`, lessonData);
  return response.data;
};

export const deleteLesson = async (id) => {
  const response = await api.delete(`/lessons/${id}`);
  return response.data;
};

// ==========================================
// LEARNING MATERIAL API SERVICES
// ==========================================

export const getMaterialsByLesson = async (lessonId) => {
  const response = await api.get(`/materials/${lessonId}`);
  return response.data;
};

export const uploadMaterial = async (lessonId, file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('lessonId', lessonId);
  formData.append('file', file);

  const response = await api.post('/materials/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      }
    }
  });
  return response.data;
};

export const deleteMaterial = async (id) => {
  const response = await api.delete(`/materials/${id}`);
  return response.data;
};

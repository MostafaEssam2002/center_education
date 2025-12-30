import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  findAll: () =>
    api.get('/auth'),

  findOne: (id) =>
    api.get(`/auth/${id}`),
};

// User API
export const userAPI = {
  register: (userData) =>
    api.post('/user/register', userData),

  findAll: () =>
    api.get('/user'),

  findByEmail: (email) =>
    api.get(`/user/${email}`),

  update: (id, userData) =>
    api.patch(`/user/${id}`, userData),

  remove: (id) =>
    api.delete(`/user/${id}`),
};

// Course API
export const courseAPI = {
  create: (courseData) =>
    api.post('/course', courseData),

  findAll: () =>
    api.get('/course'),

  search: (title) =>
    api.get('/course/search', { params: { title } }),

  update: (id, courseData) =>
    api.patch(`/course/${id}`, courseData),

  remove: (id) =>
    api.delete(`/course/${id}`),
};

// Chapter API
export const chapterAPI = {
  create: (chapterData) =>
    api.post('/chapter', chapterData),

  findAllByCourse: (courseId) =>
    api.get(`/chapter/course/${courseId}`),

  findOne: (id) =>
    api.get(`/chapter/${id}`),

  update: (id, chapterData) =>
    api.patch(`/chapter/${id}`, chapterData),

  remove: (id) =>
    api.delete(`/chapter/${id}`),
};

// Upload API
export const uploadAPI = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Enrollment API
export const enrollmentAPI = {
  // Student sends enrollment request
  requestEnrollment: (courseId) =>
    api.post('/enrollment/request', { courseId }),

  // Teacher/Admin views all enrollment requests for a course
  getRequestsByCourse: (courseId) =>
    api.get(`/enrollment/requests/${courseId}`),

  // Student withdraws their enrollment request
  withdrawRequest: (courseId) =>
    api.delete(`/enrollment/request/${courseId}`),

  // Admin/Teacher enrolls a student in a course
  enroll: (studentId, courseId) =>
    api.post('/enrollment', { studentId, courseId }),

  // Admin/Teacher views all students in a course
  getStudentsByCourse: (courseId) =>
    api.get(`/enrollment/course/${courseId}`),

  // Admin/Student views all courses of a student
  getCoursesByStudent: (studentId) =>
    api.get(`/enrollment/student/${studentId}`),
};

// Chapter Progress API
export const chapterProgressAPI = {
  // Update video progress
  updateVideoProgress: (chapterId, progress) =>
    api.post('/chapter-progress/video', { chapterId, progress }),

  // Get chapter progress
  getChapterProgress: (chapterId) =>
    api.get(`/chapter-progress/chapter/${chapterId}`),

  // Get course progress
  getCourseProgress: (courseId) =>
    api.get(`/chapter-progress/course/${courseId}`),
};

export default api;

import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

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
    api.post('/auth/register', userData),

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

  findAllByCourse: (courseId, page = 1, chapterPerPage = 10) =>
    api.get(`/chapter/course/${courseId}`, { params: { page, chapterPerPage } }),

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

  // Admin/Students views all courses of a student
  getCoursesByStudent: (studentId) =>
    api.get(`/enrollment/student/${studentId}`),

  // Teacher/Admin rejects an enrollment request
  rejectRequest: (courseId, studentId) =>
    api.delete(`/enrollment/request/${courseId}/${studentId}`),

  // Student confirms payment after teacher approval
  confirmPayment: (courseId) =>
    api.post(`/enrollment/confirm-payment/${courseId}`),

  // Student gets their own requests
  getMyRequests: () =>
    api.get('/enrollment/my-requests'),
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
// Course Schedule API
export const courseScheduleAPI = {
  create: (scheduleData) =>
    api.post('/course-schedule', scheduleData),

  update: (id, scheduleData) =>
    api.patch(`/course-schedule/${id}`, scheduleData),

  remove: (id) =>
    api.delete(`/course-schedule/${id}`),

  findWeeklySchedule: () =>
    api.get('/course-schedule/weekly'),

  findStudentSchedule: () =>
    api.get('/course-schedule/student'),
};

// Room API
export const roomAPI = {
  findAll: () =>
    api.get('/room'),

  create: (roomData) =>
    api.post('/room', roomData),

  update: (id, roomData) =>
    api.patch(`/room/${id}`, roomData),

  remove: (id) =>
    api.delete(`/room/${id}`),
};

// Attendance API
export const attendanceAPI = {
  // Create a new session
  createSession: (sessionData) =>
    api.post('/attendance/session', sessionData),

  // Mark attendance for a single student
  markAttendance: (attendanceData) =>
    api.post('/attendance/mark', attendanceData),

  // Mark bulk attendance for a session
  markBulkAttendance: (sessionId, students) =>
    api.post(`/attendance/mark-bulk/${sessionId}`, { students }),

  // Get attendance for a specific session
  getSessionAttendance: (sessionId) =>
    api.get(`/attendance/session/${sessionId}`),

  // Get all sessions for a course
  getCourseSessions: (courseId) =>
    api.get(`/attendance/course/${courseId}`),

  // Get student attendance in a course
  getStudentAttendanceInCourse: (courseId) =>
    api.get(`/attendance/my/course/${courseId}`),
};

// Quiz API
export const quizAPI = {
  create: (quizData) =>
    api.post('/quizzes', quizData),

  update: (id, quizData) =>
    api.patch(`/quizzes/${id}`, quizData),

  publish: (quizId) =>
    api.patch(`/quizzes/${quizId}/publish`),

  findOne: (quizId) =>
    api.get(`/quizzes/${quizId}`),

  findByCourse: (courseId) =>
    api.get(`/quizzes/course/${courseId}`),

  getStats: (quizId) =>
    api.get(`/quiz-attempts/${quizId}/stats`),
};

// Quiz Question API
export const quizQuestionAPI = {
  create: (questionData) =>
    api.post('/quiz-questions', questionData),

  findAll: (quizId) =>
    api.get(`/quiz-questions/${quizId}`),

  update: (id, questionData) =>
    api.patch(`/quiz-questions/${id}`, questionData),

  remove: (id) =>
    api.delete(`/quiz-questions/${id}`),
};

// Quiz Option API
export const quizOptionAPI = {
  create: (optionData) =>
    api.post('/quiz-options', optionData),

  remove: (id) =>
    api.delete(`/quiz-options/${id}`),
};

// Quiz Attempt API
export const quizAttemptAPI = {
  start: (quizId) =>
    api.post(`/quiz-attempts/start/${quizId}`),

  submitAnswer: (attemptId, questionId, optionId) =>
    api.post(`/quiz-attempts/${attemptId}/answer`, { questionId, optionId }),

  finish: (attemptId) =>
    api.post(`/quiz-attempts/${attemptId}/finish`),

  review: (attemptId) =>
    api.get(`/quiz-attempts/${attemptId}/review`),

  deleteAnswer: (attemptId, questionId) =>
    api.delete(`/quiz-attempts/${attemptId}/answer/${questionId}`),
};

// Assignment API
export const assignmentAPI = {
  // Teacher creates assignment
  create: (assignmentData) =>
    api.post('/assignments', assignmentData),

  // Teacher updates assignment
  update: (id, assignmentData) =>
    api.patch(`/assignments/${id}`, assignmentData),

  // Teacher gets submissions for an assignment
  getSubmissions: (assignmentId) =>
    api.get(`/assignments/${assignmentId}/submissions`),

  // Teacher reviews a submission
  reviewSubmission: (submissionId, reviewData) =>
    api.patch(`/assignments/submissions/${submissionId}/review`, reviewData),

  // Student gets their assignments
  getMyAssignments: () =>
    api.get('/assignments/my'),

  // Student submits assignment
  submitAssignment: (assignmentId, filePath) =>
    api.post(`/assignments/${assignmentId}/submit`, { filePath }),

  // Get assignments by chapter
  getByChapter: (chapterId) =>
    api.get(`/assignments/chapter/${chapterId}`),

  // Delete assignment
  delete: (id) =>
    api.delete(`/assignments/${id}`),
};

// Payment API
export const paymentAPI = {
  // Student initiates payment for enrollment request
  initiatePayment: (enrollmentRequestId, integration_id, walletPhoneNumber) =>
    api.post('/payments/initiate', { enrollmentRequestId, integration_id, walletPhoneNumber }),
};

export default api;

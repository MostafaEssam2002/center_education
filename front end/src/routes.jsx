import { Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Components Imports
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Chapters from './pages/Chapters';
import ChapterDetail from './pages/ChapterDetail';
import EnrollmentRequests from './pages/EnrollmentRequests';
import MyEnrollments from './pages/MyEnrollments';
import PendingPayments from './pages/PendingPayments';
import MyMonthlyPayments from './pages/MyMonthlyPayments';
import CourseStudents from './pages/CourseStudents';
import MonthlyPayments from './pages/MonthlyPayments';
import Schedule from './pages/Schedule';
import Attendance from './pages/Attendance';
import StudentSchedule from './pages/StudentSchedule';
import RoomManagement from './pages/RoomManagement';
import AddRoom from './pages/AddRoom';
import ManageQuizzes from './pages/ManageQuizzes';
import CreateQuiz from './pages/CreateQuiz';
import EditQuiz from './pages/EditQuiz';
import ManageQuestions from './pages/ManageQuestions';
import StudentQuizzes from './pages/StudentQuizzes';
import TakeQuiz from './pages/TakeQuiz';
import QuizResults from './pages/QuizResults';
import QuizStatistics from './pages/QuizStatistics';
import ManageAssignments from './pages/ManageAssignments';
import AssignmentSubmissions from './pages/AssignmentSubmissions';
import StudentAssignments from './pages/StudentAssignments';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import LandingPage from './pages/LandingPage';
import StudentCourseStatistics from './pages/StudentCourseStatistics';
import TeacherStatistics from './pages/TeacherStatistics';

// Public Routes (Auth)
export const publicRoutes = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/',
    element: <LandingPage />,
  },
];

// Dashboard Routes
export const dashboardRoutes = [
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
];

// User Management Routes
export const userManagementRoutes = [
  {
    path: '/users',
    element: (
      <ProtectedRoute>
        <Users />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
];

// Course Related Routes
export const courseRoutes = [
  {
    path: '/courses',
    element: (
      <ProtectedRoute>
        <Courses />
      </ProtectedRoute>
    ),
  },
  {
    path: '/courses/:id',
    element: (
      <ProtectedRoute>
        <CourseDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: '/chapters',
    element: (
      <ProtectedRoute>
        <Chapters />
      </ProtectedRoute>
    ),
  },
  {
    path: '/courses/:courseId/chapters/:id',
    element: (
      <ProtectedRoute>
        <ChapterDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: '/courses/:id/students',
    element: (
      <ProtectedRoute>
        <CourseStudents />
      </ProtectedRoute>
    ),
  },
];

// Enrollment Routes
export const enrollmentRoutes = [
  {
    path: '/enrollment-requests',
    element: (
      <ProtectedRoute>
        <EnrollmentRequests />
      </ProtectedRoute>
    ),
  },
  {
    path: '/my-enrollments',
    element: (
      <ProtectedRoute>
        <MyEnrollments />
      </ProtectedRoute>
    ),
  },
  {
    path: '/pending-payments',
    element: (
      <ProtectedRoute>
        <PendingPayments />
      </ProtectedRoute>
    ),
  },
  {
    path: '/my-monthly-payments',
    element: (
      <ProtectedRoute>
        <MyMonthlyPayments />
      </ProtectedRoute>
    ),
  },
];

// Schedule and Attendance Routes
export const scheduleRoutes = [
  {
    path: '/schedule',
    element: (
      <ProtectedRoute>
        <Schedule />
      </ProtectedRoute>
    ),
  },
  {
    path: '/student-schedule',
    element: (
      <ProtectedRoute>
        <StudentSchedule />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendance',
    element: (
      <ProtectedRoute>
        <Attendance />
      </ProtectedRoute>
    ),
  },
  {
    path: '/student-statistics',
    element: (
      <ProtectedRoute>
        <StudentCourseStatistics />
      </ProtectedRoute>
    ),
  },
  {
    path: '/teacher-statistics',
    element: (
      <ProtectedRoute allowedRoles={['TEACHER']}>
        <TeacherStatistics />
      </ProtectedRoute>
    ),
  },
];

// Room Management Routes
export const roomRoutes = [
  {
    path: '/rooms',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'EMPLOYEE']}>
        <RoomManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: '/add-room',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'EMPLOYEE']}>
        <AddRoom />
      </ProtectedRoute>
    ),
  },
];

// Employee Routes
export const employeeRoutes = [
  {
    path: '/monthly-payments',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
        <MonthlyPayments />
      </ProtectedRoute>
    ),
  },
];

// Quiz Related Routes
export const quizRoutes = [
  {
    path: '/courses/:courseId/quizzes',
    element: (
      <ProtectedRoute>
        <ManageQuizzes />
      </ProtectedRoute>
    ),
  },
  {
    path: '/courses/:courseId/quizzes/create',
    element: (
      <ProtectedRoute>
        <CreateQuiz />
      </ProtectedRoute>
    ),
  },
  {
    path: '/quizzes/:quizId/questions',
    element: (
      <ProtectedRoute>
        <ManageQuestions />
      </ProtectedRoute>
    ),
  },
  {
    path: '/quizzes/:quizId/edit',
    element: (
      <ProtectedRoute>
        <EditQuiz />
      </ProtectedRoute>
    ),
  },
  {
    path: '/quizzes/:quizId/statistics',
    element: (
      <ProtectedRoute>
        <QuizStatistics />
      </ProtectedRoute>
    ),
  },
  {
    path: '/my-quizzes',
    element: (
      <ProtectedRoute>
        <StudentQuizzes />
      </ProtectedRoute>
    ),
  },
  {
    path: '/quizzes/:quizId/take',
    element: (
      <ProtectedRoute>
        <TakeQuiz />
      </ProtectedRoute>
    ),
  },
  {
    path: '/quiz-attempts/:attemptId/results',
    element: (
      <ProtectedRoute>
        <QuizResults />
      </ProtectedRoute>
    ),
  },
];

// Assignment Related Routes
export const assignmentRoutes = [
  {
    path: '/courses/:courseId/chapters/:chapterId/assignments',
    element: (
      <ProtectedRoute>
        <ManageAssignments />
      </ProtectedRoute>
    ),
  },
  {
    path: '/assignments/:assignmentId/submissions',
    element: (
      <ProtectedRoute>
        <AssignmentSubmissions />
      </ProtectedRoute>
    ),
  },
  {
    path: '/my-assignments',
    element: (
      <ProtectedRoute>
        <StudentAssignments />
      </ProtectedRoute>
    ),
  },
];

// Communication Routes
export const communicationRoutes = [
  {
    path: '/chat',
    element: (
      <ProtectedRoute>
        <Chat />
      </ProtectedRoute>
    ),
  },
];

// Redirect Routes
export const redirectRoutes = [
  {
    path: '/home',
    element: <Navigate to="/" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
];

// Combine all routes
export const allRoutes = [
  ...publicRoutes,
  ...dashboardRoutes,
  ...userManagementRoutes,
  ...courseRoutes,
  ...enrollmentRoutes,
  ...scheduleRoutes,
  ...roomRoutes,
  ...employeeRoutes,
  ...quizRoutes,
  ...assignmentRoutes,
  ...communicationRoutes,
  ...redirectRoutes,
];

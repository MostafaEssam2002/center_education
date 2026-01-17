import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
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
import CourseStudents from './pages/CourseStudents';
import Schedule from './pages/Schedule';
import Attendance from './pages/Attendance';
import StudentSchedule from './pages/StudentSchedule';
import RoomManagement from './pages/RoomManagement';
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

import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses"
                element={
                  <ProtectedRoute>
                    <Courses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/:id"
                element={
                  <ProtectedRoute>
                    <CourseDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/:courseId/chapters/:id"
                element={
                  <ProtectedRoute>
                    <ChapterDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/:id/students"
                element={
                  <ProtectedRoute>
                    <CourseStudents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chapters"
                element={
                  <ProtectedRoute>
                    <Chapters />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/enrollment-requests"
                element={
                  <ProtectedRoute>
                    <EnrollmentRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-enrollments"
                element={
                  <ProtectedRoute>
                    <MyEnrollments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pending-payments"
                element={
                  <ProtectedRoute>
                    <PendingPayments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/schedule"
                element={
                  <ProtectedRoute>
                    <Schedule />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student-schedule"
                element={
                  <ProtectedRoute>
                    <StudentSchedule />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendance"
                element={
                  <ProtectedRoute>
                    <Attendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rooms"
                element={
                  <ProtectedRoute>
                    <RoomManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/:courseId/quizzes"
                element={
                  <ProtectedRoute>
                    <ManageQuizzes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/:courseId/quizzes/create"
                element={
                  <ProtectedRoute>
                    <CreateQuiz />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quizzes/:quizId/questions"
                element={
                  <ProtectedRoute>
                    <ManageQuestions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quizzes/:quizId/statistics"
                element={
                  <ProtectedRoute>
                    <QuizStatistics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quizzes/:quizId/edit"
                element={
                  <ProtectedRoute>
                    <EditQuiz />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-quizzes"
                element={
                  <ProtectedRoute>
                    <StudentQuizzes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quizzes/:quizId/take"
                element={
                  <ProtectedRoute>
                    <TakeQuiz />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz-attempts/:attemptId/results"
                element={
                  <ProtectedRoute>
                    <QuizResults />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses/:courseId/chapters/:chapterId/assignments"
                element={
                  <ProtectedRoute>
                    <ManageAssignments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assignments/:assignmentId/submissions"
                element={
                  <ProtectedRoute>
                    <AssignmentSubmissions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-assignments"
                element={
                  <ProtectedRoute>
                    <StudentAssignments />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;


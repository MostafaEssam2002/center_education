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
import CourseStudents from './pages/CourseStudents';
import Schedule from './pages/Schedule';

import StudentSchedule from './pages/StudentSchedule';

function App() {
  return (
    <AuthProvider>
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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;


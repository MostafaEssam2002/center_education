# Project Exploration Summary

## 1. Charting/Visualization Libraries

### Currently Installed
- **recharts** (v3.8.1) - Main charting library for data visualization
  - Used in: `StudentCourseStatistics.jsx`, `QuizStatistics.jsx`, `CenterPerformance.jsx`
  - Components used: BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer

### Other Relevant Libraries
- **framer-motion** (v11.0.0) - For animations and transitions
- **lucide-react** (v0.408.0) - Icon library
- **socket.io-client** (v4.8.3) - Real-time communication

---

## 2. Existing Teacher Dashboard Components & Pages

### Teacher-Related Pages Location
**Path:** `front end/src/pages/`

#### Existing Teacher Pages:
1. **TeacherCourseProgress.jsx** - Currently empty (needs implementation)
   - Intended for teacher course progress tracking

2. **QuizStatistics.jsx** - Quiz results and statistics
   - Fetches from: `quizAPI.getStats(quizId)`
   - Displays attempt statistics with auto-refresh (10 sec intervals)
   - Has CSV export functionality
   - Shows: Student name, email, score, percentage, status, time taken

3. **CourseStudents.jsx** - List of enrolled students in a course
   - Fetches enrolled students for a course
   - Displays student information in a table
   
4. **ManageQuizzes.jsx** - Quiz management for teachers
   - Create and edit quizzes

5. **ManageAssignments.jsx** - Assignment management for teachers
   - Create and manage assignments

6. **AssignmentSubmissions.jsx** - View student assignment submissions

7. **CenterPerformance.jsx** - Admin-only dashboard showing:
   - Top teachers by enrollment requests
   - Top courses by enrollments
   - Center-wide performance metrics
   - Uses recharts BarChart for visualization

### Teacher Dashboard Access
- **Dashboard.jsx** loads `appAPI.getTeacherStatistics()` for teachers
- Route: `/dashboard`

---

## 3. API Endpoints for Teacher Data

### Base URL: `http://localhost:3000`

### Teacher Statistics Endpoint
```
GET /teacher/statistics
Authentication: JWT Bearer Token
Role: TEACHER
```
**Returns:**
- Course statistics for all teacher's courses including:
  - Total enrollments
  - Total requests
  - Total chapters
  - Total quizzes
  - Progress statistics
  - Assignment counts
  - Attendance percentages
  - Request status breakdowns

### Quiz-Related Endpoints
```
GET /quiz-attempts/{quizId}/stats
Authentication: JWT Bearer Token
Role: TEACHER
```
**Returns:**
- Quiz statistics including all student attempts
- Student names, emails, scores, percentages
- Submission status and timestamps
- Time taken for each attempt

```
GET /quizzes/{quizId}
GET /quizzes/course/{courseId}
POST /quizzes (create)
PATCH /quizzes/{id} (update)
PATCH /quizzes/{id}/publish
```

### Course/Student Data Endpoints
```
GET /enrollment/course/{courseId}
```
**Returns:** All students enrolled in a specific course

### Chapter Progress Endpoints
```
GET /chapter-progress/course/{courseId}
```
**Returns:** Overall course progress metrics

### Assignment Endpoints
```
GET /assignment/course/{courseId}
```
**Returns:** All assignments for a course

### Attendance Endpoints
```
GET /attendance/course/{courseId}
```
**Returns:** Attendance data for all students in a course

### Student Statistics (for teachers to view)
```
GET /statistics (student view - returns their own data)
GET /teacher/statistics (teacher dashboard)
```

---

## 4. Frontend Folder Structure

### Pages Directory Structure
**Path:** `front end/src/pages/`

```
pages/
├── Dashboard.jsx
├── TeacherCourseProgress.jsx (EMPTY - needs implementation)
├── QuizStatistics.jsx
├── CourseStudents.jsx
├── ManageQuizzes.jsx
├── ManageAssignments.jsx
├── AssignmentSubmissions.jsx
├── CenterPerformance.jsx
├── Attendance.jsx
├── StudentCourseStatistics.jsx
├── StudentQuizzes.jsx
├── StudentAssignments.jsx
├── StudentSchedule.jsx
├── Courses.jsx
├── CourseDetail.jsx
├── Chapters.jsx
├── ChapterDetail.jsx
├── Users.jsx
├── Profile.jsx
├── And more... (41 total pages)
```

### Components Directory Structure
**Path:** `front end/src/pages/components/`

```
components/
├── attendance/
├── ConfirmationModal.jsx
├── CourseCard.jsx
├── FileUpload.jsx
├── Layout.jsx
├── PDFViewer.jsx
├── ProtectedRoute.jsx
├── Sidebar.jsx
├── VideoPlayer.jsx
```

### Services
**Path:** `front end/src/services/api.js`

Contains API client configuration with interceptors and organized API modules:
- authAPI
- userAPI
- appAPI
- courseAPI
- chapterAPI
- uploadAPI
- enrollmentAPI
- chapterProgressAPI
- courseScheduleAPI
- roomAPI
- attendanceAPI
- quizAPI
- quizQuestionAPI
- quizOptionAPI
- quizAttemptAPI

---

## 5. Backend Module Structure

**Path:** `src/`

### Key Modules for Teacher Dashboard
- **app.controller.ts / app.service.ts** - Main statistics endpoints
- **quiz/** - Quiz management and statistics
- **quiz-attempt/** - Quiz attempt tracking and stats (`/quiz-attempts/{quizId}/stats`)
- **course/** - Course management
- **chapter-progress/** - Student progress tracking
- **enrollment/** - Student enrollments
- **assignment/** - Assignment management
- **attendance/** - Attendance tracking
- **user/** - User management
- **auth/** - Authentication with JWT

### Database Schema (Prisma)
**Path:** `prisma/schema.prisma`

Main entities for teacher dashboard:
- User (STUDENT, TEACHER, ADMIN roles)
- Course (created by teacher)
- Chapter
- Quiz
- QuizAttempt
- Assignment
- ChapterProgress
- Attendance
- Enrollment
- EnrollmentRequest

---

## 6. Currently Used Charting Patterns in Existing Pages

### StudentCourseStatistics.jsx
```javascript
<BarChart width={chartWidth} height={400} data={courseProgressData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Bar dataKey="progress" fill="#8884d8" />
</BarChart>
```

### QuizStatistics.jsx
- Doesn't use recharts (only logic, no charts currently)
- Exports CSV data
- Uses auto-refresh mechanism

### CenterPerformance.jsx
```javascript
<BarChart width={getChartWidth(dataLength)} height={400} data={chartData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Bar dataKey="requests" fill="#82ca9d" />
  <Bar dataKey="enrollments" fill="#8884d8" />
</BarChart>
```

---

## 7. Data Available for Teacher Dashboards

### Per Teacher:
- Total number of active courses
- Total enrollments across all courses
- Total pending enrollment requests
- Average student progress across all courses
- Top performing students
- Assignment submission rates
- Quiz completion and average scores
- Student attendance percentages

### Per Course:
- Enrolled student count
- Pending requests count
- Student progress percentages
- Assignment submission status
- Quiz statistics by student
- Attendance records

### Per Quiz:
- Individual student attempts and scores
- Submission timestamps
- Time taken per student
- Pass/fail rates
- Distribution of scores

---

## 8. Authentication & Authorization

### Routes Protected By:
- JWT Bearer Token (in Authorization header)
- Role-based access control (RolesGuard)
- Teacher role check

### Available to Teachers:
- View own course statistics
- View quiz statistics for own quizzes
- View enrolled students in own courses
- View assignment submissions
- View attendance records
- Manage quizzes and assignments (create/update/publish)

---

## Ready for Implementation

### For Teacher Dashboard Development:
✅ Database schema is ready
✅ API endpoints exist for:
  - Teacher statistics
  - Quiz statistics
  - Course/student data
  - Progress tracking
  - Assignment tracking
  - Attendance tracking

✅ Frontend components structure is in place
✅ Recharts is already installed and used in similar pages
✅ API service module is already set up with proper interceptors
✅ Authentication/authorization is already implemented

### Next Steps:
1. Implement **TeacherCourseProgress.jsx** (currently empty)
2. Create new dashboard components using recharts
3. Integrate API endpoints with charting components
4. Add real-time updates where needed (socket.io-client ready)

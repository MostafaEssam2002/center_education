# Student Course Statistics Page - Backend Integration Guide

## Overview
The Student Course Statistics page (`/student-statistics`) displays real-time statistics for enrolled students, pulling data from the backend APIs.

## Data Sources and API Integration

### 1. **Course Enrollments**
**Endpoint:** `GET /enrollment/student/:studentId`
**Status:** ✅ Implemented
**Data Retrieved:**
- List of courses the student is enrolled in
- Course ID, title, and enrollment status
- Uses this to loop through and load statistics for each course

```javascript
const enrollmentResponse = await enrollmentAPI.getCoursesByStudent(user.id);
```

---

### 2. **Course Progress**
**Endpoint:** `GET /chapter-progress/course/:courseId`
**Status:** ✅ Implemented
**Data Retrieved:**
- Average progress percentage across all chapters (0-100)
- Calculated as: sum of all chapter progress / total chapters

**How it works:**
- Service gets all chapters in the course
- Queries `chapterProgress` table for each chapter
- Returns average progress percentage

```javascript
const progressResponse = await chapterProgressAPI.getCourseProgress(courseId);
stats.progress = Math.round(progressResponse.data || 0); // Returns 0-100
```

---

### 3. **Student Attendance**
**Endpoint:** `GET /attendance/my/course/:courseId`
**Status:** ✅ Implemented
**Data Retrieved:**
- Array of attendance records for the student in the course
- Each record includes:
  - `status`: "PRESENT", "LATE", or "ABSENT"
  - `session`: Session details (date, time, room)
  - `createdAt`: When marked

**Calculation:**
- Attended = records with status "PRESENT" or "LATE"
- Total = total number of attendance records
- Percentage = (attended / total) × 100

```javascript
const attendanceResponse = await attendanceAPI.getStudentAttendanceInCourse(courseId);
// Filters for PRESENT and LATE as attended sessions
```

---

### 4. **Assignments**
**Endpoint:** `GET /assignments/my`
**Status:** ✅ Implemented
**Data Retrieved:**
- Array of all assignments for the logged-in student
- **Filters by:** `courseId === enrollment.courseId`
- Each assignment includes:
  - `id`, `title`, `dueDate`
  - `submissions`: Array of submission records
  - `submissions[].grade`: Grade given by teacher
  - `submissions[].feedback`: Teacher's feedback
  - `submissions[].createdAt`: Submission date

**Calculation:**
- Total assignments = assignments in course
- Submitted = assignments with submission records
- Details include grade, feedback, and due date

```javascript
const assignmentsResponse = await assignmentAPI.getMyAssignments();
// Filters by courseId and processes submission data
```

---

### 5. **Quizzes** ⚠️
**Endpoint:** `GET /quizzes/course/:courseId` (for quiz list)
**Status:** 📋 Partial - Lists quizzes but student attempts not loaded
**Note:** Currently shows quiz titles and total count but not individual student scores

**Available endpoints:**
- `GET /quizzes/course/:courseId` - Get all quizzes in a course
- `GET /quiz-attempts/:attemptId/review` - Review a specific attempt (requires attempt ID)
- `GET /quiz-attempts/:quizId/stats` - Get general quiz stats (teacher only)

**Future Enhancement Needed:**
- Need endpoint to get all student attempts for a course, or
- Need to loop through quizzes and get attempts per quiz

---

## Data Flow Diagram

```
Student Visits /student-statistics
         ↓
1️⃣ Get Enrolled Courses
   └─ /enrollment/student/:id → [Course1, Course2, ...]
         ↓
2️⃣ For Each Course, Load:
   
   a. Progress
      └─ /chapter-progress/course/:courseId → progress%
   
   b. Attendance  
      └─ /attendance/my/course/:courseId → [{status, date, ...}]
   
   c. Assignments
      └─ /assignments/my → filter by courseId → [{title, grade, ...}]
   
   d. Quizzes (List only, no scores for now)
      └─ /quizzes/course/:courseId → [{id, title, ...}]
         ↓
Display Combined Stats Dashboard
```

---

## Component State Management

### State Variables
```javascript
const [enrollments, setEnrollments] = useState([]);      // Enrolled courses
const [statistics, setStatistics] = useState({});         // Per-course stats
const [loading, setLoading] = useState(true);            // Loading indicator
const [error, setError] = useState('');                  // Error messages
const [activeTab, setActiveTab] = useState('overview');  // Tab selection
```

### Statistics Object Structure
```javascript
statistics[courseId] = {
  courseName: "JavaScript Basics",
  progress: 75,
  attendance: {
    attended: 8,
    total: 10,
    percentage: 80
  },
  quizzes: {
    completed: 0,
    total: 3,
    averageScore: 0,
    details: []
  },
  assignments: {
    completed: 2,
    total: 5,
    submitted: 2,
    details: [
      {
        id: 1,
        title: "Assignment 1",
        submitted: true,
        dueDate: "2026-03-28",
        grade: 95,
        feedback: "Excellent work!"
      }
    ]
  }
}
```

---

## Tabs Display Logic

### 1. Overview Tab
- Shows aggregated statistics for each enrolled course
- Circular progress indicators for:
  - Course completion %
  - Attendance percentage
  - Average quiz score
  - Assignment submission count
- "Go to Course" button for each course

### 2. Quizzes Tab
- Lists all quizzes across enrolled courses
- Currently shows quiz titles (scores not implemented)
- Table format with columns: Name, Score, Status

### 3. Assignments Tab
- All assignments the student is enrolled in
- Shows:
  - Title
  - Submission status (submitted/pending)
  - Grade (if submitted)
  - Teacher feedback
  - Due date

---

## Error Handling

Each API call is wrapped in try-catch:
- If specific stat fails (e.g., attendance), that stat defaults to 0
- Page continues loading other stats
- Overall load error shows user-friendly message
- Console logs detailed errors for debugging

```javascript
try {
  // Load data
} catch (err) {
  console.error(`Failed to load...`, err);
  // Set default values
}
```

---

## Backend Requirements Checklist

- ✅ `/enrollment/student/:studentId` - Returns enrolled courses
- ✅ `/chapter-progress/course/:courseId` - Returns progress percentage
- ✅ `/attendance/my/course/:courseId` - Returns attendance records
- ✅ `/assignments/my` - Returns student's assignments
- ✅ `/quizzes/course/:courseId` - Returns course quizzes
- ⚠️ `/quiz-attempts/[?]` - Student quiz scores (partial support)

---

## Usage

**Route:** `/student-statistics`  
**Required Role:** STUDENT  
**Authentication:** Required (JWT token)

**Features:**
- Automatic load on page visit
- Manual refresh button
- Real-time data from backend
- Responsive design with RTL support

---

## Testing the Integration

### 1. Verify Backend is Running
```bash
npm run start:dev  # In backend directory
```

### 2. Create Test Data
- Create student account
- Enroll in courses
- Create assignments and quizzes
- Mark some attendance

### 3. Visit Statistics Page
```
http://localhost:5173/student-statistics
```

### 4. Check Browser Console
- Look for API response logs
- Check error messages if any
- Verify data structure

---

## Future Enhancements

1. **Quiz Statistics**
   - Add endpoint to get student's quiz attempts
   - Show attempt scores and dates
   - Display time spent on quiz

2. **Performance**
   - Add pagination for large course lists
   - Cache statistics for 5-10 minutes
   - Add loading skeletons

3. **Interactivity**
   - Expand/collapse courses
   - Download statistics report
   - Export to PDF

4. **Visualizations**
   - Add line charts for progress over time
   - Bar charts for comparison with class average
   - Pie charts for topic-wise progress

---

## Debugging Tips

1. **Check Network Tab** in browser DevTools
   - Verify API calls are made
   - Check response status and data

2. **Add Console Logs**
   ```javascript
   console.log('API Response:', enrollmentResponse);
   console.log('Statistics:', statistics);
   ```

3. **Test Each API Endpoint** separately with Postman/Insomnia

4. **Check Token Expiry** - statistics page requires valid JWT

---

## Support

For issues or improvements, check:
- Backend controller files in `src/*` directory
- Frontend component in `front end/src/pages/StudentCourseStatistics.jsx`
- CSS in `front end/src/styles/StudentStatistics.css`

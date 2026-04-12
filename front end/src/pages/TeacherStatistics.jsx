import { useState, useEffect } from 'react';
import { appAPI, quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/StudentStatistics.css';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const TeacherStatistics = () => {
  const { user, loading } = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseStats, setCourseStats] = useState(null);

  // Colors for charts
  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

  useEffect(() => {
    if (user && !loading) {
      loadTeacherStatistics();
    }
  }, [user]);

  const loadTeacherStatistics = async () => {
    setPageLoading(true);
    setError('');
    try {
      const response = await appAPI.getTeacherStatistics();
      setStatistics(response.data);
      if (response.data?.courses?.length > 0) {
        setSelectedCourse(response.data.courses[0]);
      }
    } catch (err) {
      console.error('Failed to load teacher statistics:', err);
      setError(err?.response?.data?.message || 'فشل تحميل إحصائيات المعلم');
      setStatistics(null);
    } finally {
      setPageLoading(false);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setCourseStats(null);
  };

  const getStudentRankings = () => {
    if (!selectedCourse?.enrollments) return [];

    const rankings = (selectedCourse.enrollments || [])
      .map((enrollment) => {
        const studentQuizzes = (selectedCourse.quizzes?.details || []).filter(
          (quiz) => quiz.attempts?.some((a) => a.studentId === enrollment.studentId)
        );
        const quizScores = studentQuizzes
          .flatMap((quiz) => quiz.attempts?.filter((a) => a.studentId === enrollment.studentId) || [])
          .filter((a) => a.status === 'SUBMITTED' || a.status === 'TIMED_OUT')
          .map((a) => (a.score / (a.totalMarks || 1)) * 100);

        const avgScore = quizScores.length > 0 ? quizScores.reduce((a, b) => a + b) / quizScores.length : 0;

        return {
          name: `${enrollment.student?.first_name || ''} ${enrollment.student?.last_name || ''}`.trim(),
          score: Math.round(avgScore * 10) / 10,
          quizCount: studentQuizzes.length,
          progress: 0,
          email: enrollment.student?.email,
        };
      })
      .sort((a, b) => b.score - a.score);

    return rankings;
  };

  const getQuizPerformanceDistribution = () => {
    if (!selectedCourse?.quizzes?.details) return [];

    const distribution = {
      excellent: 0, // 80-100
      good: 0, // 60-79
      average: 0, // 40-59
      poor: 0, // 0-39
    };

    (selectedCourse.quizzes.details || []).forEach((quiz) => {
      (quiz.attempts || [])
        .filter((a) => a.status === 'SUBMITTED' || a.status === 'TIMED_OUT')
        .forEach((attempt) => {
          const percentage = (attempt.score / (quiz.totalMarks || 1)) * 100;
          if (percentage >= 80) distribution.excellent++;
          else if (percentage >= 60) distribution.good++;
          else if (percentage >= 40) distribution.average++;
          else distribution.poor++;
        });
    });

    return [
      { name: 'ممتاز (80-100)', value: distribution.excellent, color: '#00C853' },
      { name: 'جيد (60-79)', value: distribution.good, color: '#2196F3' },
      { name: 'متوسط (40-59)', value: distribution.average, color: '#FF9800' },
      { name: 'ضعيف (0-39)', value: distribution.poor, color: '#F44336' },
    ].filter((item) => item.value > 0);
  };

  const getCourseProgress = () => {
    const courses = statistics?.courses || [];
    return courses.map((course) => ({
      name: course.title,
      avgProgress: Math.round(
        (course.enrollments || []).reduce((sum, e) => sum + (e.progress || 0), 0) / (course.enrollments?.length || 1)
      ),
      students: course.enrollments?.length || 0,
      quizzes: course.quizzes?.details?.length || 0,
      assignments: course.assignments?.details?.length || 0,
    }));
  };

  const getAssignmentCompletion = () => {
    if (!selectedCourse?.assignments?.details) return [];

    return (selectedCourse.assignments.details || []).map((assignment) => {
      const submitted = (selectedCourse.enrollments || []).filter(
        (e) => e.assignments?.details?.find((a) => a.id === assignment.id && a.submitted)
      ).length;

      return {
        name: assignment.title.substring(0, 20),
        completed: submitted,
        pending: (selectedCourse.enrollments?.length || 0) - submitted,
        percentage: Math.round((submitted / (selectedCourse.enrollments?.length || 1)) * 100),
      };
    });
  };

  const getAttendanceStats = () => {
    if (!selectedCourse?.enrollments) return [];

    return (selectedCourse.enrollments || [])
      .map((enrollment) => {
        const attendance = enrollment.attendance || [];
        const presentDays = attendance.filter((a) => a.status === 'PRESENT').length;
        const attendancePercentage = attendance.length > 0 ? (presentDays / attendance.length) * 100 : 0;

        return {
          name: `${enrollment.student?.first_name} ${enrollment.student?.last_name}`,
          present: presentDays,
          absent: attendance.filter((a) => a.status === 'ABSENT').length,
          percentage: Math.round(attendancePercentage),
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  };

  const getSummary = () => {
    if (!statistics) {
      return {
        totalCourses: 0,
        totalStudents: 0,
        averageScore: 0,
        totalQuizzes: 0,
      };
    }

    const courses = statistics.courses || [];
    const totalStudents = courses.reduce((sum, c) => sum + (c.enrollments?.length || 0), 0);
    const allAttempts = courses
      .flatMap((c) => c.quizzes?.details || [])
      .flatMap((q) => (q.attempts || []).filter((a) => a.status === 'SUBMITTED' || a.status === 'TIMED_OUT'));
    const avgScore =
      allAttempts.length > 0
        ? Math.round(
            allAttempts.reduce((sum, a) => sum + (a.score / (a.quiz?.totalMarks || 1)) * 100, 0) / allAttempts.length * 10
          ) / 10
        : 0;

    return {
      totalCourses: courses.length,
      totalStudents,
      averageScore,
      totalQuizzes: courses.reduce((sum, c) => sum + (c.quizzes?.details?.length || 0), 0),
    };
  };

  const renderSummaryCards = () => {
    const summary = getSummary();
    return (
      <div className="statistics-summary">
        <div className="summary-card">
          <div className="summary-value">{summary.totalCourses}</div>
          <div className="summary-label">المقررات الدراسية</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{summary.totalStudents}</div>
          <div className="summary-label">عدد الطلاب</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{summary.averageScore}%</div>
          <div className="summary-label">متوسط الدرجات</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{summary.totalQuizzes}</div>
          <div className="summary-label">عدد الاختبارات</div>
        </div>
      </div>
    );
  };

  const renderStudentRankings = () => {
    const rankings = getStudentRankings();
    const chartWidth = Math.max(700, rankings.length * 100);

    if (rankings.length === 0) {
      return (
        <div className="card">
          <div className="empty-state">
            <div>لا توجد بيانات لعرض ترتيب الطلاب</div>
          </div>
        </div>
      );
    }

    return (
      <div className="card">
        <h3>🏆 ترتيب الطلاب حسب متوسط الدرجات</h3>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <ResponsiveContainer width={chartWidth} height={400}>
            <BarChart
              data={rankings}
              margin={{ top: 20, right: 30, left: 0, bottom: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #ccc' }}
                formatter={(value) => `${value.toFixed(1)}%`}
                labelFormatter={(label) => `الطالب: ${label}`}
              />
              <Bar dataKey="score" fill="#4ECDC4" name="متوسط الدرجات (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="ranking-list">
          {rankings.slice(0, 10).map((student, index) => (
            <div key={index} className="ranking-item">
              <span className="ranking-position">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </span>
              <span className="ranking-name">{student.name}</span>
              <span className="ranking-score">{student.score.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderQuizPerformance = () => {
    const distribution = getQuizPerformanceDistribution();

    if (distribution.length === 0) {
      return (
        <div className="card">
          <div className="empty-state">
            <div>لا توجد اختبارات أو محاولات لعرض التوزيع</div>
          </div>
        </div>
      );
    }

    return (
      <div className="card">
        <h3>📊 توزيع نتائج الاختبارات</h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={distribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value, percent }) =>
                `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
              }
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `${value} طالب`}
              contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #ccc' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderCourseProgress = () => {
    const courseProgress = getCourseProgress();

    if (courseProgress.length === 0) {
      return (
        <div className="card">
          <div className="empty-state">
            <div>لا توجد مقررات دراسية</div>
          </div>
        </div>
      );
    }

    const chartWidth = Math.max(700, courseProgress.length * 120);

    return (
      <div className="card">
        <h3>📈 متوسط التقدم في المقررات</h3>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <ResponsiveContainer width={chartWidth} height={400}>
            <BarChart
              data={courseProgress}
              margin={{ top: 20, right: 30, left: 0, bottom: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #ccc' }}
                formatter={(value) => `${value}%`}
              />
              <Bar dataKey="avgProgress" fill="#45B7D1" name="التقدم المتوسط (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderAssignmentCompletion = () => {
    const assignments = getAssignmentCompletion();

    if (assignments.length === 0) {
      return (
        <div className="card">
          <div className="empty-state">
            <div>لا توجد واجبات في هذا المقرر</div>
          </div>
        </div>
      );
    }

    const chartWidth = Math.max(700, assignments.length * 120);

    return (
      <div className="card">
        <h3>📝 نسبة تسليم الواجبات</h3>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <ResponsiveContainer width={chartWidth} height={400}>
            <BarChart data={assignments} margin={{ top: 20, right: 30, left: 0, bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #ccc' }} />
              <Legend />
              <Bar dataKey="completed" fill="#00C853" name="تم التسليم" />
              <Bar dataKey="pending" fill="#FF9800" name="قيد الانتظار" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderAttendance = () => {
    const attendance = getAttendanceStats();

    if (attendance.length === 0) {
      return (
        <div className="card">
          <div className="empty-state">
            <div>لا توجد بيانات حضور</div>
          </div>
        </div>
      );
    }

    const chartWidth = Math.max(700, attendance.length * 100);

    return (
      <div className="card">
        <h3>📍 نسبة الحضور</h3>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <ResponsiveContainer width={chartWidth} height={400}>
            <BarChart data={attendance} margin={{ top: 20, right: 30, left: 0, bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #ccc' }} />
              <Legend />
              <Bar dataKey="present" fill="#4ECDC4" name="حاضر" />
              <Bar dataKey="absent" fill="#FF6B6B" name="غائب" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  if (pageLoading) {
    return (
      <div className="main-content">
        <div className="card">
          <div className="empty-state">
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>جاري تحميل إحصائيات المعلم...</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>يرجى الانتظار قليلاً</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="card">
          <div className="message error">{error}</div>
          <button className="btn btn-primary" style={{ marginTop: '15px' }} onClick={loadTeacherStatistics}>
            إعادة محاولة
          </button>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="main-content">
        <div className="card">
          <div className="empty-state">
            <div style={{ fontSize: '18px' }}>لا توجد بيانات لعرضها</div>
          </div>
        </div>
      </div>
    );
  }

  const courses = statistics.courses || [];

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>📊 إحصائيات المعلم</h1>
        <p>عرض شامل لأداء طلابك والمقررات الدراسية</p>
      </div>

      {renderSummaryCards()}

      {/* Course Selector */}
      {courses.length > 1 && (
        <div className="card">
          <h3>اختر المقرر الدراسي</h3>
          <div className="course-selector">
            {courses.map((course) => (
              <button
                key={course.id}
                className={`course-btn ${selectedCourse?.id === course.id ? 'active' : ''}`}
                onClick={() => handleCourseSelect(course)}
              >
                {course.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedCourse && (
        <>
          {/* Tabs */}
          <div className="tabs-container">
            <button
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              نظرة عامة
            </button>
            <button
              className={`tab ${activeTab === 'rankings' ? 'active' : ''}`}
              onClick={() => setActiveTab('rankings')}
            >
              ترتيب الطلاب
            </button>
            <button
              className={`tab ${activeTab === 'quizzes' ? 'active' : ''}`}
              onClick={() => setActiveTab('quizzes')}
            >
              الاختبارات
            </button>
            <button
              className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
              onClick={() => setActiveTab('assignments')}
            >
              الواجبات
            </button>
            <button
              className={`tab ${activeTab === 'attendance' ? 'active' : ''}`}
              onClick={() => setActiveTab('attendance')}
            >
              الحضور
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="tab-content">
              {renderCourseProgress()}
              {renderQuizPerformance()}
            </div>
          )}

          {/* Rankings Tab */}
          {activeTab === 'rankings' && (
            <div className="tab-content">
              {renderStudentRankings()}
            </div>
          )}

          {/* Quizzes Tab */}
          {activeTab === 'quizzes' && (
            <div className="tab-content">
              {renderQuizPerformance()}
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <div className="tab-content">
              {renderAssignmentCompletion()}
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="tab-content">
              {renderAttendance()}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeacherStatistics;

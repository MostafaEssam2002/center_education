import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appAPI } from '../services/api';
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
} from 'recharts';

const StudentCourseStatistics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadStudentStatistics();
  }, []);

  const loadStudentStatistics = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await appAPI.getStatistics();
      setStatistics(response.data);
    } catch (err) {
      console.error('Failed to load student statistics:', err);
      setError(err?.response?.data?.message || 'فشل تحميل الإحصائيات. تأكد من تسجيل الدخول.');
    } finally {
      setLoading(false);
    }
  };

  const getSummary = () => {
    if (!statistics) {
      return {
        totalCourses: 0,
        averageProgress: 0,
        totalQuizzes: 0,
        totalAssignments: 0,
      };
    }

    return {
      totalCourses: statistics.summary?.totalCourses ?? statistics.courses?.length ?? 0,
      averageProgress: statistics.summary?.averageProgress ?? (
        statistics.courses?.length
          ? Math.round(
              statistics.courses.reduce((sum, course) => sum + (course.progress || 0), 0) /
                statistics.courses.length
            )
          : 0
      ),
      totalQuizzes: statistics.summary?.totalQuizzes ?? statistics.courses?.reduce((sum, course) => sum + (course.quizzes?.total || 0), 0) ?? 0,
      totalAssignments: statistics.summary?.totalAssignments ?? statistics.courses?.reduce((sum, course) => sum + (course.assignments?.total || 0), 0) ?? 0,
    };
  };

  const getAssignmentCompletion = (course) => {
    if (!course?.assignments?.total) return 0;
    return Math.round((course.assignments.submitted / course.assignments.total) * 100);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return 'تم التسليم';
      case 'NOT_SUBMITTED':
        return 'لم يتم التسليم';
      case 'PENDING':
        return 'قيد الانتظار';
      default:
        return status || 'غير معروف';
    }
  };

  const summary = getSummary();
  const courses = statistics?.courses || [];
  const chartWidth = Math.max(700, courses.length * 140);

  if (loading) {
    return (
      <div className="main-content">
        <div className="card">
          <div className="empty-state">
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>جاري تحميل الإحصائيات...</div>
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
          <button className="btn btn-primary" style={{ marginTop: '15px' }} onClick={loadStudentStatistics}>
            إعادة محاولة
          </button>
        </div>
      </div>
    );
  }

  if (!user && !courses.length) {
    return (
      <div className="main-content">
        <div className="card">
          <div className="empty-state">
            <p>يجب تسجيل الدخول لعرض الإحصائيات.</p>
            <button className="btn btn-primary" style={{ marginTop: '15px' }} onClick={() => navigate('/login')}>
              تسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="main-content">
        <div className="card">
          <div className="card-header">
            <h2>إحصائياتي</h2>
          </div>
          <div className="empty-state">
            <p>لم تسجل في أي كورس بعد.</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>تواصل مع الإدارة لتسجيل في كورس.</p>
            <button className="btn btn-primary" style={{ marginTop: '15px' }} onClick={() => navigate('/courses')}>
              تصفح الكورسات المتاحة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="card statistics-container">
        <div
          className="card-header"
          style={{
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2>📊 إحصائيات الطالب</h2>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>مرحباً بك {user?.name || ''}</div>
          </div>
          <button className="btn btn-small btn-secondary" onClick={loadStudentStatistics} disabled={loading} style={{ marginTop: 0 }}>
            {loading ? 'جاري التحديث...' : '🔄 تحديث'}
          </button>
        </div>

        <div className="overall-stats">
          <h3 style={{ marginBottom: '20px', color: 'var(--primary-light)' }}>الإحصائيات العامة</h3>
          <div className="stats-grid">
            <StatCard icon="📚" title="الكورسات المسجلة" value={summary.totalCourses} unit="كورس" color="#667eea" />
            <StatCard icon="✅" title="متوسط التقدم" value={summary.averageProgress} unit="%" color="#10b981" />
            <StatCard icon="🎯" title="إجمالي الاختبارات" value={summary.totalQuizzes} unit="اختبار" color="#f59e0b" />
            <StatCard icon="📝" title="إجمالي الواجبات" value={summary.totalAssignments} unit="واجب" color="#ef5350" />
          </div>
        </div>

        <div className="tabs-container" style={{ marginTop: '30px' }}>
          <div className="tabs">
            <button className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              النظرة العامة
            </button>
            <button className={`tab-button ${activeTab === 'charts' ? 'active' : ''}`} onClick={() => setActiveTab('charts')}>
              الرسوم البيانية
            </button>
            <button className={`tab-button ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>
              التفاصيل
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="courses-statistics">
            {courses.map((course) => (
              <div key={course.courseId} className="course-stat-card">
                <div className="course-stat-header">
                  <div>
                    <h3 style={{ color: 'var(--primary-light)', marginBottom: '5px' }}>{course.courseName}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {course.progress}% تم إنجازه
                    </p>
                  </div>
                  <button className="btn btn-small btn-secondary" onClick={() => navigate(`/courses/${course.courseId}`)}>
                    اذهب للكورس
                  </button>
                </div>

                <div className="stat-metrics">
                  <div className="metric-item">
                    <div className="metric-label">التقدم العام</div>
                    <ProgressBar percentage={course.progress} />
                  </div>

                  <div className="metric-item">
                    <div className="metric-label">الحضور</div>
                    <ProgressBar percentage={course.attendance?.percentage || 0} />
                    <div className="metric-details">
                      {course.attendance?.attended ?? 0} / {course.attendance?.total ?? 0} حضور
                    </div>
                  </div>

                  <div className="metric-item">
                    <div className="metric-label">الاختبارات</div>
                    <div className="metric-value">
                      <span style={{ fontSize: '28px', fontWeight: 'bold' }}>{course.quizzes?.total ?? 0}</span>
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>اختبار</span>
                    </div>
                  </div>

                  <div className="metric-item">
                    <div className="metric-label">الواجبات</div>
                    <div className="metric-value">
                      <span style={{ fontSize: '28px', fontWeight: 'bold' }}>{course.assignments?.submitted ?? 0}</span>
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>/ {course.assignments?.total ?? 0}</span>
                    </div>
                    <div className="metric-details">واجب مُرسل</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="charts-container" style={{ marginTop: '20px' }}>
            <div className="chart-section">
              <h3 style={{ color: 'var(--primary-light)', marginBottom: '15px' }}>📈 تقدم الكورسات</h3>
              <div className="chart-wrapper" style={{ width: '100%', minHeight: 420, overflowX: 'auto' }}>
                <div style={{ width: chartWidth, minHeight: 420 }}>
                  <BarChart width={chartWidth} height={400} data={courses.map((course) => ({ name: course.courseName, progress: course.progress }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => `${value}%`}
                      contentStyle={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <Bar dataKey="progress" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </div>
              </div>
            </div>

            <div className="chart-section">
              <h3 style={{ color: 'var(--primary-light)', marginBottom: '15px' }}>📊 الأداء العام للكورسات</h3>
              <div className="chart-wrapper" style={{ width: '100%', minHeight: 420, overflowX: 'auto' }}>
                <div style={{ width: chartWidth, minHeight: 420 }}>
                  <BarChart
                    width={chartWidth}
                    height={400}
                    data={courses.map((course) => ({
                      name: course.courseName,
                      attendance: course.attendance?.percentage || 0,
                      assignments: getAssignmentCompletion(course),
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => `${value}%`}
                      contentStyle={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        color: '#111827',
                        boxShadow: '0 10px 20px rgba(15, 23, 42, 0.12)',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="attendance" name="الحضور %" fill="#3b82f6" />
                    <Bar dataKey="assignments" name="الواجبات %" fill="#f59e0b" />
                  </BarChart>
                </div>
              </div>
            </div>

            {courses.some((course) => (course.attendance?.total || 0) > 0) && (
              <div className="chart-section">
                <h3 style={{ color: 'var(--primary-light)', marginBottom: '15px' }}>✅ ملخص الحضور</h3>
                <div className="chart-wrapper" style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
                  {courses.filter((course) => (course.attendance?.total || 0) > 0).map((course) => (
                    <div key={course.courseId} style={{ marginBottom: '20px' }}>
                      <h4 style={{ textAlign: 'center', marginBottom: '10px' }}>{course.courseName}</h4>
                      <ResponsiveContainer width={300} height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'حاضر', value: course.attendance.attended },
                              { name: 'غائب', value: course.attendance.total - course.attendance.attended },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            <Cell fill="#10b981" />
                            <Cell fill="#ef4444" />
                          </Pie>
                          <Tooltip
                            formatter={(value) => value}
                            contentStyle={{
                              backgroundColor: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              color: '#111827',
                              boxShadow: '0 10px 20px rgba(15, 23, 42, 0.12)',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="details-container" style={{ marginTop: '20px' }}>
            {courses.map((course) => (
              <div key={course.courseId} className="course-details-section">
                <h3 style={{ color: 'var(--primary-light)', marginBottom: '15px' }}>{course.courseName}</h3>

                {course.assignments?.total > 0 && (
                  <div className="details-subsection">
                    <h4 style={{ marginBottom: '10px' }}>📝 الواجبات ({course.assignments.total})</h4>
                    <div className="assignments-list">
                      {course.assignments.details.map((assignment) => (
                        <div key={assignment.id} className="assignment-item">
                          <div className="assignment-header">
                            <div className="assignment-title">{assignment.title}</div>
                            <span className={`badge ${assignment.submitted ? 'badge-success' : 'badge-warning'}`}>
                              {assignment.submitted ? '✓ مرسل' : 'قيد الانتظار'}
                            </span>
                          </div>
                          {assignment.submitted && assignment.grade != null && (
                            <div className="assignment-details">
                              <div className="detail-row">
                                <span className="detail-label">التقدير:</span>
                                <span className="detail-value" style={{ color: '#10b981' }}>
                                  {assignment.grade} / 100
                                </span>
                              </div>
                              {assignment.feedback && (
                                <div className="detail-row">
                                  <span className="detail-label">ملاحظات المعلم:</span>
                                  <span className="detail-value">{assignment.feedback}</span>
                                </div>
                              )}
                            </div>
                          )}
                          {assignment.dueDate && (
                            <div className="assignment-due-date">
                              الموعد النهائي: {new Date(assignment.dueDate).toLocaleDateString('ar-EG')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {course.quizzes?.total > 0 && (
                  <div className="details-subsection">
                    <h4 style={{ marginBottom: '10px' }}>❓ الاختبارات ({course.quizzes.total})</h4>
                    <div className="details-table">
                      <div className="table-header">
                        <div className="table-cell">الاختبار</div>
                        <div className="table-cell">العلامة</div>
                        <div className="table-cell">الحالة</div>
                      </div>
                      {course.quizzes.details.map((quiz) => (
                        <div key={quiz.id} className="table-row">
                          <div className="table-cell">{quiz.title}</div>
                          <div className="table-cell">{quiz.score ?? '-'} / {quiz.totalMarks ?? '-'}</div>
                          <div className="table-cell">
                            <span className="badge badge-warning">{getStatusLabel(quiz.status)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProgressBar = ({ percentage = 0 }) => {
  let color = '#ef4444';
  if (percentage > 70) color = '#10b981';
  else if (percentage > 40) color = '#f59e0b';

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          width: '100%',
          height: '8px',
          background: 'rgba(148, 163, 184, 0.16)',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            width: `${Math.max(0, Math.min(percentage, 100))}%`,
            height: '100%',
            background: color,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <span style={{ color, fontWeight: 'bold', fontSize: '14px' }}>{percentage}%</span>
    </div>
  );
};

const StatCard = ({ icon, title, value, unit, color = '#667eea' }) => (
  <div className="stat-card" style={{ borderLeftColor: color }}>
    <div className="stat-icon" style={{ background: `${color}20`, color }}>
      {icon}
    </div>
    <div className="stat-content">
      <div className="stat-value">{value}</div>
      <div className="stat-title">{title}</div>
      {unit && <div className="stat-unit">{unit}</div>}
    </div>
  </div>
);

export default StudentCourseStatistics;

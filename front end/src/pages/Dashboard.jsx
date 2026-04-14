import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { appAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState('');

  const isStudent = user?.role === 'STUDENT';
  const isTeacher = user?.role === 'TEACHER';

  useEffect(() => {
    if (isStudent) {
      loadStudentStatistics();
    }
    if (isTeacher) {
      loadTeacherStatistics();
    }
  }, [isStudent, isTeacher]);

  const loadStudentStatistics = async () => {
    setLoadingStats(true);
    setStatsError('');
    try {
      const response = await appAPI.getStatistics();
      setStatistics(response.data);
    } catch (err) {
      console.error('Failed to load student statistics:', err);
      setStatsError(err?.response?.data?.message || 'فشل تحميل بيانات الطالب.');
      setStatistics(null);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadTeacherStatistics = async () => {
    setLoadingStats(true);
    setStatsError('');
    try {
      const response = await appAPI.getTeacherStatistics();
      setStatistics(response.data);
    } catch (err) {
      console.error('Failed to load teacher statistics:', err);
      setStatsError(err?.response?.data?.message || 'فشل تحميل بيانات المعلم.');
      setStatistics(null);
    } finally {
      setLoadingStats(false);
    }
  };

  const getRoleName = (role) => {
    const roles = {
      'USER': 'مستخدم',
      'TEACHER': 'معلم',
      'EMPLOYEE': 'موظف',
      'ASSISTANT': 'مساعد',
      'STUDENT': 'طالب',
      'ADMIN': 'مدير',
    };
    return roles[role] || role;
  };

  const incompleteAssignmentsCount = isStudent
    ? statistics?.courses?.reduce((sum, course) => {
        const deliverable = (course.assignments?.details || []).filter((assignment) => {
          const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
          const now = new Date();
          const notExpired = !dueDate || dueDate >= now;
          return !assignment.submitted && notExpired;
        }).length;
        return sum + deliverable;
      }, 0) ?? 0
    : 0;

  const getQuizStatus = (quiz, attempt) => {
    const now = new Date();
    const start = quiz.startTime ? new Date(quiz.startTime) : null;
    const end = quiz.endTime ? new Date(quiz.endTime) : null;

    if (!quiz.isPublished) return 'Not Published';
    if (attempt) {
      if (attempt.status === 'IN_PROGRESS') return 'In Progress';
      if (attempt.status === 'SUBMITTED') return 'Completed';
      if (attempt.status === 'TIMED_OUT') return 'Timed Out';
    }
    if (start && now < start) return 'Not Started';
    if (end && now > end) return 'Expired';
    return 'Available';
  };

  const upcomingQuizzesCount = isStudent
    ? statistics?.courses?.reduce((sum, course) => {
        const upcoming = (course.quizzes?.details || []).filter((quiz) => {
          const status = getQuizStatus(quiz, quiz.attempt || null);
          return ['Not Started', 'Available', 'In Progress'].includes(status);
        }).length;
        return sum + upcoming;
      }, 0) ?? 0
    : 0;

  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header">
          <h2>لوحة التحكم</h2>
        </div>

        <div style={{ marginBottom: '30px', padding: '20px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h3 style={{ marginBottom: '15px', color: '#667eea' }}>{isTeacher ? 'معلومات المعلم' : isStudent ? 'معلومات الطالب' : 'معلومات المستخدم'}</h3>
          <p><strong>البريد الإلكتروني:</strong> {user?.email}</p>
          <p>
            <strong>الدور:</strong>{' '}
            <span className={`badge badge-${user?.role}`}>
              {getRoleName(user?.role)}
            </span>
          </p>
          <p><strong>الاسم:</strong> {user?.first_name || user?.name || '-'} {user?.last_name || ''}</p>
        </div>

        {isStudent ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '25px' }}>
              <div className="stat-card" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h4 style={{ margin: '0 0 12px', color: '#a5b4fc' }}>الكورسات المسجلة</h4>
                <p style={{ fontSize: '2rem', margin: 0, color: '#ffffff' }}>{statistics?.summary?.totalCourses ?? statistics?.courses?.length ?? '-'}</p>
              </div>
              <div className="stat-card" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h4 style={{ margin: '0 0 12px', color: '#a5b4fc' }}>متوسط التقدم</h4>
                <p style={{ fontSize: '2rem', margin: 0, color: '#ffffff' }}>{statistics?.summary?.averageProgress ?? 0}%</p>
              </div>
              <div className="stat-card" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h4 style={{ margin: '0 0 12px', color: '#a5b4fc' }}>الواجبات غير المكتملة</h4>
                <p style={{ fontSize: '2rem', margin: 0, color: '#ffffff' }}>{incompleteAssignmentsCount}</p>
              </div>
              <div className="stat-card" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h4 style={{ margin: '0 0 12px', color: '#a5b4fc' }}>الاختبارات القادمة</h4>
                <p style={{ fontSize: '2rem', margin: 0, color: '#ffffff' }}>{upcomingQuizzesCount}</p>
              </div>
            </div>

            <div style={{ padding: '25px', background: 'rgba(15, 23, 42, 0.65)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '25px' }}>
              <h3 style={{ marginBottom: '15px', color: '#667eea' }}>أحدث الكورسات</h3>
              {loadingStats ? (
                <div className="empty-state">جاري تحميل بيانات الطالب...</div>
              ) : statsError ? (
                <div className="message error">{statsError}</div>
              ) : statistics?.courses?.length ? (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {statistics.courses.slice(0, 3).map((course) => (
                    <div key={course.courseId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#e2e8f0' }}>{course.courseName}</div>
                        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{course.progress}% تقدم</div>
                      </div>
                      <Link to={`/courses/${course.courseId}`} className="btn btn-small btn-secondary">عرض الكورس</Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  لا يوجد كورسات مسجلة بعد.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
              <Link to="/my-enrollments" className="btn btn-primary">عرض الكورسات المسجلة</Link>
              <Link to="/student-schedule" className="btn btn-secondary">عرض الجدول</Link>
              <Link to="/my-assignments" className="btn btn-secondary">الواجبات</Link>
              <Link to="/my-quizzes" className="btn btn-secondary">الاختبارات</Link>
            </div>
          </>
        ) : isTeacher ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '25px' }}>
              <div className="stat-card" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h4 style={{ margin: '0 0 12px', color: '#a5b4fc' }}>كورساتي</h4>
                <p style={{ fontSize: '2rem', margin: 0, color: '#ffffff' }}>{statistics?.summary?.totalCourses ?? 0}</p>
              </div>
              <div className="stat-card" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h4 style={{ margin: '0 0 12px', color: '#a5b4fc' }}>الطلاب الإجمالي</h4>
                <p style={{ fontSize: '2rem', margin: 0, color: '#ffffff' }}>{statistics?.summary?.totalStudents ?? 0}</p>
              </div>
              <div className="stat-card" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h4 style={{ margin: '0 0 12px', color: '#a5b4fc' }}>طلبات التسجيل</h4>
                <p style={{ fontSize: '2rem', margin: 0, color: '#ffffff' }}>{statistics?.summary?.totalRequests ?? 0}</p>
              </div>
              <div className="stat-card" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h4 style={{ margin: '0 0 12px', color: '#a5b4fc' }}>متوسط تقدم الطلاب</h4>
                <p style={{ fontSize: '2rem', margin: 0, color: '#ffffff' }}>{statistics?.summary?.averageProgress ?? 0}%</p>
              </div>
            </div>

            <div style={{ padding: '25px', background: 'rgba(15, 23, 42, 0.65)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '25px' }}>
              <h3 style={{ marginBottom: '15px', color: '#667eea' }}>كورساتي</h3>
              {loadingStats ? (
                <div className="empty-state">جاري تحميل بيانات المعلم...</div>
              ) : statsError ? (
                <div className="message error">{statsError}</div>
              ) : statistics?.courses?.length ? (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {statistics.courses.map((course) => (
                    <div key={course.courseId} style={{ padding: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '15px' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>{course.courseTitle}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                          <div style={{ color: '#cbd5e1' }}>الطلاب: <strong style={{ color: '#fff' }}>{course.studentCount}</strong></div>
                          <div style={{ color: '#cbd5e1' }}>طلبات: <strong style={{ color: '#fff' }}>{course.requestCount}</strong></div>
                          <div style={{ color: '#cbd5e1' }}>فصول: <strong style={{ color: '#fff' }}>{course.chapterCount}</strong></div>
                          <div style={{ color: '#cbd5e1' }}>واجبات: <strong style={{ color: '#fff' }}>{course.assignmentCount}</strong></div>
                          <div style={{ color: '#cbd5e1' }}>اختبارات: <strong style={{ color: '#fff' }}>{course.quizCount}</strong></div>
                          <div style={{ color: '#cbd5e1' }}>تقدم: <strong style={{ color: '#fff' }}>{course.averageProgress}%</strong></div>
                          <div style={{ color: '#cbd5e1' }}>حضور: <strong style={{ color: '#fff' }}>{course.attendance.percentage}%</strong></div>
                        </div>
                      </div>
                      <Link to={`/courses/${course.courseId}`} className="btn btn-small btn-secondary">عرض الكورس</Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">لا يوجد كورسات لإنشاء إحصائيات بعد.</div>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
              <Link to="/courses" className="btn btn-primary">إدارة الكورسات</Link>
              <Link to="/enrollment-requests" className="btn btn-secondary">موافقات الطلاب</Link>
              <Link to="/chapters" className="btn btn-secondary">إدارة الفصول</Link>
            </div>
          </>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <Link to="/users" className="card" style={{ textDecoration: 'none', color: 'inherit', padding: '30px', textAlign: 'center' }}>
              <h3 style={{ color: '#667eea', marginBottom: '10px' }}>👥 المستخدمين</h3>
              <p>إدارة المستخدمين وعرضهم</p>
            </Link>

            <Link to="/courses" className="card" style={{ textDecoration: 'none', color: 'inherit', padding: '30px', textAlign: 'center' }}>
              <h3 style={{ color: '#667eea', marginBottom: '10px' }}>📚 الكورسات</h3>
              <p>إدارة الكورسات وعرضها</p>
            </Link>

            <Link to="/chapters" className="card" style={{ textDecoration: 'none', color: 'inherit', padding: '30px', textAlign: 'center' }}>
              <h3 style={{ color: '#667eea', marginBottom: '10px' }}>📖 الفصول</h3>
              <p>إدارة فصول الكورسات</p>
            </Link>

            {(user?.role === 'ADMIN' || user?.role === 'EMPLOYEE') && (
              <Link to="/monthly-payments" className="card" style={{ textDecoration: 'none', color: 'inherit', padding: '30px', textAlign: 'center' }}>
                <h3 style={{ color: '#667eea', marginBottom: '10px' }}>💰 الاشتراكات الشهرية</h3>
                <p>متابعة مدفوعات الطلاب الشهرية</p>
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link to="/center-performance" className="card" style={{ textDecoration: 'none', color: 'inherit', padding: '30px', textAlign: 'center' }}>
                <h3 style={{ color: '#667eea', marginBottom: '10px' }}>📈 أداء المركز</h3>
                <p>عرض الرسوم البيانية والإحصائيات المركزية</p>
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link to="/admin-monthly-report" className="card" style={{ textDecoration: 'none', color: 'inherit', padding: '30px', textAlign: 'center' }}>
                <h3 style={{ color: '#667eea', marginBottom: '10px' }}>📊 تقرير إدارة الاشتراكات</h3>
                <p>عرض جرد شهري كامل للإدمن</p>
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link to="/admin-accounts" className="card" style={{ textDecoration: 'none', color: 'inherit', padding: '30px', textAlign: 'center' }}>
                <h3 style={{ color: '#667eea', marginBottom: '10px' }}>🧾 حسابات المركز</h3>
                <p>عرض الإيرادات وصافي المركز بعد خصم المعلم</p>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;


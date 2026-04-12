import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/StudentStatistics.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const CenterPerformance = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    if (!loading && user?.role !== 'ADMIN') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadReport();
    }
  }, [user?.role]);

  const loadReport = async () => {
    setLoadingReport(true);
    setError('');
    try {
      const response = await appAPI.getCenterPerformance();
      setReport(response.data);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'فشل تحميل تقرير أداء المركز');
      setReport(null);
    } finally {
      setLoadingReport(false);
    }
  };

  const getChartWidth = (dataLength) => Math.max(680, dataLength * 140);

  if (loading || loadingReport) {
    return (
      <div className="main-content">
        <div className="card">
          <div className="empty-state">
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>جاري تحميل تقرير الأداء...</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>يرجى الانتظار</div>
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
          <button className="btn btn-primary" style={{ marginTop: '15px' }} onClick={loadReport}>
            إعادة محاولة
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const teacherChartData = report.topTeachersByRequests.map((item) => ({
    name: item.teacherName,
    requests: item.requestCount,
    enrollments: item.enrollmentCount,
  }));

  const courseChartData = report.topCoursesByEnrollments.map((item) => ({
    name: item.courseTitle,
    enrollments: item.enrollmentsCount,
    requests: item.requestCount,
  }));

  return (
    <div className="main-content">
      <div className="card statistics-container">
        <div className="card-header" style={{ borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>📊 تقرير أداء المركز</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>عرض كامل للبيانات الخاصة بالمعلمين والكورسات.</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            العودة للوحة التحكم
          </button>
        </div>

        <div className="overall-stats" style={{ padding: '24px 30px' }}>
          <div className="stats-grid">
            <div className="stat-card" style={{ borderLeftColor: '#6366f1' }}>
              <div className="stat-icon">👩‍🏫</div>
              <div className="stat-content">
                <div className="stat-value">{report.teacherCount}</div>
                <div className="stat-title">عدد المعلمين</div>
              </div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#0ea5e9' }}>
              <div className="stat-icon">🎓</div>
              <div className="stat-content">
                <div className="stat-value">{report.studentCount}</div>
                <div className="stat-title">عدد الطلاب</div>
              </div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#14b8a6' }}>
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <div className="stat-value">{report.courseCount}</div>
                <div className="stat-title">عدد الكورسات</div>
              </div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#f97316' }}>
              <div className="stat-icon">📩</div>
              <div className="stat-content">
                <div className="stat-value">{report.totalRequests}</div>
                <div className="stat-title">طلبات الالتحاق</div>
              </div>
            </div>
          </div>
        </div>

        <div className="charts-container" style={{ padding: '30px' }}>
          <div className="chart-section">
            <h3 style={{ marginBottom: '15px', color: 'var(--primary-light)' }}>المعلمين الأعلى طلباً</h3>
            <div className="chart-wrapper" style={{ width: '100%', minHeight: 420, overflowX: 'auto' }}>
              <div style={{ width: getChartWidth(teacherChartData.length), minHeight: 420 }}>
                <BarChart width={getChartWidth(teacherChartData.length)} height={420} data={teacherChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }} />
                  <Legend />
                  <Bar dataKey="requests" name="طلبات" fill="#3b82f6" />
                  <Bar dataKey="enrollments" name="الطلاب المسجلين" fill="#10b981" />
                </BarChart>
              </div>
            </div>
          </div>

          <div className="chart-section">
            <h3 style={{ marginBottom: '15px', color: 'var(--primary-light)' }}>الكورسات الأكثر تسجيلًا</h3>
            <div className="chart-wrapper" style={{ width: '100%', minHeight: 420, overflowX: 'auto' }}>
              <div style={{ width: getChartWidth(courseChartData.length), minHeight: 420 }}>
                <BarChart width={getChartWidth(courseChartData.length)} height={420} data={courseChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }} />
                  <Legend />
                  <Bar dataKey="enrollments" name="المسجلين" fill="#6366f1" />
                  <Bar dataKey="requests" name="الطلبات" fill="#f59e0b" />
                </BarChart>
              </div>
            </div>
          </div>


          <div className="chart-section">
            <h3 style={{ marginBottom: '15px', color: 'var(--primary-light)' }}>المعلمين الأكثر نشاطًا</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>المعلم</th>
                    <th>الإيميل</th>
                    <th>عدد الكورسات</th>
                    <th>الطلبات</th>
                    <th>المسجلين</th>
                  </tr>
                </thead>
                <tbody>
                  {report.topTeachersByRequests.map((teacher, index) => (
                    <tr key={teacher.teacherId}>
                      <td>{index + 1}</td>
                      <td>{teacher.teacherName}</td>
                      <td>{teacher.email}</td>
                      <td>{teacher.courseCount}</td>
                      <td>{teacher.requestCount}</td>
                      <td>{teacher.enrollmentCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterPerformance;

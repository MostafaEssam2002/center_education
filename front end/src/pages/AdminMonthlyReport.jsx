import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminMonthlyReport = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
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
  }, [selectedMonth, selectedYear, user?.role]);

  const months = [
    { value: 1, label: 'يناير' },
    { value: 2, label: 'فبراير' },
    { value: 3, label: 'مارس' },
    { value: 4, label: 'أبريل' },
    { value: 5, label: 'مايو' },
    { value: 6, label: 'يونيو' },
    { value: 7, label: 'يوليو' },
    { value: 8, label: 'أغسطس' },
    { value: 9, label: 'سبتمبر' },
    { value: 10, label: 'أكتوبر' },
    { value: 11, label: 'نوفمبر' },
    { value: 12, label: 'ديسمبر' },
  ];

  const loadReport = async () => {
    setLoadingReport(true);
    setError('');

    try {
      const response = await paymentAPI.getAdminMonthlyReport(selectedMonth, selectedYear);
      setReport(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تحميل التقرير');
      setReport(null);
    } finally {
      setLoadingReport(false);
    }
  };

  const formatMoney = (amountCents) =>
    amountCents != null
      ? (amountCents / 100).toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })
      : '-';

  const formatDate = (dateValue) => {
    if (!dateValue) return '-';
    const date = new Date(dateValue);
    return date.toLocaleDateString('ar-EG');
  };

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h2>تقرير اشتراكات الإدارة الشهرية</h2>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            العودة للوحة التحكم
          </button>
        </div>

        <div style={{ padding: '20px', background: 'inherit', borderRadius: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                الشهر:
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--glass-bg)',
                  color: 'var(--text-primary)',
                  minWidth: '140px',
                }}
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                السنة:
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--glass-bg)',
                  color: 'var(--text-primary)',
                  minWidth: '120px',
                }}
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ alignSelf: 'flex-end' }}>
              <button className="btn btn-primary" onClick={loadReport} disabled={loadingReport}>
                {loadingReport ? 'جاري التحميل...' : 'تحديث التقرير'}
              </button>
            </div>
          </div>
        </div>

        {error && <div className="message error" style={{ marginBottom: '20px' }}>{error}</div>}

        {report && (
          <>
            <div style={{ display: 'grid', gap: '16px', marginBottom: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <div className="stat-card">
                <h4>الشهر</h4>
                <p>{months.find((m) => m.value === report.month)?.label || report.month} {report.year}</p>
              </div>
              <div className="stat-card">
                <h4>إجمالي الاشتراكات</h4>
                <p>{report.totalSubscriptions}</p>
              </div>
              <div className="stat-card">
                <h4>المدفوعة</h4>
                <p>{report.paidCount}</p>
              </div>
              <div className="stat-card">
                <h4>المعلقة</h4>
                <p>{report.pendingCount}</p>
              </div>
              <div className="stat-card">
                <h4>المتأخرة</h4>
                <p>{report.overdueCount}</p>
              </div>
              <div className="stat-card">
                <h4>المبلغ المحصل</h4>
                <p>{formatMoney(report.paidAmountCents)}</p>
              </div>
              <div className="stat-card">
                <h4>عدد المعلمين</h4>
                <p>{report.teacherCount}</p>
              </div>
              <div className="stat-card">
                <h4>عدد الموظفين</h4>
                <p>{report.employeeCount}</p>
              </div>
              <div className="stat-card">
                <h4>عدد المساعدين</h4>
                <p>{report.assistantCount}</p>
              </div>
            </div>

            {report.courseSummaries?.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ marginBottom: '14px', fontWeight: '700' }}>ملخص الاشتراكات حسب الكورس</div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>الكورس</th>
                        <th>المعلم</th>
                        <th>اجمالي الطلبات</th>
                        <th>مدفوعة</th>
                        <th>معلقة</th>
                        <th>متأخرة</th>
                        <th>المبلغ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.courseSummaries.map((summary) => (
                        <tr key={summary.courseId}>
                          <td>{summary.title}</td>
                          <td>{summary.teacherName}</td>
                          <td>{summary.totalSubscriptions}</td>
                          <td>{summary.paidCount}</td>
                          <td>{summary.pendingCount}</td>
                          <td>{summary.overdueCount}</td>
                          <td>{formatMoney(summary.collectedAmountCents)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {report.subscriptions?.length > 0 && (
              <div>
                <div style={{ marginBottom: '14px', fontWeight: '700' }}>تفاصيل الاشتراكات</div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>الكورس</th>
                        <th>المعلم</th>
                        <th>الطالب</th>
                        <th>الإيميل</th>
                        <th>الهاتف</th>
                        <th>الحالة</th>
                        <th>المبلغ</th>
                        <th>تاريخ الدفع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.subscriptions.map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>{item.courseTitle}</td>
                          <td>{item.teacherName}</td>
                          <td>{item.studentName}</td>
                          <td>{item.studentEmail}</td>
                          <td>{item.studentPhone || '-'}</td>
                          <td>{item.status}</td>
                          <td>{formatMoney(item.amountCents)}</td>
                          <td>{formatDate(item.paidAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {!report && !loadingReport && !error && (
          <div className="empty-state">اختر الشهر والسنة لعرض التقرير</div>
        )}
      </div>
    </div>
  );
};

export default AdminMonthlyReport;

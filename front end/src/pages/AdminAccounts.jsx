import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminAccounts = () => {
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

  const formatMoney = (amountCents) =>
    amountCents != null
      ? (amountCents / 100).toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })
      : '-';

  const loadReport = async () => {
    setLoadingReport(true);
    setError('');

    try {
      const response = await paymentAPI.getAdminMonthlyAccountsReport(selectedMonth, selectedYear);
      setReport(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تحميل بيانات الحسابات');
      setReport(null);
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h2>صفحة حسابات الإدارة</h2>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            العودة للوحة التحكم
          </button>
        </div>

        <div style={{ padding: '20px', background: 'inherit', borderRadius: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>الشهر:</label>
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
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>السنة:</label>
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
                {loadingReport ? 'جاري التحميل...' : 'تحديث البيانات'}
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
                <h4>عدد الكورسات</h4>
                <p>{report.totalCourses}</p>
              </div>
              <div className="stat-card">
                <h4>إجمالي الاشتراكات</h4>
                <p>{report.totalSubscriptions}</p>
              </div>
              <div className="stat-card">
                <h4>المدفوعة</h4>
                <p>{report.totalPaidSubscriptions}</p>
              </div>
              <div className="stat-card">
                <h4>المبلغ المحصل</h4>
                <p>{formatMoney(report.totalCollectedCents)}</p>
              </div>
              <div className="stat-card">
                <h4>حصة المدرس ({report.teacherSharePercentage}%)</h4>
                <p>{formatMoney(report.totalTeacherShareCents)}</p>
              </div>
              <div className="stat-card">
                <h4>حصة المركز</h4>
                <p>{formatMoney(report.totalCenterShareCents)}</p>
              </div>
            </div>

            {report.courseAccounts?.length > 0 ? (
              <div>
                <div style={{ marginBottom: '14px', fontWeight: '700' }}>تفاصيل الحسابات حسب الكورس</div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>الكورس</th>
                        <th>المعلم</th>
                        <th>الاشتراكات</th>
                        <th>مدفوعة</th>
                        <th>معلقة</th>
                        <th>متأخرة</th>
                        <th>المحصل</th>
                        <th>حصة المدرس</th>
                        <th>حصة المركز</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.courseAccounts.map((item) => (
                        <tr key={item.courseId}>
                          <td>{item.title}</td>
                          <td>{item.teacherName}</td>
                          <td>{item.totalSubscriptions}</td>
                          <td>{item.paidSubscriptions}</td>
                          <td>{item.pendingSubscriptions}</td>
                          <td>{item.overdueSubscriptions}</td>
                          <td>{formatMoney(item.collectedAmountCents)}</td>
                          <td>{formatMoney(item.teacherShareCents)}</td>
                          <td>{formatMoney(item.centerShareCents)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="empty-state">لا توجد بيانات حسابات لهذا الشهر.</div>
            )}
          </>
        )}

        {!report && !loadingReport && !error && (
          <div className="empty-state">اختر الشهر والسنة لعرض بيانات الحسابات</div>
        )}
      </div>
    </div>
  );
};

export default AdminAccounts;

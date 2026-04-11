import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

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

  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header">
          <h2>لوحة التحكم</h2>
        </div>

        {user && (
          <div style={{ marginBottom: '30px', padding: '20px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h3 style={{ marginBottom: '15px', color: '#667eea' }}>معلومات المستخدم</h3>
            <p><strong>البريد الإلكتروني:</strong> {user.email}</p>
            {user.role && (
              <p>
                <strong>الدور:</strong>{' '}
                <span className={`badge badge-${user.role}`}>
                  {getRoleName(user.role)}
                </span>
              </p>
            )}
          </div>
        )}

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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


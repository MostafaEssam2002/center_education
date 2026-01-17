import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
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

  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN';
  const isStudent = user?.role === 'STUDENT';

  return (
    <div>
      <header
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '15px',
          padding: '20px 30px',
          margin: '20px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px',
        }}
      >
        <h1 style={{ color: '#667eea', fontSize: '2em', margin: 0 }}>مركز التعليم</h1>

        {isAuthenticated ? (
          <nav style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/dashboard" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              لوحة التحكم
            </Link>

            {(user?.role === 'ADMIN') && (
              <Link to="/users" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                المستخدمين
              </Link>
            )}

            <Link to="/courses" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              الكورسات
            </Link>

            {(user?.role === 'EMPLOYEE') && (
              <Link to="/attendance" className="btn btn-primary" style={{ textDecoration: 'none', backgroundColor: '#e53e3e', borderColor: '#e53e3e' }}>
                تسجيل الحضور
              </Link>
            )}

            {!isStudent && (
              <>
                <Link to="/schedule" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                  الجدول العام
                </Link>
                <Link to="/rooms" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                  إدارة الغرف
                </Link>
              </>
            )}

            {isTeacher && (
              <>
                <Link to="/chapters" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                  الفصول
                </Link>
                <Link to="/enrollment-requests" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                  طلبات الالتحاق
                </Link>
                <Link to="/attendance" className="btn btn-primary" style={{ textDecoration: 'none', backgroundColor: '#e53e3e', borderColor: '#e53e3e' }}>
                  تسجيل الحضور
                </Link>
              </>
            )}

            {isStudent && (
              <>
                <Link to="/my-enrollments" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                  كورساتي
                </Link>
                <Link to="/student-schedule" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                  مواعيدي
                </Link>
                <Link to="/my-quizzes" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                  اختباراتي
                </Link>
                <Link to="/my-assignments" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                  واجباتي
                </Link>
                <Link to="/pending-payments" className="btn btn-primary" style={{ textDecoration: 'none', backgroundColor: '#ffd700', borderColor: '#ffd700', color: '#000' }}>
                  💰 مدفوعات
                </Link>
              </>
            )}

            {user && (
              <div style={{ padding: '10px 15px', background: '#f0f0f0', borderRadius: '8px', fontSize: '14px' }}>
                <span style={{ color: '#667eea', fontWeight: 600 }}>
                  {user.first_name || user.email} ({getRoleName(user.role)})
                </span>
              </div>
            )}
            <button className="btn btn-danger" onClick={handleLogout}>
              تسجيل الخروج
            </button>
          </nav>
        ) : (
          <nav style={{ display: 'flex', gap: '10px' }}>
            <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              تسجيل الدخول
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              تسجيل جديد
            </Link>
          </nav>
        )}
      </header>

      <main>{children}</main>
    </div>
  );
};

export default Layout;

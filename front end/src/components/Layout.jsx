import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, chatAPI } from '../services/api';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  // مكون قائمة المستخدم المنسدلة
  const UserMenu = () => {
    return (
      <div className="user-menu-container">
        <button
          className="user-menu-button"
          onClick={() => setShowUserMenu(!showUserMenu)}
          title="قائمة المستخدم"
        >
          <span className="user-menu-avatar">
            {(user?.first_name && user.first_name[0]) || user?.email?.[0] || '👤'}
          </span>
          <span className="user-menu-name">{user?.first_name || user?.email}</span>
          <span className={`user-menu-arrow ${showUserMenu ? 'open' : ''}`}>▼</span>
        </button>

        {showUserMenu && (
          <div className="user-menu-dropdown">
            <div className="user-menu-header">
              <div className="user-menu-info">
                <p className="user-menu-email">{user?.email}</p>
                <p className="user-menu-role">
                  {user?.role === 'USER'
                    ? 'مستخدم'
                    : user?.role === 'TEACHER'
                      ? 'معلم'
                      : user?.role === 'EMPLOYEE'
                        ? 'موظف'
                        : user?.role === 'ASSISTANT'
                          ? 'مساعد'
                          : user?.role === 'STUDENT'
                            ? 'طالب'
                            : user?.role === 'ADMIN'
                              ? 'مدير'
                              : user?.role}
                </p>
              </div>
            </div>
            <div className="user-menu-divider"></div>
            <Link to="/profile" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
              👤 الملف الشخصي
            </Link>
            <Link to="/settings" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
              ⚙️ الإعدادات
            </Link>
            <div className="user-menu-divider"></div>
            <button
              className="user-menu-item user-menu-logout"
              onClick={() => {
                setShowUserMenu(false);
                handleLogout();
              }}
            >
              🚪 تسجيل الخروج
            </button>
          </div>
        )}
      </div>
    );
  };

  const ChatLink = () => {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
      if (!isAuthenticated) return;

      // تحميل عدد الجهات (Conversations) المبدئي
      chatAPI.getUnreadConversations().then(res => setUnreadCount(res.data)).catch(err => console.error(err));

      const s = io(`${API_BASE_URL}`, { auth: { token: localStorage.getItem('token') }, transports: ['websocket'] });
      s.on('totalUnreadUpdate', (data) => {
        setUnreadCount(data.conversations || 0);
      });

      return () => s.disconnect();
    }, [isAuthenticated]);

    return (
      <Link to="/chat" className="navbar-link navbar-chat-link" style={{
        position: 'relative'
      }}>
        💬 المحادثات
        {unreadCount > 0 && (
          <span className="unread-badge">
            {unreadCount}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="layout-wrapper">
      <header className="navbar-header">
        <div className="navbar-brand">
          <h1>مركز التعليم</h1>
        </div>

        {isAuthenticated ? (
          <nav className="navbar-menu">
            <Link to="/dashboard" className="navbar-link">
              لوحة التحكم
            </Link>

            {(user?.role === 'ADMIN') && (
              <Link to="/users" className="navbar-link">
                المستخدمين
              </Link>
            )}

            <Link to="/courses" className="navbar-link">
              الكورسات
            </Link>

            <ChatLink />

            {(user?.role === 'EMPLOYEE') && (
              <Link to="/attendance" className="navbar-link">
                تسجيل الحضور
              </Link>
            )}

            {!isStudent && (
              <>
                <Link to="/schedule" className="navbar-link">
                  الجدول العام
                </Link>
                <Link to="/rooms" className="navbar-link">
                  إدارة الغرف
                </Link>
              </>
            )}

            {isTeacher && (
              <>
                <Link to="/enrollment-requests" className="navbar-link">
                  طلبات الالتحاق
                </Link>
                <Link to="/attendance" className="navbar-link">
                  تسجيل الحضور
                </Link>
              </>
            )}

            {isStudent && (
              <>
                <Link to="/my-enrollments" className="navbar-link">
                  كورساتي
                </Link>
                <Link to="/student-schedule" className="navbar-link">
                  مواعيدي
                </Link>
                <Link to="/my-quizzes" className="navbar-link">
                  اختباراتي
                </Link>
                <Link to="/my-assignments" className="navbar-link">
                  واجباتي
                </Link>
                <Link to="/pending-payments" className="navbar-link navbar-warning">
                  💰 مدفوعات
                </Link>
              </>
            )}

            {user && (
              <UserMenu />
            )}
          </nav>
        ) : (
          <nav className="navbar-menu">
            <Link to="/login" className="navbar-link">
              تسجيل الدخول
            </Link>
            <Link to="/register" className="navbar-link">
              تسجيل جديد
            </Link>
          </nav>
        )}
      </header>

      <div className="layout-main-wrapper">
        <Sidebar />
        <main className="layout-main">{children}</main>
      </div>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h2 className="footer-logo">مركز التعليم</h2>
            <p className="footer-tagline">منصة تعليمية متكاملة للطلاب والمعلمين</p>
          </div>

          <div className="footer-links">
            <h3 className="footer-links-title">روابط سريعة</h3>
            <ul>
              <Link to="/dashboard">لوحة التحكم</Link>
              <Link to="/courses">الكورسات</Link>
              <Link to="/chat">المحادثات</Link>
              {isStudent && <Link to="/my-enrollments">كورساتي</Link>}
              {isTeacher && <Link to="/enrollment-requests">طلبات الالتحاق</Link>}
            </ul>
          </div>

          <div className="footer-info">
            <h3 className="footer-links-title">معلومات</h3>
            <ul>
              <li>📧 support@center.edu</li>
              <li>📞 01118606952</li>
              <li>🕐 السبت – الخميس: 9ص – 9م</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} مركز التعليم – جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

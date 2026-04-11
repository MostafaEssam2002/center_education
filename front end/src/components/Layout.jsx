import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, chatAPI } from '../services/api';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Show landing page without app chrome
  if (location.pathname === '/') {
    return <>{children}</>;
  }

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

  const NAVBAR_ITEMS = [
    { to: '/dashboard', label: 'لوحة التحكم', roles: ['ALL'] },
    { to: '/users', label: 'المستخدمين', roles: ['ADMIN'] },
    { to: '/courses', label: 'الكورسات', roles: ['ALL'] },
    { to: '/chat', label: 'المحادثات', roles: ['ALL'], isChat: true },
    { to: '/attendance', label: 'تسجيل الحضور', roles: ['EMPLOYEE', 'TEACHER'] },
    { to: '/schedule', label: 'الجدول العام', roles: ['ADMIN', 'TEACHER', 'EMPLOYEE'] },
    { to: '/rooms', label: 'إدارة الغرف', roles: ['ADMIN', 'TEACHER', 'EMPLOYEE'] },
    { to: '/enrollment-requests', label: 'طلبات الالتحاق', roles: ['TEACHER'] },
    { to: '/my-enrollments', label: 'كورساتي', roles: ['STUDENT'] },
    { to: '/student-schedule', label: 'مواعيدي', roles: ['STUDENT'] },
    { to: '/my-quizzes', label: 'اختباراتي', roles: ['STUDENT'] },
    { to: '/my-assignments', label: 'واجباتي', roles: ['STUDENT'] },
    { to: '/pending-payments', label: '💰 مدفوعات', roles: ['STUDENT'], className: 'navbar-warning' },
  ];

  const getVisibleNavbarItems = () => {
    const role = user?.role || '';
    return NAVBAR_ITEMS.filter(item =>
      item.roles.includes('ALL') || item.roles.includes(role)
    );
  };

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
            {user?.image_path ? (
              <img 
                src={user.image_path.startsWith('http') ? user.image_path : `${API_BASE_URL}${user.image_path}`} 
                alt="Avatar" 
                style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block'}} 
              />
            ) : (
              (user?.first_name && user.first_name[0]) || user?.email?.[0] || '👤'
            )}
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
      <Sidebar />

      <div className="layout-content-area">
        <header className="navbar-header">
          <div className="navbar-brand">
            <h1>ارتقاء Ertiqa</h1>
          </div>

          {isAuthenticated ? (
            <nav className="navbar-menu">
              {getVisibleNavbarItems().map((item) => {
                if (item.isChat) {
                  return <ChatLink key={item.to || item.label} />;
                }

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`navbar-link${item.className ? ` ${item.className}` : ''}`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {user && <UserMenu />}
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

        <main className="layout-main">{children}</main>

        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <h2 className="footer-logo">ارتقاء Ertiqa</h2>
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
            <p>© {new Date().getFullYear()} ارتقاء Ertiqa – جميع الحقوق محفوظة</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;

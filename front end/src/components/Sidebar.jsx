import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN';
  const isStudent = user?.role === 'STUDENT';
  const isEmployee = user?.role === 'EMPLOYEE';
  const isAdmin = user?.role === 'ADMIN';

  const isActive = (path) => location.pathname === path;

  if (!isAuthenticated) return null;

  const menuItems = [
    {
      title: 'لوحة التحكم',
      path: '/dashboard',
      icon: '📊',
      show: true,
    },
    {
      title: 'الكورسات',
      path: '/courses',
      icon: '📚',
      show: true,
    },
    {
      title: 'المستخدمين',
      path: '/users',
      icon: '👥',
      show: isAdmin,
    },
    {
      title: 'المحادثات',
      path: '/chat',
      icon: '💬',
      show: true,
    },
    {
      title: 'الجدول العام',
      path: '/schedule',
      icon: '📅',
      show: !isStudent,
    },
    {
      title: 'إدارة الغرف',
      path: '/rooms',
      icon: '🏛️',
      show: !isStudent,
    },
    {
      title: 'طلبات الالتحاق',
      path: '/enrollment-requests',
      icon: '📬',
      show: isTeacher,
    },
    {
      title: 'تسجيل الحضور',
      path: '/attendance',
      icon: '✅',
      show: isTeacher || isEmployee,
    },
    {
      title: 'كورساتي',
      path: '/my-enrollments',
      icon: '📖',
      show: isStudent,
    },
    {
      title: 'مواعيدي',
      path: '/student-schedule',
      icon: '🗓️',
      show: isStudent,
    },
    {
      title: 'اختباراتي',
      path: '/my-quizzes',
      icon: '❓',
      show: isStudent,
    },
    {
      title: 'واجباتي',
      path: '/my-assignments',
      icon: '📝',
      show: isStudent,
    },
    {
      title: 'المدفوعات',
      path: '/pending-payments',
      icon: '💳',
      show: isStudent,
    },
    {
      title: 'إحصائيات الطالب',
      path: '/student-statistics',
      icon: '📈',
      show: isStudent,
    },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'فتح القائمة' : 'إغلاق القائمة'}
        >
          ☰
        </button>
        {!isCollapsed && <h2>القائمة الرئيسية</h2>}
      </div>

      <nav className="sidebar-menu">
        {menuItems.map(
          (item) =>
            item.show && (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                title={isCollapsed ? item.title : ''}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {!isCollapsed && <span className="sidebar-text">{item.title}</span>}
              </Link>
            )
        )}
      </nav>

      {!isCollapsed && (
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {(user?.first_name && user.first_name[0]) || user?.email?.[0] || '👤'}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.first_name || user?.email}</p>
              <p className="sidebar-user-role">
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
        </div>
      )}
    </aside>
  );
};

export default Sidebar;

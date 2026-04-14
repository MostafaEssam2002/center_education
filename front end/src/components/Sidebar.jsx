import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const role = user?.role?.toString().toUpperCase() || '';
  const isActive = (path) => location.pathname === path;

  if (!isAuthenticated) return null;

  const menuItems = [
    { title: 'لوحة التحكم', path: '/dashboard', icon: '📊', roles: ['ALL'] },
    { title: 'الكورسات', path: '/courses', icon: '📚', roles: ['ALL'] },
    { title: 'المستخدمين', path: '/users', icon: '👥', roles: ['ADMIN'] },
    { title: 'المحادثات', path: '/chat', icon: '💬', roles: ['ALL'] },
    { title: 'الجدول العام', path: '/schedule', icon: '📅', roles: ['ADMIN', 'TEACHER', 'EMPLOYEE'] },
    { title: 'إدارة الغرف', path: '/rooms', icon: '🏛️', roles: ['ADMIN', 'EMPLOYEE'] },
    { title: 'الاشتراكات الشهرية', path: '/monthly-payments', icon: '💰', roles: ['ADMIN', 'EMPLOYEE'] },
    { title: 'تقرير الإدارة', path: '/admin-monthly-report', icon: '📊', roles: ['ADMIN'] },
    { title: 'حسابات المركز', path: '/admin-accounts', icon: '🧾', roles: ['ADMIN'] },
    { title: 'أداء المركز', path: '/center-performance', icon: '📈', roles: ['ADMIN'] },
    { title: 'طلبات الالتحاق', path: '/enrollment-requests', icon: '📬', roles: ['ADMIN', 'TEACHER'] },
    { title: 'تسجيل الحضور', path: '/attendance', icon: '✅', roles: ['EMPLOYEE', 'TEACHER'] },
    { title: 'إحصائيات المعلم', path: '/teacher-statistics', icon: '📊', roles: ['TEACHER'] },
    { title: 'كورساتي', path: '/my-enrollments', icon: '📖', roles: ['STUDENT'] },
    { title: 'مواعيدي', path: '/student-schedule', icon: '🗓️', roles: ['STUDENT'] },
    { title: 'اختباراتي', path: '/my-quizzes', icon: '❓', roles: ['STUDENT'] },
    { title: 'واجباتي', path: '/my-assignments', icon: '📝', roles: ['STUDENT'] },
    { title: 'المدفوعات', path: '/pending-payments', icon: '💳', roles: ['STUDENT'] },
    { title: 'الاشتراكات الشهرية', path: '/my-monthly-payments', icon: '💰', roles: ['STUDENT'] },
    { title: 'إحصائيات الطالب', path: '/student-statistics', icon: '📈', roles: ['STUDENT'] },
  ];

  const visibleMenuItems = menuItems.filter(item =>
    item.roles.includes('ALL') || item.roles.includes(role)
  );

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
        {visibleMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
            title={isCollapsed ? item.title : ''}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!isCollapsed && <span className="sidebar-text">{item.title}</span>}
          </Link>
        ))}
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

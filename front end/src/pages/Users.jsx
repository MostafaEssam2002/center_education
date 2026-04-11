import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, API_BASE_URL } from '../services/api';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await userAPI.findAll(page);
      if (response.data.data) {
        setUsers(response.data.data);
        setPagination(response.data.pagination);
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Fallback in case backend structure is different
        setUsers(response.data);
      }

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'فشل تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchEmail) {
      loadUsers();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await userAPI.findByEmail(searchEmail);
      setUsers([response.data]);
      setPagination(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'المستخدم غير موجود');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

    try {
      await userAPI.remove(id);
      loadUsers();
    } catch (err) {
      alert('فشل الحذف: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      age: user.age || '',
      phone: user.phone || '',
      address: user.address || '',
      AdditionalAddress: user.AdditionalAddress || '',
      Center_name: user.Center_name || '',
      country: user.countryCode || '',
      region: user.regionId ? String(user.regionId) : '',
      city: user.cityCode || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editForm };

      if (payload.age !== '' && payload.age !== null && payload.age !== undefined) {
        payload.age = Number(payload.age);
      } else {
        delete payload.age;
      }

      if (payload.phone === '') delete payload.phone;
      if (payload.address === '') delete payload.address;
      if (payload.AdditionalAddress === '') delete payload.AdditionalAddress;
      if (payload.Center_name === '') delete payload.Center_name;
      if (payload.country === '') delete payload.country;
      if (payload.region === '') delete payload.region;
      if (payload.city === '') delete payload.city;
      if (payload.first_name === '') delete payload.first_name;
      if (payload.last_name === '') delete payload.last_name;

      await userAPI.update(selectedUser.id, payload);
      setShowEditModal(false);
      loadUsers();
    } catch (err) {
      alert('فشل التحديث: ' + (
        (err.response?.data?.message && Array.isArray(err.response.data.message))
          ? err.response.data.message.join(', ')
          : err.response?.data?.message || err.message
      ));
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

  return (
    <div className="main-content">
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2>إدارة المستخدمين</h2>
          <button className="btn btn-primary" onClick={() => loadUsers(currentPage)}>
            تحديث
          </button>
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="email"
            placeholder="البحث بالبريد الإلكتروني..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: 'clamp(8px, 2vw, 12px) clamp(10px, 2vw, 14px)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid rgba(59, 130, 246, 0.3)',
              background: 'rgba(30, 41, 59, 0.7)',
              color: 'var(--neutral-100)',
              fontSize: 'clamp(13px, 2vw, 15px)',
              fontFamily: 'inherit'
            }}
          />
          <button className="btn btn-primary" onClick={handleSearch} style={{ whiteSpace: 'nowrap' }}>
            بحث
          </button>
        </div>

        {error && <div className="message error">{error}</div>}

        {loading ? (
          <div className="empty-state">جاري التحميل...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">لا يوجد مستخدمين</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>الصورة</th>
                  <th>الاسم</th>
                  <th>البريد الإلكتروني</th>
                  <th style={{ display: 'none' }} className="hide-mobile">العمر</th>
                  <th style={{ display: 'none' }} className="hide-mobile">الهاتف</th>
                  <th style={{ display: 'none' }} className="hide-tablet">العنوان</th>
                  <th>الدور</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      {user.image_path ? (
                        <img
                          src={`${API_BASE_URL}${user.image_path}`}
                          alt="User"
                          style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          background: 'rgba(59, 130, 246, 0.2)',
                          display: user.image_path ? 'none' : 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--neutral-400)',
                          fontSize: '11px',
                        }}
                      >
                        لا توجد صورة
                      </div>
                    </td>
                    <td>
                      <button
                        className="link-button"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: 0,
                          margin: 0,
                          color: 'var(--primary-400)',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontWeight: 700,
                          fontSize: 'inherit',
                          fontFamily: 'inherit',
                        }}
                        onClick={() => {
                          const chatConfig = user.role === 'STUDENT' ?
                            { type: 'employee_student', studentId: user.id, title: `${user.first_name || user.email}` } :
                            { type: 'employee', employeeId: user.id, title: `${user.first_name || user.email}` };
                          navigate('/chat', { state: { openChatUser: user, openChatConfig: chatConfig } });
                        }}
                      >
                        {user.first_name} {user.last_name}
                      </button>
                    </td>
                    <td style={{ wordBreak: 'break-all', fontSize: 'clamp(12px, 2vw, 13px)' }}>{user.email}</td>
                    <td style={{ display: 'none' }} className="hide-mobile">{user.age || '-'}</td>
                    <td style={{ display: 'none' }} className="hide-mobile">{user.phone || '-'}</td>
                    <td style={{ display: 'none' }} className="hide-tablet">{user.address || '-'}</td>
                    <td>
                      <span className={`badge badge-${user.role}`}>
                        {getRoleName(user.role)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: 'clamp(6px, 1vw, 8px) clamp(10px, 2vw, 12px)', fontSize: '12px' }}
                          onClick={() => handleEdit(user)}
                        >
                          تعديل
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: 'clamp(6px, 1vw, 8px) clamp(10px, 2vw, 12px)', fontSize: '12px' }}
                          onClick={() => handleDelete(user.id)}
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {pagination && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary"
                  disabled={currentPage === 1}
                  onClick={() => loadUsers(currentPage - 1)}
                  style={{ minWidth: '60px' }}
                >
                  السابق
                </button>
                <span style={{ whiteSpace: 'nowrap', fontSize: 'clamp(12px, 2vw, 14px)' }}>
                  صفحة {currentPage} من {pagination.totalPages}
                </span>
                <button
                  className="btn btn-secondary"
                  disabled={currentPage === pagination.totalPages}
                  onClick={() => loadUsers(currentPage + 1)}
                  style={{ minWidth: '60px' }}
                >
                  التالي
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showEditModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="card"
            style={{ maxWidth: '500px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header">
              <h2 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.4rem)' }}>تعديل المستخدم</h2>
            </div>
            <form onSubmit={handleUpdate} style={{ padding: '0 16px 16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>الاسم الأول</label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>الاسم الأخير</label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>العمر</label>
                  <input
                    type="number"
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>الهاتف</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>العنوان</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>العنوان الإضافي</label>
                  <input
                    type="text"
                    value={editForm.AdditionalAddress}
                    onChange={(e) => setEditForm({ ...editForm, AdditionalAddress: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>اسم المركز</label>
                  <input
                    type="text"
                    value={editForm.Center_name}
                    onChange={(e) => setEditForm({ ...editForm, Center_name: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>الدولة</label>
                  <input
                    type="text"
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>المحافظة</label>
                  <input
                    type="text"
                    value={editForm.region}
                    onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>المدينة</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexDirection: 'row-reverse' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  حفظ
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowEditModal(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;


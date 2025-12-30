import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userAPI.findAll();
      setUsers(response.data);
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
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await userAPI.update(selectedUser.id, editForm);
      setShowEditModal(false);
      loadUsers();
    } catch (err) {
      alert('فشل التحديث: ' + (err.response?.data?.message || err.message));
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
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h2>إدارة المستخدمين</h2>
          <button className="btn btn-primary" onClick={loadUsers}>
            تحديث
          </button>
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <input
            type="email"
            placeholder="البحث بالبريد الإلكتروني..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '2px solid #e0e0e0' }}
          />
          <button className="btn btn-secondary" onClick={handleSearch}>
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
                  <th>العمر</th>
                  <th>الهاتف</th>
                  <th>العنوان</th>
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
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          background: '#e0e0e0',
                          display: user.image_path ? 'none' : 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#999',
                          fontSize: '12px',
                        }}
                      >
                        لا توجد صورة
                      </div>
                    </td>
                    <td>{user.first_name} {user.last_name}</td>
                    <td>{user.email}</td>
                    <td>{user.age || '-'}</td>
                    <td>{user.phone || '-'}</td>
                    <td>{user.address || '-'}</td>
                    <td>
                      <span className={`badge badge-${user.role}`}>
                        {getRoleName(user.role)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '5px 10px', marginLeft: '5px' }}
                        onClick={() => handleEdit(user)}
                      >
                        تعديل
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '5px 10px' }}
                        onClick={() => handleDelete(user.id)}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          }}
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="card"
            style={{ maxWidth: '500px', width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header">
              <h2>تعديل المستخدم</h2>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>الاسم الأول</label>
                <input
                  type="text"
                  value={editForm.first_name}
                  onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>الاسم الأخير</label>
                <input
                  type="text"
                  value={editForm.last_name}
                  onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>العمر</label>
                <input
                  type="number"
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>الهاتف</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>العنوان</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
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


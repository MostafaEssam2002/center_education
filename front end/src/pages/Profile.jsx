import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, uploadAPI, API_BASE_URL } from '../services/api';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    age: '',
    address: '',
    AdditionalAddress: '',
    Center_name: '',
    country: '',
    city: '',
  });

  // مزامنة البيانات عند تغير كائن المستخدم أو تحميله
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name || prev.first_name,
        last_name: user.last_name || prev.last_name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        age: user.age ? String(user.age) : prev.age,
        address: user.address || prev.address,
        AdditionalAddress: user.AdditionalAddress || prev.AdditionalAddress,
        Center_name: user.Center_name || prev.Center_name,
        country: user.countryCode || prev.country,
        city: user.cityCode || prev.city,
      }));
    }
  }, [user]);

  // تحميل بيانات المستخدم الكاملة من الخادم عند فتح الصفحة
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.email) return;

      try {
        setLoading(true);
        const response = await userAPI.findByEmail(user.email);

        if (response.data) {
          // التعامل مع البيانات سواء كانت مغلفة في 'data' أو مباشرة
          const userData = response.data.data || response.data;

          if (userData) {
            // تحديث المستخدم في السياق وبناءً عليه سيتم تحديث formData عبر useEffect أعلاه
            setUser(userData);
          }
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('فشل في تحميل بيانات الملف الشخصي الكاملة');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user?.email]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        setError('يرجى اختيار صورة صحيحة');
        return;
      }

      // التحقق من حجم الملف (5MB كحد أقصى)
      if (file.size > 5 * 1024 * 1024) {
        setError('حجم الصورة يجب أن يكون أقل من 5MB');
        return;
      }

      setProfileImage(file);
      setError('');

      // عرض معاينة الصورة
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {};

      if (formData.first_name !== user.first_name && formData.first_name.trim() !== '') {
        payload.first_name = formData.first_name;
      }
      if (formData.last_name !== user.last_name && formData.last_name.trim() !== '') {
        payload.last_name = formData.last_name;
      }
      if (formData.phone !== (user.phone || '')) {
        if (formData.phone.trim() !== '') payload.phone = formData.phone;
      }
      if (formData.age !== String(user.age || '')) {
        if (formData.age !== '') payload.age = Number(formData.age);
      }
      if (formData.address !== (user.address || '')) {
        if (formData.address.trim() !== '') payload.address = formData.address;
      }
      if (formData.AdditionalAddress !== (user.AdditionalAddress || '')) {
        if (formData.AdditionalAddress.trim() !== '') payload.AdditionalAddress = formData.AdditionalAddress;
      }
      if (formData.Center_name !== (user.Center_name || '')) {
        if (formData.Center_name.trim() !== '') payload.Center_name = formData.Center_name;
      }
      if (formData.country !== (user.countryCode || '')) {
        if (formData.country.trim() !== '') payload.countryCode = formData.country;
      }
      if (formData.city !== (user.cityCode || '')) {
        if (formData.city.trim() !== '') payload.cityCode = formData.city;
      }

      if (profileImage) {
        const uploadRes = await uploadAPI.uploadFile(profileImage);
        if (uploadRes.data && uploadRes.data.url) {
          payload.image_path = uploadRes.data.url;
        }
      }

      // إذا لم يكن هناك أي تغييرات ولم تكن هناك صورة، أعرض رسالة
      if (Object.keys(payload).length === 0) {
        setError('لم تقم بأي تعديلات للملف الشخصي');
        setLoading(false);
        return;
      }

      const response = await userAPI.update(user.id, payload);
      if (response.data) {
        setUser(response.data);
        setProfileImage(null);
        setImagePreview(null);
      }

      setSuccess('تم تحديث بيانات الملف الشخصي بنجاح');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تحديث البيانات');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <p style={{ textAlign: 'center', color: '#999' }}>جارٍ التحميل...</p>
          <p style={{ textAlign: 'center', color: '#999', fontSize: '12px' }}>إذا استمرت المشكلة، يرجى تسجيل الدخول مرة أخرى</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <p style={{ textAlign: 'center', color: '#999' }}>جارٍ تحميل بيانات الملف الشخصي...</p>
        </div>
      </div>
    );
  }

  const userImage = user?.image_path 
    ? (user.image_path.startsWith('http') ? user.image_path : `${API_BASE_URL}${user.image_path}`) 
    : null;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>تعديل الملف الشخصي</h1>
        <p className="profile-subtitle">قم بتحديث بيانات حسابك الشخصية</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="profile-image-section">
          <div className="image-preview-container">
            <div className="image-preview">
              {imagePreview ? (
                <img src={imagePreview} alt="معاينة الصورة" />
              ) : userImage ? (
                <img src={userImage} alt="صورة المستخدم" />
              ) : (
                <div className="image-placeholder">
                  👤
                </div>
              )}
            </div>
            <div className="image-upload-info">
              <p className="image-name">تعديل الصورة الشخصية</p>
              <label htmlFor="profileImage" className="image-upload-btn">
                اختر صورة جديدة
              </label>
              <input
                type="file"
                id="profileImage"
                name="profileImage"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              {profileImage && (
                <button
                  type="button"
                  onClick={() => {
                    setProfileImage(null);
                    setImagePreview(null);
                  }}
                  className="image-clear-btn"
                >
                  ✕ إلغاء التحديث
                </button>
              )}
              <small>الصيغ المقبولة: JPG, PNG, GIF (الحد الأقصى 5MB)</small>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">الاسم الأول</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name || ''}
                onChange={handleInputChange}
                placeholder="أدخل الاسم الأول"
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">الاسم الأخير</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name || ''}
                onChange={handleInputChange}
                placeholder="أدخل الاسم الأخير"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">البريد الإلكتروني</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="disabled-field"
              />
              <small>لا يمكن تغيير البريد الإلكتروني</small>
            </div>

            <div className="form-group">
              <label htmlFor="phone">رقم الهاتف</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="أدخل رقم الهاتف"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">السن</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="أدخل السن"
                min="1"
                max="150"
              />
            </div>

            <div className="form-group">
              <label htmlFor="country">الدولة</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="أدخل الدولة"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">المدينة</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="أدخل المدينة"
              />
            </div>

            <div className="form-group">
              <label htmlFor="Center_name">اسم المركز</label>
              <input
                type="text"
                id="Center_name"
                name="Center_name"
                value={formData.Center_name}
                onChange={handleInputChange}
                placeholder="أدخل اسم المركز"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="address">العنوان</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="أدخل العنوان"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="AdditionalAddress">عنوان إضافي</label>
              <input
                type="text"
                id="AdditionalAddress"
                name="AdditionalAddress"
                value={formData.AdditionalAddress}
                onChange={handleInputChange}
                placeholder="أدخل عنوان إضافي"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
            >
              {loading ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .profile-container {
          padding: 24px clamp(16px, 3vw, 32px);
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          direction: rtl;
          animation: fadeInUp 0.4s ease;
        }

        .profile-card {
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: var(--glass-backdrop);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          padding: 30px;
          box-shadow: var(--glass-shadow);
        }

        .profile-card h1 {
          color: var(--neutral-100);
          margin-bottom: 5px;
          font-size: 28px;
          text-align: right;
        }

        .profile-subtitle {
          color: var(--neutral-400);
          text-align: right;
          margin-bottom: 25px;
          font-size: 14px;
        }

        .alert {
          padding: 12px 16px;
          border-radius: var(--radius-md);
          margin-bottom: 20px;
          text-align: right;
          font-size: 14px;
        }

        .alert-error {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .alert-success {
          background-color: rgba(34, 197, 94, 0.1);
          color: var(--success);
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .profile-image-section {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--glass-border);
        }

        .image-preview-container {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .image-preview {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background-color: rgba(30, 41, 59, 0.6);
          border: 3px solid rgba(59, 130, 246, 0.5);
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-placeholder {
          font-size: 50px;
          opacity: 0.5;
        }

        .image-upload-info {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }

        .image-name {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--neutral-100);
          text-align: right;
        }

        .image-upload-btn {
          display: inline-block;
          padding: 10px 16px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: transform 0.2s, box-shadow 0.2s;
          text-align: center;
          max-width: fit-content;
          border: none;
        }

        .image-upload-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .image-clear-btn {
          padding: 8px 12px;
          background: rgba(239, 68, 68, 0.15);
          color: var(--danger);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
          max-width: fit-content;
        }

        .image-clear-btn:hover {
          background: rgba(239, 68, 68, 0.25);
        }

        .image-upload-info small {
          color: var(--neutral-400);
          font-size: 12px;
          text-align: right;
        }

        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-row.full-width {
          grid-template-columns: 1fr;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          margin-bottom: 8px;
          font-weight: 600;
          color: var(--neutral-200);
          font-size: 14px;
        }

        .form-group input {
          width: 100%;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--glass-border);
          color: var(--neutral-100);
          padding: 12px 16px;
          border-radius: var(--radius-lg);
          font-size: 14px;
          box-sizing: border-box;
          transition: all 0.3s ease;
        }

        .form-group input::placeholder {
          color: var(--neutral-500);
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--primary-light);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          background: rgba(15, 23, 42, 0.8);
        }

        .form-group input.disabled-field {
          background-color: rgba(15, 23, 42, 0.3);
          cursor: not-allowed;
          color: var(--neutral-500);
          border-color: transparent;
        }

        .form-group small {
          margin-top: 6px;
          color: var(--neutral-400);
          font-size: 12px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 30px;
          gap: 10px;
        }

        .btn-submit {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          padding: 12px 30px;
          border: none;
          border-radius: var(--radius-md);
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        .btn-submit:disabled {
          background: rgba(15, 23, 42, 0.6);
          color: var(--neutral-500);
          box-shadow: none;
          cursor: not-allowed;
        }

        .loading {
          text-align: center;
          padding: 40px;
          font-size: 18px;
          color: var(--neutral-400);
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .profile-container {
             padding: 16px;
          }

          .profile-card {
            padding: 20px;
          }

          .profile-card h1 {
            font-size: 24px;
            text-align: center;
          }

          .profile-subtitle {
             text-align: center;
          }

          .image-preview-container {
            flex-direction: column;
            text-align: center;
          }

          .image-upload-info {
            align-items: center;
          }

          .image-name {
            text-align: center;
          }

          .image-upload-info small {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

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

  // تحميل بيانات المستخدم عند فتح الصفحة
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (user && user.id) {
          // محاولة تحميل البيانات من الـ API
          const response = await userAPI.findOne(user.id);
          if (response.data) {
            setUser(response.data);
            setFormData({
              first_name: response.data.first_name || '',
              last_name: response.data.last_name || '',
              email: response.data.email || '',
              phone: response.data.phone || '',
              age: response.data.age ? String(response.data.age) : '',
              address: response.data.address || '',
              AdditionalAddress: response.data.AdditionalAddress || '',
              Center_name: response.data.Center_name || '',
              country: response.data.countryCode || '',
              city: response.data.cityCode || '',
            });
          }
        } else if (user && user.email) {
          // محاولة تحميل البيانات من البريد الإلكتروني
          const response = await userAPI.findByEmail(user.email);
          if (response.data) {
            setUser(response.data);
            setFormData({
              first_name: response.data.first_name || '',
              last_name: response.data.last_name || '',
              email: response.data.email || '',
              phone: response.data.phone || '',
              age: response.data.age ? String(response.data.age) : '',
              address: response.data.address || '',
              AdditionalAddress: response.data.AdditionalAddress || '',
              Center_name: response.data.Center_name || '',
              country: response.data.countryCode || '',
              city: response.data.cityCode || '',
            });
          }
        } else {
          setError('لم يتم العثور على بيانات المستخدم');
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        // استخدام البيانات المتاحة من user object إذا فشل تحميل الـ API
        if (user) {
          setFormData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            phone: user.phone || '',
            age: user.age ? String(user.age) : '',
            address: user.address || '',
            AdditionalAddress: user.AdditionalAddress || '',
            Center_name: user.Center_name || '',
            country: user.countryCode || '',
            city: user.cityCode || '',
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user?.id || user?.email]);

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
      // إذا كانت هناك صورة جديدة، استخدم FormData
      if (profileImage) {
        const formDataWithImage = new FormData();
        formDataWithImage.append('first_name', formData.first_name);
        formDataWithImage.append('last_name', formData.last_name);
        formDataWithImage.append('phone', formData.phone || '');
        formDataWithImage.append('age', formData.age || '');
        formDataWithImage.append('address', formData.address || '');
        formDataWithImage.append('AdditionalAddress', formData.AdditionalAddress || '');
        formDataWithImage.append('Center_name', formData.Center_name || '');
        formDataWithImage.append('countryCode', formData.country || '');
        formDataWithImage.append('cityCode', formData.city || '');
        formDataWithImage.append('profileImage', profileImage);

        const response = await userAPI.update(user.id, formDataWithImage);
        if (response.data) {
          setUser(response.data);
          setProfileImage(null);
          setImagePreview(null);
        }
      } else {
        // إذا لم تكن هناك صورة جديدة، استخدم JSON عادي وأرسل فقط الحقول المتغيرة
        const payload = {};
        
        if (formData.first_name !== user.first_name) payload.first_name = formData.first_name;
        if (formData.last_name !== user.last_name) payload.last_name = formData.last_name;
        if (formData.phone !== (user.phone || '')) payload.phone = formData.phone || null;
        if (formData.age !== String(user.age || '')) payload.age = formData.age ? Number(formData.age) : null;
        if (formData.address !== (user.address || '')) payload.address = formData.address || null;
        if (formData.AdditionalAddress !== (user.AdditionalAddress || '')) payload.AdditionalAddress = formData.AdditionalAddress || null;
        if (formData.Center_name !== (user.Center_name || '')) payload.Center_name = formData.Center_name || null;
        if (formData.country !== (user.countryCode || '')) payload.countryCode = formData.country || null;
        if (formData.city !== (user.cityCode || '')) payload.cityCode = formData.city || null;

        // إذا لم يكن هناك أي تغييرات، أعرض رسالة
        if (Object.keys(payload).length === 0) {
          setError('لم تقم بأي تعديلات');
          setLoading(false);
          return;
        }

        const response = await userAPI.update(user.id, payload);
        if (response.data) {
          setUser(response.data);
        }
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
              ) : user?.profileImage ? (
                <img src={user.profileImage} alt="صورة المستخدم" />
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
              <label htmlFor="first_name">الاسم الأول *</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="أدخل الاسم الأول"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">الاسم الأخير *</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="أدخل الاسم الأخير"
                required
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
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
          direction: rtl;
        }

        .profile-card {
          background: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .profile-card h1 {
          color: #333;
          margin-bottom: 5px;
          font-size: 28px;
          text-align: right;
        }

        .profile-subtitle {
          color: #666;
          text-align: right;
          margin-bottom: 25px;
          font-size: 14px;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 20px;
          text-align: right;
          font-size: 14px;
        }

        .alert-error {
          background-color: #fee;
          color: #c33;
          border: 1px solid #fcc;
        }

        .alert-success {
          background-color: #efe;
          color: #3c3;
          border: 1px solid #cfc;
        }

        .profile-image-section {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #f0f0f0;
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
          background-color: #f5f5f5;
          border: 3px solid #e0e0e0;
          overflow: hidden;
          flex-shrink: 0;
        }

        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-placeholder {
          font-size: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
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
          color: #333;
          text-align: right;
        }

        .image-upload-btn {
          display: inline-block;
          padding: 10px 16px;
          background-color: #007bff;
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: background-color 0.3s;
          text-align: center;
          max-width: fit-content;
        }

        .image-upload-btn:hover {
          background-color: #0056b3;
        }

        .image-clear-btn {
          padding: 8px 12px;
          background-color: #6c757d;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: background-color 0.3s;
          max-width: fit-content;
        }

        .image-clear-btn:hover {
          background-color: #5a6268;
        }

        .image-upload-info small {
          color: #999;
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
          color: #333;
          font-size: 14px;
        }

        .form-group input {
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          transition: border-color 0.3s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        .form-group input.disabled-field {
          background-color: #f5f5f5;
          cursor: not-allowed;
          color: #999;
        }

        .form-group small {
          margin-top: 4px;
          color: #999;
          font-size: 12px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 30px;
          gap: 10px;
        }

        .btn-submit {
          background-color: #007bff;
          color: white;
          padding: 12px 30px;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .btn-submit:hover:not(:disabled) {
          background-color: #0056b3;
        }

        .btn-submit:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .loading {
          text-align: center;
          padding: 40px;
          font-size: 18px;
          color: #666;
        }

        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .profile-card {
            padding: 20px;
          }

          .profile-card h1 {
            font-size: 24px;
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

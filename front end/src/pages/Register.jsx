import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, uploadAPI, authAPI } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    age: '',
    password: '',
    phone: '',
    address: '',
    role: '',
    image_path: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let imageUrl = '';

      if (imageFile) {
        try {
          const uploadResponse = await uploadAPI.uploadFile(imageFile);
          imageUrl = uploadResponse.data.data?.url || uploadResponse.data.url;
        } catch (uploadError) {
          setError('فشل رفع الصورة: ' + (uploadError.response?.data?.message || uploadError.message));
          setLoading(false);
          return;
        }
      }

      const userData = {
        ...formData,
        age: parseInt(formData.age),
        image_path: imageUrl || undefined,
      };

      if (!userData.phone) delete userData.phone;
      if (!userData.address) delete userData.address;
      if (!imageUrl) delete userData.image_path;

      const response = await userAPI.register(userData);

      if (response.data.status === 1) {
        setSuccess(response.data.message);
        setIsVerifying(true);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'حدث خطأ أثناء التسجيل');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.verifyOtp(formData.email, otp);

      if (response.data.status === 1) {
        localStorage.setItem('authToken', response.data.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));

        setSuccess('تم تفعيل الحساب بنجاح! جاري تحويلك...');
        setTimeout(() => {
          navigate('/');
          window.location.reload();
        }, 1500);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'كود التحقق غير صحيح');
    } finally {
      setLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="container">
        <div className="card" style={{ maxWidth: '400px', margin: '50px auto' }}>
          <div className="card-header">
            <h2>التحقق من البريد الإلكتروني</h2>
            <p style={{ fontSize: '14px', color: '#666' }}>أدخل الكود المرسل إلى {formData.email}</p>
          </div>
          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label htmlFor="otp">كود التحقق (OTP)</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength="6"
                required
                style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '5px' }}
              />
            </div>

            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'جاري التحقق...' : 'تأكيد الرمز'}
            </button>
            <button
              type="button"
              className="btn"
              style={{ width: '100%', marginTop: '10px' }}
              onClick={() => setIsVerifying(false)}
            >
              الرجوع للتسجيل
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '600px', margin: '50px auto' }}>
        <div className="card-header">
          <h2>تسجيل مستخدم جديد</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="email">البريد الإلكتروني <span className="required">*</span></label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="first_name">الاسم الأول <span className="required">*</span></label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">الاسم الأخير <span className="required">*</span></label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="age">العمر <span className="required">*</span></label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="1"
                max="120"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">كلمة المرور <span className="required">*</span></label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                minLength="6"
                maxLength="15"
                required
              />
              <small style={{ color: '#666', fontSize: '12px' }}>يجب أن تكون بين 6 و 15 حرف</small>
            </div>

            <div className="form-group">
              <label htmlFor="phone">رقم الهاتف</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">العنوان</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">الدور <span className="required">*</span></label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">اختر الدور</option>
                <option value="USER">مستخدم</option>
                <option value="TEACHER">معلم</option>
                <option value="EMPLOYEE">موظف</option>
                <option value="ASSISTANT">مساعد</option>
                <option value="STUDENT">طالب</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="image">صورة المستخدم (اختياري)</label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imageFile && (
                <div style={{ marginTop: '10px' }}>
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }}
                  />
                </div>
              )}
            </div>
          </div>

          {error && <div className="message error">{error}</div>}
          {success && <div className="message success">{success}</div>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'جاري التسجيل...' : 'تسجيل'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;

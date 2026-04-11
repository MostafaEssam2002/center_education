import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/FileUpload';
import ConfirmationModal from '../components/ConfirmationModal';

const AddCourse = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    teacherId: '',
    imagePath: '',
    price: '',
    discount: '',
    paymentType: 'ONE_TIME',
    monthlyPrice: '',
  });
  const [error, setError] = useState('');
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    confirmText: 'موافق',
    cancelText: 'إلغاء',
    hideCancel: false,
    onConfirm: () => {},
  });

  const handleImageUpload = (url) => {
    setFormData({ ...formData, imagePath: url });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isTeacher = user?.role === 'TEACHER';
    if (!formData.title || !formData.description || (!isTeacher && !formData.teacherId)) {
      setError('يرجى تعبئة الحقول الأساسية');
      return;
    }

    const courseData = {
      title: formData.title,
      description: formData.description,
      ...(isTeacher ? {} : { teacherId: parseInt(formData.teacherId) }),
      imagePath: formData.imagePath,
      price: parseFloat(formData.price) || 0,
      discount: parseFloat(formData.discount) || 0,
      paymentType: formData.paymentType,
      monthlyPrice: formData.paymentType === 'MONTHLY' ? parseFloat(formData.monthlyPrice) || 0 : null,
    };

    try {
      await courseAPI.create(courseData);
      navigate('/courses');
    } catch (err) {
      setModalConfig({
        isOpen: true,
        title: 'خطأ',
        message: 'فشل إنشاء الكورس: ' + (err.response?.data?.message || err.message),
        type: 'danger',
        confirmText: 'موافق',
        hideCancel: true,
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false })),
      });
    }
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
    return <div className="empty-state">غير مصرح بالدخول لهذه الصفحة.</div>;
  }

  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header"><h2>إضافة كورس جديد</h2></div>
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div className="form-group">
            <label>العنوان <span className="required">*</span></label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>الوصف <span className="required">*</span></label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
          </div>

          <div className="form-group">
            <label>نوع الدفع <span className="required">*</span></label>
            <select value={formData.paymentType} onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}>
              <option value="ONE_TIME">دفعة واحدة</option>
              <option value="MONTHLY">اشتراك شهري</option>
            </select>
          </div>

          {formData.paymentType === 'ONE_TIME' && (
            <div className="form-group">
              <label>السعر <span className="required">*</span></label>
              <input type="number" min="0" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
            </div>
          )}

          {formData.paymentType === 'MONTHLY' && (
            <div className="form-group">
              <label>السعر الشهري <span className="required">*</span></label>
              <input type="number" min="0" step="0.01" value={formData.monthlyPrice} onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })} required />
            </div>
          )}

          <div className="form-group">
            <label>الخصم (المبلغ)</label>
            <input type="number" min="0" step="0.01" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} />
          </div>

          {user?.role !== 'TEACHER' && (
            <div className="form-group">
              <label>معرف المعلم <span className="required">*</span></label>
              <input type="number" value={formData.teacherId} onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })} required />
            </div>
          )}

          <FileUpload label="صورة الكورس" acceptedTypes="image/*" maxSizeMB={5} onUploadSuccess={handleImageUpload} />

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" className="btn btn-primary">حفظ</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/courses')}>إلغاء</button>
          </div>

          {error && <div className="message error" style={{ marginTop: '10px' }}>{error}</div>}
        </form>
      </div>

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        hideCancel={modalConfig.hideCancel}
      />
    </div>
  );
};

export default AddCourse;

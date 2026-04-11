import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';
import FileUpload from '../components/FileUpload';
import ConfirmationModal from '../components/ConfirmationModal';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imagePath: '',
    price: '',
    discount: '',
    paymentType: 'ONE_TIME',
    monthlyPrice: '',
  });
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    confirmText: 'تأكيد',
    cancelText: 'إلغاء',
    hideCancel: false,
    onConfirm: () => { },
  });
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await courseAPI.findAll(page);
      if (response.data.data) {
        setCourses(response.data.data);
        setPagination(response.data.pagination);
        setCurrentPage(page);
      } else {
        setCourses(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'فشل تحميل الكورسات');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTitle) {
      loadCourses();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await courseAPI.search(searchTitle);
      setCourses(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'الكورس غير موجود');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (url) => {
    setFormData({ ...formData, imagePath: url });
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title || '',
      description: course.description || '',
      imagePath: course.image_path || course.imagePath || '',
      price: course.price || '',
      discount: course.discount || '',
      paymentType: course.paymentType || 'ONE_TIME',
      monthlyPrice: course.monthlyPrice || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const courseData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        discount: parseFloat(formData.discount) || 0,
        monthlyPrice: formData.paymentType === 'MONTHLY' ? parseFloat(formData.monthlyPrice) || 0 : null,
      };
      await courseAPI.update(selectedCourse.id, courseData);
      setShowEditModal(false);
      loadCourses();
    } catch (err) {
      setModalConfig({
        isOpen: true,
        title: 'خطأ',
        message: 'فشل التحديث: ' + (err.response?.data?.message || err.message),
        type: 'danger',
        confirmText: 'موافق',
        hideCancel: true,
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false })),
      });
    }
  };

  const handleDelete = (id) => {
    setModalConfig({
      isOpen: true,
      title: 'حذف الكورس',
      message: 'هل أنت متأكد من حذف هذا الكورس؟ سيتم حذف جميع التسليمات المرتبطة به.',
      type: 'danger',
      confirmText: 'نعم، حذف',
      cancelText: 'إلغاء',
      hideCancel: false,
      onConfirm: async () => {
        try {
          await courseAPI.remove(id);
          setModalConfig(prev => ({ ...prev, isOpen: false }));
          loadCourses();
        } catch (err) {
          setModalConfig({
            isOpen: true,
            title: 'خطأ',
            message: 'فشل الحذف: ' + (err.response?.data?.message || err.message),
            type: 'danger',
            confirmText: 'موافق',
            hideCancel: true,
            onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false })),
          });
        }
      },
    });
  };

  const canManageCourses = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header">
          <h2>الكورسات</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            {canManageCourses && (
              <button className="btn btn-primary" onClick={() => navigate('/courses/new')}>
                إضافة كورس جديد
              </button>
            )}
            <button className="btn btn-primary" onClick={() => loadCourses(currentPage)}>
              تحديث
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="البحث بعنوان الكورس..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1, padding: '12px 20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(30, 41, 59, 0.7)', color: 'var(--neutral-100)', outline: 'none' }}
          />
          <button className="btn btn-primary" onClick={handleSearch}>
            بحث
          </button>
        </div>

        {error && <div className="message error">{error}</div>}

        {loading ? (
          <div className="empty-state">جاري التحميل...</div>
        ) : courses.length === 0 ? (
          <div className="empty-state">لا يوجد كورسات</div>
        ) : (
          <div>
            <div className="course-grid">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
            {pagination && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '10px' }}>
                <button className="btn btn-primary" disabled={currentPage === 1} onClick={() => loadCourses(currentPage - 1)}>
                  السابق
                </button>
                <span>صفحة {currentPage} من {pagination.totalPages}</span>
                <button className="btn btn-primary" disabled={currentPage === pagination.totalPages} onClick={() => loadCourses(currentPage + 1)}>
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
          }}
          onClick={() => setShowEditModal(false)}
        >
          <div className="card" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="card-header"><h2>تحديث الكورس</h2></div>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>العنوان</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>الوصف</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>نوع الدفع <span className="required">*</span></label>
                <select value={formData.paymentType} onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })} required>
                  <option value="ONE_TIME">دفعة واحدة</option>
                  <option value="MONTHLY">اشتراك شهري</option>
                </select>
              </div>
              {formData.paymentType === 'ONE_TIME' && (
                <div className="form-group">
                  <label>السعر</label>
                  <input type="number" min="0" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                </div>
              )}
              {formData.paymentType === 'MONTHLY' && (
                <div className="form-group">
                  <label>السعر الشهري</label>
                  <input type="number" min="0" step="0.01" value={formData.monthlyPrice} onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })} required />
                </div>
              )}
              <div className="form-group">
                <label>الخصم (%)</label>
                <input type="number" min="0" step="0.01" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} />
              </div>
              <FileUpload label="صورة الكورس" acceptedTypes="image/*" maxSizeMB={5} onUploadSuccess={handleImageUpload} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>تحديث</button>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowEditModal(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default Courses;

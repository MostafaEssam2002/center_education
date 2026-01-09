import { useState, useEffect } from 'react';
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    teacherId: '',
    imagePath: '',
  });
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    confirmText: 'تأكيد',
    cancelText: 'إلغاء',
    hideCancel: false,
    onConfirm: () => { }
  });
  const { user } = useAuth();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await courseAPI.findAll();
      setCourses(response.data);
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

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const courseData = {
        ...formData,
        teacherId: parseInt(formData.teacherId),
      };
      await courseAPI.create(courseData);
      setShowCreateModal(false);
      setFormData({ title: '', description: '', teacherId: '', imagePath: '' });
      loadCourses();
    } catch (err) {
      setModalConfig({
        isOpen: true,
        title: 'خطأ',
        message: 'فشل الإنشاء: ' + (err.response?.data?.message || err.message),
        type: 'danger',
        confirmText: 'موافق',
        hideCancel: true,
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
    }
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title || '',
      description: course.description || '',
      teacherId: course.teacherId?.toString() || '',
      imagePath: course.imagePath || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const courseData = {
        ...formData,
        teacherId: parseInt(formData.teacherId),
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
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
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
            onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
          });
        }
      }
    });
  };

  const canManageCourses = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h2>الكورسات</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            {canManageCourses && (
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                إضافة كورس جديد
              </button>
            )}
            <button className="btn btn-secondary" onClick={loadCourses}>
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
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '2px solid #e0e0e0' }}
          />
          <button className="btn btn-secondary" onClick={handleSearch}>
            بحث
          </button>
        </div>

        {error && <div className="message error">{error}</div>}

        {loading ? (
          <div className="empty-state">جاري التحميل...</div>
        ) : courses.length === 0 ? (
          <div className="empty-state">لا يوجد كورسات</div>
        ) : (
          <div className="course-grid">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
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
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="card"
            style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header">
              <h2>إضافة كورس جديد</h2>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>العنوان <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>الوصف <span className="required">*</span></label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>معرف المعلم <span className="required">*</span></label>
                <input
                  type="number"
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  required
                />
              </div>

              <FileUpload
                label="صورة الكورس"
                acceptedTypes="image/*"
                maxSizeMB={5}
                onUploadSuccess={handleImageUpload}
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  إضافة
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowCreateModal(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
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
            style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header">
              <h2>تعديل الكورس</h2>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>العنوان</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>معرف المعلم</label>
                <input
                  type="number"
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                />
              </div>

              <FileUpload
                label="تغيير صورة الكورس"
                acceptedTypes="image/*"
                maxSizeMB={5}
                onUploadSuccess={handleImageUpload}
              />

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

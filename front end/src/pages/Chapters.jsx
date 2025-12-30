import { useState, useEffect } from 'react';
import { chapterAPI, courseAPI, uploadAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Chapters = () => {
  const [chapters, setChapters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    courseId: '',
    videoPath: '',
    pdfPath: '',
    order: '',
  });
  const [uploading, setUploading] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadChapters(selectedCourseId);
    }
  }, [selectedCourseId]);

  const loadCourses = async () => {
    try {
      const response = await courseAPI.findAll();
      setCourses(response.data);
      if (response.data.length > 0 && !selectedCourseId) {
        setSelectedCourseId(response.data[0].id.toString());
      }
    } catch (err) {
      console.error('Error loading courses:', err);
    }
  };

  const loadChapters = async (courseId) => {
    setLoading(true);
    setError('');
    try {
      const response = await chapterAPI.findAllByCourse(courseId);
      setChapters(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'فشل تحميل الفصول');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === 'video') {
      setVideoFile(file);
    } else if (type === 'pdf') {
      setPdfFile(file);
    }
  };

  const uploadFiles = async () => {
    let videoUrl = formData.videoPath;
    let pdfUrl = formData.pdfPath;

    if (videoFile) {
      const response = await uploadAPI.uploadFile(videoFile);
      videoUrl = response.data.url;
    }

    if (pdfFile) {
      const response = await uploadAPI.uploadFile(pdfFile);
      pdfUrl = response.data.url;
    }

    return { videoUrl, pdfUrl };
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const { videoUrl, pdfUrl } = await uploadFiles();

      const chapterData = {
        ...formData,
        courseId: parseInt(formData.courseId),
        order: parseInt(formData.order),
        videoPath: videoUrl,
        pdfPath: pdfUrl,
      };
      await chapterAPI.create(chapterData);
      setShowCreateModal(false);
      resetForm();
      if (selectedCourseId) {
        loadChapters(selectedCourseId);
      }
    } catch (err) {
      alert('فشل الإنشاء: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (chapter) => {
    setSelectedChapter(chapter);
    setFormData({
      title: chapter.title || '',
      content: chapter.content || '',
      courseId: chapter.courseId?.toString() || '',
      videoPath: chapter.videoPath || '',
      pdfPath: chapter.pdfPath || '',
      order: chapter.order?.toString() || '',
    });
    setVideoFile(null);
    setPdfFile(null);
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const { videoUrl, pdfUrl } = await uploadFiles();

      const chapterData = {
        ...formData,
        courseId: parseInt(formData.courseId),
        order: parseInt(formData.order),
        videoPath: videoUrl,
        pdfPath: pdfUrl,
      };
      await chapterAPI.update(selectedChapter.id, chapterData);
      setShowEditModal(false);
      if (selectedCourseId) {
        loadChapters(selectedCourseId);
      }
    } catch (err) {
      alert('فشل التحديث: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الفصل؟')) return;

    try {
      await chapterAPI.remove(id);
      if (selectedCourseId) {
        loadChapters(selectedCourseId);
      }
    } catch (err) {
      alert('فشل الحذف: ' + (err.response?.data?.message || err.message));
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', courseId: '', videoPath: '', pdfPath: '', order: '' });
    setVideoFile(null);
    setPdfFile(null);
  };

  const canManageChapters = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h2>إدارة الفصول</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            {canManageChapters && (
              <button className="btn btn-primary" onClick={() => { resetForm(); setShowCreateModal(true); }}>
                إضافة فصل جديد
              </button>
            )}
            <button className="btn btn-secondary" onClick={() => selectedCourseId && loadChapters(selectedCourseId)}>
              تحديث
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>اختر الكورس:</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #e0e0e0' }}
          >
            <option value="">اختر الكورس</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="message error">{error}</div>}

        {!selectedCourseId ? (
          <div className="empty-state">يرجى اختيار كورس لعرض فصوله</div>
        ) : loading ? (
          <div className="empty-state">جاري التحميل...</div>
        ) : chapters.length === 0 ? (
          <div className="empty-state">لا يوجد فصول لهذا الكورس</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>الترتيب</th>
                  <th>العنوان</th>
                  <th>المحتوى</th>
                  <th>فيديو</th>
                  <th>PDF</th>
                  {canManageChapters && <th>الإجراءات</th>}
                </tr>
              </thead>
              <tbody>
                {chapters.map((chapter) => (
                  <tr key={chapter.id}>
                    <td>{chapter.order}</td>
                    <td>{chapter.title}</td>
                    <td>{chapter.content ? (chapter.content.length > 50 ? chapter.content.substring(0, 50) + '...' : chapter.content) : '-'}</td>
                    <td>{chapter.videoPath ? '✓' : '-'}</td>
                    <td>{chapter.pdfPath ? '✓' : '-'}</td>
                    {canManageChapters && (
                      <td>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', marginLeft: '5px' }}
                          onClick={() => handleEdit(chapter)}
                        >
                          تعديل
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '5px 10px' }}
                          onClick={() => handleDelete(chapter.id)}
                        >
                          حذف
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
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
            style={{ maxWidth: '600px', width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header">
              <h2>إضافة فصل جديد</h2>
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
                <label>المحتوى</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>الكورس <span className="required">*</span></label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  required
                >
                  <option value="">اختر الكورس</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>الفيديو</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, 'video')}
                />
                {formData.videoPath && <small>تم رفع فيديو سابق، اختر جديد للاستبدال</small>}
              </div>
              <div className="form-group">
                <label>ملف PDF</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, 'pdf')}
                />
                {formData.pdfPath && <small>تم رفع PDF سابق، اختر جديد للاستبدال</small>}
              </div>
              <div className="form-group">
                <label>الترتيب <span className="required">*</span></label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  min="1"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={uploading}>
                  {uploading ? 'جاري الرفع...' : 'إضافة'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowCreateModal(false)}
                  disabled={uploading}
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
            style={{ maxWidth: '600px', width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header">
              <h2>تعديل الفصل</h2>
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
                <label>المحتوى</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>الفيديو</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, 'video')}
                />
                {formData.videoPath && <small>يوجد فيديو حالي (سيتم الاحتفاظ به إذا لم ترفع جديد)</small>}
              </div>
              <div className="form-group">
                <label>ملف PDF</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, 'pdf')}
                />
                {formData.pdfPath && <small>يوجد PDF حالي (سيتم الاحتفاظ به إذا لم ترفع جديد)</small>}
              </div>
              <div className="form-group">
                <label>الترتيب</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  min="1"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={uploading}>
                  {uploading ? 'جاري الرفع...' : 'حفظ'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowEditModal(false)}
                  disabled={uploading}
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

export default Chapters;


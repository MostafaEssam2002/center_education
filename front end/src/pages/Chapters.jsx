import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { chapterAPI, courseAPI, uploadAPI, enrollmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const courseIdParam = searchParams.get('courseId');
    if (courseIdParam) {
      setSelectedCourseId(courseIdParam);
    }
  }, [searchParams]);

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
      if (user?.role === 'STUDENT') {
        const response = await enrollmentAPI.getCoursesByStudent(user.id);
        const enrolledCourses = response.data.map(e => e.course);
        setCourses(enrolledCourses);
        // Don't auto-select for students, show cards first
      } else {
        const response = await courseAPI.findAll(1, 1000);
        const data = response.data.data || response.data;
        setCourses(data);

        const courseIdParam = searchParams.get('courseId');
        if (courseIdParam) {
          setSelectedCourseId(courseIdParam);
        } else if (data.length > 0 && !selectedCourseId) {
          setSelectedCourseId(data[0].id.toString());
        }
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
        courseId: parseInt(selectedCourseId),
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
      Swal.fire({
        icon: 'error',
        title: 'فشل الإنشاء',
        text: err.response?.data?.message || err.message
      });
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
      Swal.fire({
        icon: 'error',
        title: 'فشل التحديث',
        text: err.response?.data?.message || err.message
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'هل أنت متأكد من حذف هذا الفصل؟',
      text: "لن تتمكن من التراجع عن هذا الإجراء!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'نعم، حذف',
      cancelButtonText: 'إلغاء'
    });

    if (!result.isConfirmed) return;

    try {
      await chapterAPI.remove(id);
      Swal.fire({
        icon: 'success',
        title: 'تم الحذف',
        text: 'تم حذف الفصل بنجاح',
        timer: 1500,
        showConfirmButton: false
      });
      if (selectedCourseId) {
        loadChapters(selectedCourseId);
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'فشل الحذف',
        text: err.response?.data?.message || err.message
      });
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', courseId: '', videoPath: '', pdfPath: '', order: '' });
    setVideoFile(null);
    setPdfFile(null);
  };

  const canManageChapters = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header">
          <h2>{selectedCourseId ? `فصول: ${courses.find(c => c.id.toString() === selectedCourseId)?.title}` : 'إدارة الفصول'}</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            {selectedCourseId && (
              <button className="btn btn-secondary" onClick={() => {
                setSelectedCourseId('');
                setSearchParams({});
              }}>
                العودة للكورسات
              </button>
            )}
            {canManageChapters && selectedCourseId && (
              <button className="btn btn-primary" onClick={() => {
                setFormData({ title: '', content: '', courseId: selectedCourseId, videoPath: '', pdfPath: '', order: '' });
                setVideoFile(null);
                setPdfFile(null);
                setShowCreateModal(true);
              }}>
                إضافة فصل جديد
              </button>
            )}
            <button className="btn btn-secondary" onClick={() => selectedCourseId ? loadChapters(selectedCourseId) : loadCourses()}>
              تحديث
            </button>
          </div>
        </div>

        {error && <div className="message error">{error}</div>}

        {!selectedCourseId ? (
          <div style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '20px', color: '#666' }}>اختر الكورس لعرض المحتوى:</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="course-card"
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #eee',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                  onClick={() => {
                    setSelectedCourseId(course.id.toString());
                    setSearchParams({ courseId: course.id.toString() });
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                  }}
                >
                  <div>
                    <div style={{
                      width: '100%',
                      height: '140px',
                      backgroundColor: '#f0f2f5',
                      borderRadius: '8px',
                      marginBottom: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '40px'
                    }}>
                      📚
                    </div>
                    <h3 style={{ color: '#333', marginBottom: '10px' }}>{course.title}</h3>
                    <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '15px' }}>
                      {course.description || 'لا يوجد وصف متاح'}
                    </p>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCourseId(course.id.toString());
                    }}
                  >
                    عرض الفصول
                  </button>
                </div>
              ))}
            </div>
            {courses.length === 0 && !loading && (
              <div className="empty-state">
                {user?.role === 'STUDENT' ? 'أنت غير مسجل في أي كورس حالياً' : 'لا يوجد كورسات متاحة'}
              </div>
            )}
          </div>
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
                  <tr
                    key={chapter.id}
                    onClick={() => navigate(`/courses/${selectedCourseId}/chapters/${chapter.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{chapter.order}</td>
                    <td>{chapter.title}</td>
                    <td>{chapter.content ? (chapter.content.length > 50 ? chapter.content.substring(0, 50) + '...' : chapter.content) : '-'}</td>
                    <td>{chapter.videoPath ? '✓' : '-'}</td>
                    <td>{chapter.pdfPath ? '✓' : '-'}</td>
                    {canManageChapters && (
                      <td onClick={(e) => e.stopPropagation()}>
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
                {/* Course is already selected from context */}
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


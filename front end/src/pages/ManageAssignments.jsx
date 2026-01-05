import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assignmentAPI, chapterAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/ConfirmationModal';

const ManageAssignments = () => {
    const { courseId, chapterId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [chapter, setChapter] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        maxGrade: 100,
        allowLate: true,
    });

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'danger',
        onConfirm: () => { },
    });

    useEffect(() => {
        loadData();
    }, [chapterId]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            // Load chapter to verify ownership
            const chapterRes = await chapterAPI.findOne(chapterId);
            setChapter(chapterRes.data);

            // Check if user is the course owner
            if (chapterRes.data.course.teacherId !== user.id) {
                setError('غير مصرح لك بإدارة واجبات هذا الفصل');
                return;
            }

            // Load assignments
            const assignmentsRes = await assignmentAPI.getByChapter(chapterId);
            setAssignments(assignmentsRes.data);
        } catch (err) {
            setError(err.response?.data?.message || 'فشل تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = {
                ...formData,
                chapterId: parseInt(chapterId),
            };

            if (editingId) {
                await assignmentAPI.update(editingId, data);
                showToast('تم تحديث الواجب بنجاح', 'success');
            } else {
                await assignmentAPI.create(data);
                showToast('تم إنشاء الواجب بنجاح', 'success');
            }

            setShowForm(false);
            setEditingId(null);
            resetForm();
            loadData();
        } catch (err) {
            showToast(err.response?.data?.message || 'فشل حفظ الواجب', 'error');
        }
    };

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'حذف الواجب',
            message: 'هل أنت متأكد من حذف هذا الواجب؟ سيتم حذف جميع التسليمات المرتبطة به.',
            type: 'danger',
            confirmText: 'نعم، حذف',
            cancelText: 'إلغاء',
            onConfirm: async () => {
                try {
                    await assignmentAPI.delete(id);
                    setAssignments(assignments.filter(a => a.id !== id));
                    showToast('تم حذف الواجب بنجاح', 'success');
                } catch (err) {
                    showToast(err.response?.data?.message || 'فشل حذف الواجب', 'error');
                }
                setConfirmModal({ ...confirmModal, isOpen: false });
            }
        });
    };

    const handleEdit = (assignment) => {
        setEditingId(assignment.id);
        setFormData({
            title: assignment.title,
            description: assignment.description || '',
            dueDate: new Date(assignment.dueDate).toISOString().slice(0, 16),
            maxGrade: assignment.maxGrade,
            allowLate: assignment.allowLate,
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            dueDate: '',
            maxGrade: 100,
            allowLate: true,
        });
        setEditingId(null);
    };

    const handleCancel = () => {
        setShowForm(false);
        resetForm();
    };

    if (loading) {
        return (
            <div className="container">
                <div className="card">
                    <div className="empty-state">جاري التحميل...</div>
                </div>
            </div>
        );
    }

    if (error && !chapter) {
        return (
            <div className="container">
                <div className="card">
                    <div className="message error">{error}</div>
                    <button className="btn btn-secondary" onClick={() => navigate(`/courses/${courseId}`)}>
                        العودة للكورس
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText={confirmModal.confirmText}
                cancelText={confirmModal.cancelText}
                onConfirm={confirmModal.onConfirm}
            />

            <div className="card">
                <div className="card-header">
                    <h2>إدارة واجبات: {chapter?.title}</h2>
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate(`/courses/${courseId}/chapters/${chapterId}`)}
                    >
                        العودة للفصل
                    </button>
                </div>

                {error && <div className="message error">{error}</div>}

                {!showForm && (
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowForm(true)}
                        style={{ marginBottom: '20px' }}
                    >
                        + إضافة واجب جديد
                    </button>
                )}

                {showForm && (
                    <div className="card" style={{ marginBottom: '30px', background: '#f8f9fa' }}>
                        <h3 style={{ marginBottom: '20px', color: '#667eea' }}>
                            {editingId ? 'تعديل الواجب' : 'واجب جديد'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>عنوان الواجب *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>الوصف</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>تاريخ التسليم *</label>
                                    <input
                                        type="datetime-local"
                                        className="form-control"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>الدرجة القصوى *</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min="1"
                                        value={formData.maxGrade}
                                        onChange={(e) => setFormData({ ...formData, maxGrade: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.allowLate}
                                        onChange={(e) => setFormData({ ...formData, allowLate: e.target.checked })}
                                        style={{ width: 'auto' }}
                                    />
                                    السماح بالتسليم المتأخر
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn btn-primary">
                                    {editingId ? 'تحديث' : 'إنشاء'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {assignments.length === 0 ? (
                    <div className="empty-state">لا توجد واجبات لهذا الفصل</div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>العنوان</th>
                                    <th>تاريخ التسليم</th>
                                    <th>الدرجة القصوى</th>
                                    <th>تأخير مسموح</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignments.map((assignment) => (
                                    <tr key={assignment.id}>
                                        <td>
                                            <strong>{assignment.title}</strong>
                                            {assignment.description && (
                                                <div style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                                                    {assignment.description}
                                                </div>
                                            )}
                                        </td>
                                        <td>{new Date(assignment.dueDate).toLocaleString('ar-EG')}</td>
                                        <td>{assignment.maxGrade}</td>
                                        <td>
                                            <span className={`badge ${assignment.allowLate ? 'badge-success' : 'badge-secondary'}`}>
                                                {assignment.allowLate ? 'نعم' : 'لا'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => navigate(`/assignments/${assignment.id}/submissions`)}
                                                >
                                                    عرض التسليمات
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => handleEdit(assignment)}
                                                >
                                                    تعديل
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(assignment.id)}
                                                    style={{ backgroundColor: '#dc3545', color: 'white', border: 'none' }}
                                                >
                                                    حذف
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageAssignments;

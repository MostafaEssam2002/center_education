import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assignmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const getFullUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const AssignmentSubmissions = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reviewingId, setReviewingId] = useState(null);
    const [reviewData, setReviewData] = useState({ grade: 0, feedback: '' });

    useEffect(() => {
        loadSubmissions();
    }, [assignmentId]);

    const loadSubmissions = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await assignmentAPI.getSubmissions(assignmentId);
            setSubmissions(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'فشل تحميل التسليمات');
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (submissionId) => {
        setError('');
        try {
            await assignmentAPI.reviewSubmission(submissionId, reviewData);
            setReviewingId(null);
            setReviewData({ grade: 0, feedback: '' });
            loadSubmissions();
        } catch (err) {
            setError(err.response?.data?.message || 'فشل حفظ التقييم');
        }
    };

    const openReviewModal = (submission) => {
        setReviewingId(submission.id);
        setReviewData({
            grade: submission.grade || 0,
            feedback: submission.feedback || '',
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            SUBMITTED: { text: 'مُسلّم', class: 'badge-primary' },
            LATE: { text: 'متأخر', class: 'badge-warning' },
            REVIEWED: { text: 'تم التقييم', class: 'badge-success' },
        };
        const statusInfo = statusMap[status] || { text: status, class: 'badge-secondary' };
        return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
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

    if (error && submissions.length === 0) {
        return (
            <div className="container">
                <div className="card">
                    <div className="message error">{error}</div>
                    <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                        رجوع
                    </button>
                </div>
            </div>
        );
    }

    // Get assignment info from first submission
    const assignment = submissions[0]?.assignment;

    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <div>
                        <h2>تسليمات الواجب: {assignment?.title || 'الواجب'}</h2>
                        {assignment && (
                            <div style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
                                <p>تاريخ التسليم: {new Date(assignment.dueDate).toLocaleString('ar-EG')}</p>
                                <p>الدرجة القصوى: {assignment.maxGrade}</p>
                            </div>
                        )}
                    </div>
                    <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                        رجوع
                    </button>
                </div>

                {error && <div className="message error">{error}</div>}

                {submissions.length === 0 ? (
                    <div className="empty-state">لا توجد تسليمات لهذا الواجب</div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>الطالب</th>
                                    <th>تاريخ التسليم</th>
                                    <th>الحالة</th>
                                    <th>الدرجة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((submission) => (
                                    <tr key={submission.id}>
                                        <td>
                                            <div>
                                                <strong>
                                                    {submission.student.first_name} {submission.student.last_name}
                                                </strong>
                                                <div style={{ fontSize: '0.85em', color: '#666' }}>
                                                    {submission.student.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{new Date(submission.submittedAt).toLocaleString('ar-EG')}</td>
                                        <td>{getStatusBadge(submission.status)}</td>
                                        <td>
                                            {submission.grade !== null && submission.grade !== undefined
                                                ? `${submission.grade} / ${assignment.maxGrade}`
                                                : '-'}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                <a
                                                    href={getFullUrl(submission.filePath)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-primary"
                                                >
                                                    عرض PDF
                                                </a>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => openReviewModal(submission)}
                                                >
                                                    {submission.status === 'REVIEWED' ? 'تعديل التقييم' : 'تقييم'}
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

            {/* Review Modal */}
            {reviewingId && (
                <div className="modal-overlay" onClick={() => setReviewingId(null)}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'right', direction: 'rtl' }}>
                        <div className="modal-icon-wrapper" style={{ marginBottom: '10px' }}>
                            <div className="modal-icon-info"></div>
                        </div>

                        <h3 className="modal-title" style={{ marginBottom: '15px' }}>تقييم التسليم</h3>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>الدرجة (من {assignment?.maxGrade})</label>
                            <input
                                type="number"
                                className="form-control"
                                min="0"
                                max={assignment?.maxGrade}
                                value={reviewData.grade}
                                onChange={(e) => setReviewData({ ...reviewData, grade: parseInt(e.target.value) })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>ملاحظات</label>
                            <textarea
                                className="form-control"
                                rows="4"
                                value={reviewData.feedback}
                                onChange={(e) => setReviewData({ ...reviewData, feedback: e.target.value })}
                                placeholder="أضف ملاحظاتك هنا..."
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', resize: 'vertical' }}
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn-modal btn-cancel"
                                onClick={() => setReviewingId(null)}
                            >
                                إلغاء
                            </button>
                            <button
                                className="btn-modal btn-confirm"
                                onClick={() => handleReview(reviewingId)}
                            >
                                حفظ التقييم
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignmentSubmissions;

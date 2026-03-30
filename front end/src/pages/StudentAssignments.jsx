import { useState, useEffect } from 'react';
import { assignmentAPI, uploadAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const StudentAssignments = () => {
    const { user } = useAuth();

    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [uploadingId, setUploadingId] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        loadAssignments();
    }, []);

    const loadAssignments = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await assignmentAPI.getMyAssignments();
            setAssignments(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'فشل تحميل الواجبات');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                setError('يجب أن يكون الملف من نوع PDF');
                setSelectedFile(null);
                return;
            }
            setSelectedFile(file);
            setError('');
        }
    };

    const handleSubmit = async (assignmentId) => {
        if (!selectedFile) {
            setError('يرجى اختيار ملف PDF');
            return;
        }

        setError('');
        setUploadProgress(0);

        try {
            // Upload file first
            const uploadResponse = await uploadAPI.uploadFile(selectedFile);
            const filePath = uploadResponse.data.url;

            // Submit assignment
            await assignmentAPI.submitAssignment(assignmentId, filePath);

            setUploadingId(null);
            setSelectedFile(null);
            setUploadProgress(0);
            loadAssignments();
        } catch (err) {
            setError(err.response?.data?.message || 'فشل رفع الملف');
        }
    };

    const openUploadModal = (assignmentId) => {
        setUploadingId(assignmentId);
        setSelectedFile(null);
        setError('');
    };

    const closeUploadModal = () => {
        setUploadingId(null);
        setSelectedFile(null);
        setError('');
    };

    const getStatusInfo = (assignment, submission) => {
        const now = new Date();
        const dueDate = new Date(assignment.dueDate);
        const isOverdue = now > dueDate;

        if (!submission) {
            return {
                text: isOverdue ? 'متأخر - لم يُسلّم' : 'لم يُسلّم بعد',
                class: isOverdue ? 'badge-danger' : 'badge-warning',
                canSubmit: assignment.allowLate || !isOverdue,
                isEdit: false,
            };
        }

        if (submission.status === 'REVIEWED') {
            return {
                text: `تم التقييم: ${submission.grade}/${assignment.maxGrade}`,
                class: 'badge-success',
                canSubmit: false,
                isEdit: false,
            };
        }

        return {
            text: submission.status === 'LATE' ? 'مُسلّم متأخر' : 'مُسلّم',
            class: submission.status === 'LATE' ? 'badge-warning' : 'badge-primary',
            canSubmit: assignment.allowLate || !isOverdue,
            isEdit: true,
        };
    };

    const getDaysUntilDue = (dueDate) => {
        const now = new Date();
        const due = new Date(dueDate);
        const diffMs = due - now;

        if (diffMs <= 0) {
            const overdueMs = Math.abs(diffMs);
            const overdueDays = Math.floor(overdueMs / (1000 * 60 * 60 * 24));
            const overdueHours = Math.floor((overdueMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const overdueMinutes = Math.floor((overdueMs % (1000 * 60 * 60)) / (1000 * 60));
            const parts = [];
            if (overdueDays) parts.push(`${overdueDays} يوم`);
            if (overdueHours) parts.push(`${overdueHours} ساعة`);
            if (overdueMinutes) parts.push(`${overdueMinutes} دقيقة`);
            return `متأخر بـ ${parts.join(' و ') || 'أقل من دقيقة'}`;
        }

        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const days = Math.floor(totalMinutes / (60 * 24));
        const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
        const minutes = totalMinutes % 60;
        const parts = [];
        if (days) parts.push(`${days} يوم`);
        if (hours) parts.push(`${hours} ساعة`);
        if (minutes) parts.push(`${minutes} دقيقة`);
        return `باقي ${parts.join(' و ') || 'أقل من دقيقة'}`;
    };

    // Group assignments by course
    const groupedAssignments = assignments.reduce((acc, assignment) => {
        const courseName = assignment.chapter?.course?.title || 'غير محدد';
        if (!acc[courseName]) {
            acc[courseName] = [];
        }
        acc[courseName].push(assignment);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="container">
                <div className="card">
                    <div className="empty-state">جاري التحميل...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content">
            <div className="card">
                <div className="card-header">
                    <h2>واجباتي</h2>
                </div>

                {error && !uploadingId && <div className="message error">{error}</div>}

                {assignments.length === 0 ? (
                    <div className="empty-state">لا توجد واجبات متاحة حالياً</div>
                ) : (
                    Object.entries(groupedAssignments).map(([courseName, courseAssignments]) => (
                        <div key={courseName} style={{ marginBottom: '30px' }}>
                            <h3 style={{
                                color: '#a5b4fc',
                                marginBottom: '15px',
                                padding: '10px',
                                background: 'rgba(30, 41, 59, 0.85)',
                                borderRadius: '8px'
                            }}>
                                {courseName}
                            </h3>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                                gap: '20px'
                            }}>
                                {courseAssignments.map((assignment) => {
                                    const submission = assignment.submissions?.[0];
                                    const statusInfo = getStatusInfo(assignment, submission);

                                    return (
                                        <div
                                            key={assignment.id}
                                            style={{
                                                border: '1px solid rgba(71,85,105,0.45)',
                                                borderRadius: '12px',
                                                padding: '20px',
                                                background: 'rgba(15, 23, 42, 0.95)',
                                                boxShadow: '0 2px 14px rgba(0,0,0,0.25)',
                                            }}
                                        >
                                            <div style={{ marginBottom: '15px' }}>
                                                <h4 style={{ color: '#e2e8f0', marginBottom: '5px' }}>
                                                    {assignment.title}
                                                </h4>
                                                <div style={{ fontSize: '0.85em', color: '#666' }}>
                                                    {assignment.chapter?.title}
                                                </div>
                                            </div>

                                            {assignment.description && (
                                                <p style={{
                                                    fontSize: '0.9em',
                                                    color: '#cbd5e1',
                                                    marginBottom: '15px',
                                                    lineHeight: '1.6'
                                                }}>
                                                    {assignment.description}
                                                </p>
                                            )}

                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '10px',
                                                marginBottom: '15px',
                                                fontSize: '0.9em'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#666' }}>تاريخ التسليم:</span>
                                                    <strong>{new Date(assignment.dueDate).toLocaleDateString('ar-EG')}</strong>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#666' }}>الوقت المتبقي:</span>
                                                    <strong>{getDaysUntilDue(assignment.dueDate)}</strong>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#666' }}>الدرجة القصوى:</span>
                                                    <strong>{assignment.maxGrade}</strong>
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: '15px' }}>
                                                <span className={`badge ${statusInfo.class}`}>
                                                    {statusInfo.text}
                                                </span>
                                            </div>

                                            {submission && submission.feedback && (
                                                <div style={{
                                                    background: 'rgba(30, 41, 59, 0.85)',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    marginBottom: '15px',
                                                }}>
                                                    <strong style={{ fontSize: '0.9em', color: '#93c5fd' }}>
                                                        ملاحظات المدرس:
                                                    </strong>
                                                    <p style={{ fontSize: '0.85em', margin: '5px 0 0 0', color: '#cbd5e1' }}>
                                                        {submission.feedback}
                                                    </p>
                                                </div>
                                            )}

                                            {statusInfo.canSubmit && (
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => openUploadModal(assignment.id)}
                                                    style={{ width: '100%' }}
                                                >
                                                    {statusInfo.isEdit ? 'تعديل التسليم' : 'تسليم الواجب'}
                                                </button>
                                            )}

                                            {submission && (
                                                <div style={{ fontSize: '0.85em', color: '#666', marginTop: '10px' }}>
                                                    تم التسليم: {new Date(submission.submittedAt).toLocaleString('ar-EG')}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Upload Modal */}
            {uploadingId && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeUploadModal(); }}>
                    <div className="modal-container" style={{ textAlign: 'right', direction: 'rtl' }}>
                        <div className="modal-icon-wrapper" style={{ marginBottom: '10px' }}>
                            <div className="modal-icon-info"></div>
                        </div>
                        <h3 className="modal-title" style={{ marginBottom: '15px' }}>تسليم الواجب</h3>
                        {error && <div className="alert alert-error" style={{ marginBottom: '15px', background: '#111827', color: '#f8fafc', border: '1px solid #3b82f6', padding: '12px 14px', borderRadius: '10px' }}>{error}</div>}
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>اختر ملف PDF</label>
                            <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block', width: '100%' }}>
                                <input
                                    type="file"
                                    id="file-upload"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '2px dashed #ccc',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        background: 'rgba(30, 41, 59, 0.95)',
                                        transition: 'all 0.3s',
                                        color: '#e2e8f0',
                                        borderColor: 'rgba(148,163,184,0.5)'
                                    }}
                                />
                            </div>

                            {selectedFile && (
                                <div style={{
                                    marginTop: '10px',
                                    padding: '8px',
                                    background: '#e0e7ff',
                                    color: '#4338ca',
                                    borderRadius: '5px',
                                    fontSize: '0.9em',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}>
                                    <span>📄</span>
                                    <span>تم اختيار: {selectedFile.name}</span>
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn-modal btn-cancel"
                                onClick={closeUploadModal}
                            >
                                إلغاء
                            </button>
                            <button
                                className="btn-modal btn-confirm"
                                onClick={() => handleSubmit(uploadingId)}
                                disabled={!selectedFile}
                                style={{ opacity: !selectedFile ? 0.6 : 1, cursor: !selectedFile ? 'not-allowed' : 'pointer' }}
                            >
                                تسليم
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentAssignments;

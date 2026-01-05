import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { enrollmentAPI, courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/ConfirmationModal';

const EnrollmentRequests = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [requests, setRequests] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(searchParams.get('courseId') || '');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'danger',
        onConfirm: () => { },
    });

    useEffect(() => {
        loadCourses();
        loadRequests();
    }, [selectedCourseId]);

    const loadCourses = async () => {
        try {
            const response = await courseAPI.findAll();
            // Filter courses where user is teacher or admin
            const userCourses = response.data.filter(course =>
                user.role === 'ADMIN' || course.teacherId === user.id
            );
            setMyCourses(userCourses);

            if (userCourses.length > 0 && !selectedCourseId) {
                setSelectedCourseId(userCourses[0].id.toString());
            }
        } catch (err) {
            console.error('Failed to load courses:', err);
        }
    };

    const loadRequests = async () => {
        if (!selectedCourseId) {
            setRequests([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await enrollmentAPI.getRequestsByCourse(selectedCourseId);
            setRequests(response.data);
        } catch (err) {
            const msg = err.response?.data?.message || 'فشل تحميل طلبات الالتحاق';
            // setError(msg); // Optional: keep showing inline error or just toast
            console.error('Failed to load requests:', err);
            // showToast(err.response?.data?.message || 'فشل تحميل الطلبات', 'error');
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (studentId) => {
        try {
            await enrollmentAPI.enroll(parseInt(studentId), parseInt(selectedCourseId));
            showToast('تم قبول الطالب بنجاح', 'success');
            loadRequests();

            // Update course card badge count
            setMyCourses(prev => prev.map(course => {
                if (course.id === parseInt(selectedCourseId)) {
                    return {
                        ...course,
                        _count: {
                            ...course._count,
                            requests: Math.max(0, (course._count?.requests || 0) - 1)
                        }
                    };
                }
                return course;
            }));
        } catch (err) {
            showToast(err.response?.data?.message || 'فشل قبول الطلب', 'error');
        }
    };

    const handleReject = (studentId) => {
        setConfirmModal({
            isOpen: true,
            title: 'رفض الطالب',
            message: 'هل أنت متأكد من رفض طلب الانضمام؟ لا يمكن التراجع عن هذا الإجراء.',
            type: 'danger',
            confirmText: 'نعم، رفض',
            cancelText: 'إلغاء',
            onConfirm: async () => {
                try {
                    await enrollmentAPI.rejectRequest(parseInt(selectedCourseId), parseInt(studentId));
                    showToast('تم رفض الطلب', 'info');
                    loadRequests();

                    // Update course card badge count
                    setMyCourses(prev => prev.map(course => {
                        if (course.id === parseInt(selectedCourseId)) {
                            return {
                                ...course,
                                _count: {
                                    ...course._count,
                                    requests: Math.max(0, (course._count?.requests || 0) - 1)
                                }
                            };
                        }
                        return course;
                    }));
                } catch (err) {
                    showToast('فشل رفض الطلب', 'error');
                }
                setConfirmModal({ ...confirmModal, isOpen: false });
            }
        });
    };

    const selectedCourse = myCourses.find(c => c.id === parseInt(selectedCourseId));

    if (loading && !requests) return <div className="loading-spinner">جاري التحميل...</div>;

    return (
        <div className="container" style={{ maxWidth: '1200px', padding: '20px' }}>

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

            <div className="card" style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '2rem', color: '#4f46e5', margin: 0 }}>طلبات الالتحاق</h2>
                    <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                        العودة
                    </button>
                </div>

                {myCourses.length === 0 ? (
                    <div className="empty-state">لا توجد كورسات</div>
                ) : (
                    <>
                        <div className="form-group">
                            <label style={{ fontSize: '1.2em', marginBottom: '15px', display: 'block' }}>اختر الكورس</label>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                gap: '15px',
                                marginBottom: '30px'
                            }}>
                                {myCourses.map(course => (
                                    <div
                                        key={course.id}
                                        onClick={() => setSelectedCourseId(course.id.toString())}
                                        style={{
                                            padding: '15px',
                                            borderRadius: '10px',
                                            border: selectedCourseId === course.id.toString() ? '2px solid #667eea' : '1px solid #ddd',
                                            background: selectedCourseId === course.id.toString() ? '#f0f4ff' : 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}
                                        className="course-card-selector"
                                    >
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '8px',
                                            background: selectedCourseId === course.id.toString() ? '#667eea' : '#e2e8f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: selectedCourseId === course.id.toString() ? 'white' : '#666',
                                            fontSize: '1.2em'
                                        }}>
                                            📚
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1em' }}>{course.title}</h4>
                                        </div>
                                        {course._count?.requests > 0 && (
                                            <div style={{
                                                marginLeft: 'auto',
                                                background: '#dc3545',
                                                color: 'white',
                                                borderRadius: '50%',
                                                width: '24px',
                                                height: '24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.8em',
                                                fontWeight: 'bold'
                                            }}>
                                                {course._count.requests}
                                            </div>
                                        )}
                                        {selectedCourseId === course.id.toString() && (
                                            <div style={{ marginLeft: course._count?.requests > 0 ? '5px' : 'auto', color: '#667eea' }}>✔</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedCourse && (
                            <div style={{
                                padding: '15px',
                                background: '#f8f9fa',
                                borderRadius: '12px',
                                marginBottom: '20px'
                            }}>
                                <h3 style={{ color: '#667eea', margin: '0 0 10px' }}>{selectedCourse.title}</h3>
                                <p style={{ margin: 0, color: '#666' }}>{selectedCourse.description}</p>
                            </div>
                        )}

                        {error && <div className="message error">{error}</div>}

                        {loading ? (
                            <div className="empty-state">جاري التحميل...</div>
                        ) : requests.length === 0 ? (
                            <div className="empty-state">لا توجد طلبات التحاق لهذا الكورس</div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: '20px',
                                marginTop: '20px'
                            }}>
                                {requests.map((request) => (
                                    <div key={request.id} className="card" style={{
                                        padding: '20px',
                                        margin: 0,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '15px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'start'
                                        }}>
                                            <div>
                                                <h4 style={{ margin: '0 0 5px', color: '#333' }}>
                                                    {request.student?.first_name} {request.student?.last_name}
                                                </h4>
                                                <span className="enrollment-badge pending">قيد الانتظار</span>
                                            </div>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                background: '#e2e8f0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.2em'
                                            }}>
                                                👤
                                            </div>
                                        </div>

                                        <div style={{ fontSize: '0.9em', color: '#666' }}>
                                            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>📧</span>
                                                {request.student?.email || '-'}
                                            </div>
                                            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>📱</span>
                                                {request.student?.phone || '-'}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>🕒</span>
                                                {new Date(request.createdAt).toLocaleDateString('ar-EG')}
                                            </div>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            gap: '10px',
                                            marginTop: 'auto',
                                            paddingTop: '15px',
                                            borderTop: '1px solid #eee'
                                        }}>
                                            <button
                                                className="btn btn-primary"
                                                style={{ flex: 1 }}
                                                onClick={() => handleAccept(request.studentId)}
                                            >
                                                قبول
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                style={{ flex: 1 }}
                                                onClick={() => handleReject(request.studentId)}
                                            >
                                                رفض
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default EnrollmentRequests;

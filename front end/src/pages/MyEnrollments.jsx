import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { enrollmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyEnrollments = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadEnrollments();
    }, []);

    const loadEnrollments = async () => {
        if (!user?.id) {
            setError('يجب تسجيل الدخول أولاً');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await enrollmentAPI.getCoursesByStudent(user.id);
            setEnrollments(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'فشل تحميل الكورسات');
        } finally {
            setLoading(false);
        }
    };

    const handleViewCourse = (courseId) => {
        navigate(`/courses/${courseId}`);
    };

    const handleWithdrawRequest = async (courseId) => {
        if (!window.confirm('هل أنت متأكد من سحب طلب الالتحاق؟')) return;

        try {
            await enrollmentAPI.withdrawRequest(courseId);
            alert('تم سحب الطلب بنجاح');
            loadEnrollments();
        } catch (err) {
            alert(err.response?.data?.message || 'فشل سحب الطلب');
        }
    };

    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <h2>كورساتي</h2>
                    <button className="btn btn-secondary" onClick={() => navigate('/courses')}>
                        تصفح الكورسات
                    </button>
                </div>

                {error && <div className="message error">{error}</div>}

                {loading ? (
                    <div className="empty-state">جاري التحميل...</div>
                ) : enrollments.length === 0 ? (
                    <div className="empty-state">
                        <p>لم تسجل في أي كورس بعد</p>
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: '15px' }}
                            onClick={() => navigate('/courses')}
                        >
                            تصفح الكورسات المتاحة
                        </button>
                    </div>
                ) : (
                    <div className="course-grid">
                        {enrollments.map((enrollment) => (
                            <div key={enrollment.id} className="course-card">
                                {enrollment.course?.imagePath && (
                                    <div className="course-card-image">
                                        <img src={enrollment.course.imagePath} alt={enrollment.course.title} />
                                    </div>
                                )}

                                <div className="course-card-content">
                                    <h3 className="course-card-title">{enrollment.course?.title || 'كورس'}</h3>
                                    <p className="course-card-description">
                                        {enrollment.course?.description?.substring(0, 120)}
                                        {enrollment.course?.description?.length > 120 ? '...' : ''}
                                    </p>

                                    <div className="course-card-meta">
                                        {enrollment.course?.teacher && (
                                            <div className="course-meta-item">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                    <circle cx="12" cy="7" r="4"></circle>
                                                </svg>
                                                <span>
                                                    {enrollment.course.teacher.first_name} {enrollment.course.teacher.last_name}
                                                </span>
                                            </div>
                                        )}

                                        <div className="course-meta-item">
                                            <span className={`enrollment-badge ${enrollment.status || 'approved'}`}>
                                                {enrollment.status === 'pending' ? 'قيد المراجعة' : 'مسجل'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="course-card-actions">
                                    {enrollment.status === 'pending' ? (
                                        <button
                                            className="btn btn-danger btn-block"
                                            onClick={() => handleWithdrawRequest(enrollment.courseId)}
                                        >
                                            سحب الطلب
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-primary btn-block"
                                            onClick={() => handleViewCourse(enrollment.courseId)}
                                        >
                                            الدخول للكورس
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyEnrollments;

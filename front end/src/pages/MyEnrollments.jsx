import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { enrollmentAPI, chapterProgressAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyEnrollments = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [enrollments, setEnrollments] = useState([]);
    const [progress, setProgress] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadEnrollments();
    }, []);

    useEffect(() => {
        if (enrollments.length > 0) {
            loadProgress();
        }
    }, [enrollments]);

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
            // Load progress for each course - now handled by useEffect on enrollments change
        } catch (err) {
            setError(err.response?.data?.message || 'فشل تحميل الكورسات');
        } finally {
            setLoading(false);
        }
    };

    const loadProgress = async () => {
        console.log('Starting loadProgress...');
        const progressData = {};

        for (const enrollment of enrollments) {
            if (enrollment.courseId && (enrollment.status === 'approved' || !enrollment.status)) {
                try {
                    console.log(`Fetching progress for course ${enrollment.courseId}`);
                    const response = await chapterProgressAPI.getCourseProgress(enrollment.courseId);
                    // The API returns the average progress as a number
                    progressData[enrollment.courseId] = Math.round(response.data || 0);
                    console.log(`Progress for course ${enrollment.courseId}:`, response.data);
                } catch (err) {
                    console.error(`Failed to load progress for course ${enrollment.courseId}`, err);
                    // If progress fails, default to 0
                    progressData[enrollment.courseId] = 0;
                }
            }
        }

        setProgress(progressData);
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

    // Circular Progress Component
    const CircularProgress = ({ percentage = 0 }) => {
        const size = 80;
        const strokeWidth = 6;
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (percentage / 100) * circumference;

        // Determine color based on progress
        let strokeColor = '#ef4444'; // red for low progress
        if (percentage > 70) strokeColor = '#10b981'; // green for high
        else if (percentage > 40) strokeColor = '#f59e0b'; // orange for medium

        return (
            <div className="circular-progress">
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                </svg>
                <div className="circular-progress-text">
                    <span style={{ color: strokeColor }}>{percentage}%</span>
                </div>
            </div>
        );
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
                        {enrollments.map((enrollment) => {
                            // Helper to get full image URL
                            const getImageUrl = (path) => {
                                if (!path) return null;
                                if (path.startsWith('http')) return path;
                                return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/${path}`;
                            };

                            const imageUrl = getImageUrl(enrollment.course?.image_path);

                            return (
                                <div key={enrollment.id} className="course-card">
                                    <div className="course-card-header-with-progress">
                                        {imageUrl ? (
                                            <div className="course-card-image">
                                                <img src={imageUrl} alt={enrollment.course.title} />
                                            </div>
                                        ) : (
                                            <div className="course-card-image placeholder-image">
                                                {/* Placeholder gradient if no image */}
                                            </div>
                                        )}

                                        {/* Show progress for enrolled courses (status undefined or approved) */}
                                        {(!enrollment.status || enrollment.status === 'approved') && (
                                            <div className="course-card-progress-overlay">
                                                <CircularProgress percentage={progress[enrollment.courseId] || 0} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="course-card-content">
                                        <h3 className="course-card-title">{enrollment.course?.title || 'كورس'}</h3>
                                        <p className="course-card-description">
                                            {enrollment.course?.description?.substring(0, 120)}
                                            {enrollment.course?.description?.length > 120 ? '...' : ''}
                                        </p>

                                        <div className="course-card-price" style={{ marginTop: '10px', marginBottom: '10px' }}>
                                            {enrollment.course?.discount && enrollment.course?.discount > 0 ? (
                                                <div>
                                                    <span style={{ textDecoration: 'line-through', color: '#999', marginRight: '8px' }}>
                                                        {enrollment.course?.price} ج.م
                                                    </span>
                                                    <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                                                        {enrollment.course?.price - enrollment.course?.discount} ج.م
                                                    </span>
                                                </div>
                                            ) : (
                                                <span style={{ fontWeight: 'bold' }}>
                                                    {enrollment.course?.price ? `${enrollment.course?.price} ج.م` : 'مجاني'}
                                                </span>
                                            )}
                                        </div>

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
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyEnrollments;

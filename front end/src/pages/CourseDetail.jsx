import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseAPI, chapterAPI, enrollmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [course, setCourse] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [enrollmentStatus, setEnrollmentStatus] = useState(null);
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        loadCourseData();
    }, [id, user]);

    const loadCourseData = async () => {
        setLoading(true);
        setError('');
        try {
            // Load course details
            const courseResponse = await courseAPI.findOne(id);
            setCourse(courseResponse.data);

            // Load chapters
            try {
                const chaptersResponse = await chapterAPI.findAllByCourse(id);
                setChapters(chaptersResponse.data.sort((a, b) => a.order - b.order));
            } catch (err) {
                console.error('Error loading chapters:', err);
            }

            // Check enrollment status for students
            if (user?.role === 'STUDENT') {
                try {
                    const enrollmentsResponse = await enrollmentAPI.getCoursesByStudent(user.id);
                    const isEnrolled = enrollmentsResponse.data.some(
                        enrollment => enrollment.courseId === parseInt(id)
                    );
                    setEnrollmentStatus(isEnrolled ? 'enrolled' : 'not_enrolled');
                } catch (err) {
                    console.error('Error checking enrollment:', err);
                    setEnrollmentStatus('not_enrolled');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'فشل تحميل بيانات الكورس');
        } finally {
            setLoading(false);
        }
    };

    const handleEnrollRequest = async () => {
        setEnrolling(true);
        try {
            await enrollmentAPI.requestEnrollment(parseInt(id));
            setEnrollmentStatus('pending');
            showToast('تم إرسال طلب الالتحاق بنجاح', 'success');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'فشل إرسال طلب الالتحاق';
            if (err.response?.status === 409) {
                showToast(errorMsg, 'info');
            } else {
                showToast(errorMsg, 'error');
            }
        } finally {
            setEnrolling(false);
        }
    };

    const handleViewChapter = (chapterId) => {
        navigate(`/courses/${id}/chapters/${chapterId}`);
    };

    const handleAddChapter = () => {
        navigate(`/chapters?courseId=${id}`);
    };

    const handleViewStudents = () => {
        navigate(`/courses/${id}/students`);
    };

    const handleViewEnrollmentRequests = () => {
        navigate(`/enrollment-requests?courseId=${id}`);
    };

    const canManage = user?.role === 'ADMIN' ||
        (user?.role === 'TEACHER' && course?.teacherId === user?.id);

    if (loading) {
        return (
            <div className="container">
                <div className="card">
                    <div className="empty-state">جاري التحميل...</div>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="container">
                <div className="card">
                    <div className="message error">{error || 'الكورس غير موجود'}</div>
                    <button className="btn btn-secondary" onClick={() => navigate('/courses')}>
                        العودة للكورسات
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <h2>{course.title}</h2>
                    <button className="btn btn-secondary" onClick={() => navigate('/courses')}>
                        العودة
                    </button>
                </div>

                {course.imagePath && (
                    <div style={{ marginBottom: '20px', borderRadius: '12px', overflow: 'hidden' }}>
                        <img
                            src={course.imagePath}
                            alt={course.title}
                            style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
                        />
                    </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: 'var(--primary-light)', marginBottom: '10px' }}>الوصف</h3>
                    <p style={{ lineHeight: '1.8', color: 'var(--neutral-300)' }}>{course.description}</p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    marginBottom: '20px',
                    padding: '20px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px'
                }}>
                    <div>
                        <strong style={{ color: 'var(--primary-light)' }}>المعلم:</strong>
                        <p style={{ margin: '5px 0 0' }}>
                            {course.teacher ? `${course.teacher.first_name} ${course.teacher.last_name}` : `معرف ${course.teacherId}`}
                        </p>
                    </div>
                    <div>
                        <strong style={{ color: 'var(--primary-light)' }}>عدد الطلاب:</strong>
                        <p style={{ margin: '5px 0 0' }}>{course.enrollments?.length || 0}</p>
                    </div>
                    <div>
                        <strong style={{ color: 'var(--primary-light)' }}>عدد الفصول:</strong>
                        <p style={{ margin: '5px 0 0' }}>{chapters.length}</p>
                    </div>
                    <div>
                        <strong style={{ color: 'var(--primary-light)' }}>السعر:</strong>
                        <div style={{ margin: '5px 0 0' }}>
                            {course.paymentType === 'MONTHLY' ? (
                                course.discount && course.discount > 0 ? (
                                    <div>
                                        <span style={{ textDecoration: 'line-through', color: 'var(--neutral-400)', marginRight: '8px', fontSize: '0.9em' }}>
                                            {course.monthlyPrice} ج.م/شهر
                                        </span>
                                        <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>
                                            {course.monthlyPrice - course.discount} ج.م/شهر
                                        </span>
                                    </div>
                                ) : (
                                    <span>{course.monthlyPrice ? `${course.monthlyPrice} ج.م/شهر` : 'مجاني'}</span>
                                )
                            ) : (
                                course.discount && course.discount > 0 ? (
                                    <div>
                                        <span style={{ textDecoration: 'line-through', color: 'var(--neutral-400)', marginRight: '8px', fontSize: '0.9em' }}>
                                            {course.price} ج.م
                                        </span>
                                        <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>
                                            {course.price - course.discount} ج.م
                                        </span>
                                    </div>
                                ) : (
                                    <span>{course.price ? `${course.price} ج.م` : 'مجاني'}</span>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Enrollment Actions for Students */}
                {user?.role === 'STUDENT' && (
                    <div style={{ marginBottom: '20px' }}>
                        {enrollmentStatus === 'enrolled' ? (
                            <div className="message success">أنت مسجل في هذا الكورس</div>
                        ) : enrollmentStatus === 'pending' ? (
                            <div className="message" style={{ background: '#fff3cd', color: '#856404' }}>
                                طلب الالتحاق قيد المراجعة
                            </div>
                        ) : (
                            <button
                                className="btn btn-primary btn-block"
                                onClick={handleEnrollRequest}
                                disabled={enrolling}
                            >
                                {enrolling ? 'جاري الإرسال...' : 'طلب الالتحاق بالكورس'}
                            </button>
                        )}
                    </div>
                )}

                {/* Management Actions for Teachers/Admins */}
                {canManage && (
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary" onClick={handleAddChapter}>
                            إضافة فصل جديد
                        </button>
                        <button className="btn btn-secondary" onClick={handleViewStudents}>
                            عرض الطلاب المسجلين
                        </button>
                        <button className="btn btn-secondary" onClick={handleViewEnrollmentRequests}>
                            طلبات الالتحاق
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate(`/courses/${id}/quizzes`)}>
                            إدارة الاختبارات
                        </button>
                    </div>
                )}

                <div>
                    <h3 style={{ color: 'var(--primary-light)', marginBottom: '15px' }}>الفصول</h3>
                    {chapters.length === 0 ? (
                        <div className="empty-state">لا توجد فصول في هذا الكورس</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                            {chapters.map((chapter, index) => (
                                <div
                                    key={chapter.id}
                                    style={{
                                        padding: '20px',
                                        background: 'var(--glass-bg)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        gap: '15px',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                    className="chapter-item"
                                    onClick={() => handleViewChapter(chapter.id)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--primary)';
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--glass-border)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 10px', color: 'var(--primary-light)', fontSize: '18px', fontWeight: '600' }}>
                                                {index + 1}. {chapter.title}
                                            </h4>
                                            {chapter.content && (
                                                <p style={{ margin: 0, color: 'var(--neutral-300)', fontSize: '14px', lineHeight: '1.5' }}>
                                                    {chapter.content.substring(0, 100)}
                                                    {chapter.content.length > 100 ? '...' : ''}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid var(--glass-border)' }}>
                                        {chapter.videoPath && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary-light)', fontSize: '13px' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                                </svg>
                                                <span>فيديو</span>
                                            </div>
                                        )}
                                        {chapter.pdfPath && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--secondary)', fontSize: '13px' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                                    <polyline points="13 2 13 9 20 9"></polyline>
                                                </svg>
                                                <span>ملف</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;

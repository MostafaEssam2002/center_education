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
    const [totalChapters, setTotalChapters] = useState(0);
    const [chaptersLoading, setChaptersLoading] = useState(false);

    // Missing state variables
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [enrollmentStatus, setEnrollmentStatus] = useState('not_enrolled');
    const [enrolling, setEnrolling] = useState(false);
    const [page, setPage] = useState(1);
    const [chapterPerPage] = useState(1);

    // Fetch Course Details & Enrollment Status
    useEffect(() => {
        const fetchCourseDetails = async () => {
            setLoading(true);
            setError('');
            try {
                // Load course details
                const courseResponse = await courseAPI.findAll();
                const foundCourse = courseResponse.data.find(c => c.id === parseInt(id));

                if (!foundCourse) {
                    setError('الكورس غير موجود');
                    setLoading(false);
                    return;
                }

                setCourse(foundCourse);

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

        fetchCourseDetails();
    }, [id, user]);

    // Reset page when course ID changes
    useEffect(() => {
        setPage(1);
    }, [id]);

    // Fetch Chapters (Pagination)
    useEffect(() => {
        const fetchChapters = async () => {
            setChaptersLoading(true);
            try {
                const chaptersResponse = await chapterAPI.findAllByCourse(id, page, chapterPerPage);
                setChapters(chaptersResponse.data.data);
                setTotalChapters(chaptersResponse.data.total);
            } catch (err) {
                console.error('Error loading chapters:', err);
            } finally {
                setChaptersLoading(false);
            }
        };

        fetchChapters();
    }, [id, page, chapterPerPage]);

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
                    <h3 style={{ color: '#667eea', marginBottom: '10px' }}>الوصف</h3>
                    <p style={{ lineHeight: '1.8', color: '#666' }}>{course.description}</p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    marginBottom: '20px',
                    padding: '20px',
                    background: '#f8f9fa',
                    borderRadius: '12px'
                }}>
                    <div>
                        <strong style={{ color: '#667eea' }}>المعلم:</strong>
                        <p style={{ margin: '5px 0 0' }}>
                            {course.teacher ? `${course.teacher.first_name} ${course.teacher.last_name}` : `معرف ${course.teacherId}`}
                        </p>
                    </div>
                    <div>
                        <strong style={{ color: '#667eea' }}>عدد الطلاب:</strong>
                        <p style={{ margin: '5px 0 0' }}>{course.enrollments?.length || 0}</p>
                    </div>
                    <div>
                        <strong style={{ color: '#667eea' }}>عدد الفصول:</strong>
                        <p style={{ margin: '5px 0 0' }}>{chapters.length}</p>
                    </div>
                    <div>
                        <strong style={{ color: '#667eea' }}>السعر:</strong>
                        <div style={{ margin: '5px 0 0' }}>
                            {course.discount && course.discount > 0 ? (
                                <div>
                                    <span style={{ textDecoration: 'line-through', color: '#999', marginRight: '8px', fontSize: '0.9em' }}>
                                        {course.price} ج.م
                                    </span>
                                    <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                                        {course.price - course.discount} ج.م
                                    </span>
                                </div>
                            ) : (
                                <span>{course.price ? `${course.price} ج.م` : 'مجاني'}</span>
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

                {/* Chapters List */}
                <div>
                    <h3 style={{ color: '#667eea', marginBottom: '15px' }}>الفصول</h3>
                    {chapters.length === 0 ? (
                        <div className="empty-state">لا توجد فصول في هذا الكورس</div>
                    ) : (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            opacity: chaptersLoading ? 0.5 : 1,
                            pointerEvents: chaptersLoading ? 'none' : 'auto',
                            transition: 'opacity 0.2s ease'
                        }}>
                            {chapters.map((chapter, index) => (
                                <div
                                    key={chapter.id}
                                    style={{
                                        padding: '15px',
                                        background: 'white',
                                        border: '2px solid #e0e0e0',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                    }}
                                    className="chapter-item"
                                    onClick={() => handleViewChapter(chapter.id)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = '#667eea';
                                        e.currentTarget.style.transform = 'translateX(-5px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#e0e0e0';
                                        e.currentTarget.style.transform = 'translateX(0)';
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 5px', color: '#667eea' }}>
                                                {/* Calculate absolute index: (page-1)*limit + index + 1 */}
                                                {(page - 1) * chapterPerPage + index + 1}. {chapter.title}
                                            </h4>
                                            {chapter.content && (
                                                <p style={{ margin: 0, color: '#999', fontSize: '14px' }}>
                                                    {chapter.content.substring(0, 100)}
                                                    {chapter.content.length > 100 ? '...' : ''}
                                                </p>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            {chapter.videoPath && (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                                </svg>
                                            )}
                                            {chapter.pdfPath && (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                                                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                                    <polyline points="13 2 13 9 20 9"></polyline>
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalChapters > chapterPerPage && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button
                                className="btn btn-secondary"
                                disabled={page <= 1}
                                onClick={() => setPage(page - 1)}
                                style={{ padding: '8px 16px' }}
                            >
                                السابق
                            </button>

                            {Array.from({ length: Math.ceil(totalChapters / chapterPerPage) }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        border: '1px solid #667eea',
                                        background: pageNum === page ? '#667eea' : 'white',
                                        color: pageNum === page ? 'white' : '#667eea',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {pageNum}
                                </button>
                            ))}

                            <button
                                className="btn btn-secondary"
                                disabled={page >= Math.ceil(totalChapters / chapterPerPage)}
                                onClick={() => setPage(page + 1)}
                                style={{ padding: '8px 16px' }}
                            >
                                التالي
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;

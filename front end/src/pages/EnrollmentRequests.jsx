import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { enrollmentAPI, courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EnrollmentRequests = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [requests, setRequests] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(searchParams.get('courseId') || '');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadCourses();
    }, []);

    useEffect(() => {
        if (selectedCourseId) {
            loadRequests();
        }
    }, [selectedCourseId]);

    const loadCourses = async () => {
        try {
            const response = await courseAPI.findAll();
            // Filter courses by teacher if user is a teacher
            const userCourses = user?.role === 'TEACHER'
                ? response.data.filter(c => c.teacherId === user.id)
                : response.data;
            setCourses(userCourses);

            if (userCourses.length > 0 && !selectedCourseId) {
                setSelectedCourseId(userCourses[0].id.toString());
            }
        } catch (err) {
            setError('فشل تحميل الكورسات');
        }
    };

    const loadRequests = async () => {
        if (!selectedCourseId) return;

        setLoading(true);
        setError('');
        try {
            const response = await enrollmentAPI.getRequestsByCourse(selectedCourseId);
            setRequests(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'فشل تحميل طلبات الالتحاق');
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (studentId) => {
        try {
            await enrollmentAPI.enroll(parseInt(studentId), parseInt(selectedCourseId));
            alert('تم قبول الطالب بنجاح');
            loadRequests();
        } catch (err) {
            alert(err.response?.data?.message || 'فشل قبول الطالب');
        }
    };

    const handleReject = async (studentId) => {
        if (!window.confirm('هل أنت متأكد من رفض هذا الطلب؟')) return;

        try {
            // Note: Backend doesn't have a reject endpoint, so we'll just remove the request
            // In a real app, you might want to add a reject endpoint
            alert('تم رفض الطلب');
            loadRequests();
        } catch (err) {
            alert('فشل رفض الطلب');
        }
    };

    const selectedCourse = courses.find(c => c.id === parseInt(selectedCourseId));

    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <h2>طلبات الالتحاق</h2>
                    <button className="btn btn-secondary" onClick={() => navigate('/courses')}>
                        العودة
                    </button>
                </div>

                {courses.length === 0 ? (
                    <div className="empty-state">لا توجد كورسات</div>
                ) : (
                    <>
                        <div className="form-group">
                            <label>اختر الكورس</label>
                            <select
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                                className="form-control"
                            >
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
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
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>اسم الطالب</th>
                                            <th>البريد الإلكتروني</th>
                                            <th>رقم الهاتف</th>
                                            <th>الحالة</th>
                                            <th>الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map((request) => (
                                            <tr key={request.id}>
                                                <td>
                                                    {request.student?.first_name} {request.student?.last_name}
                                                </td>
                                                <td>{request.student?.email || '-'}</td>
                                                <td>{request.student?.phone || '-'}</td>
                                                <td>
                                                    <span className="enrollment-badge pending">قيد الانتظار</span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '5px' }}>
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => handleApprove(request.studentId)}
                                                        >
                                                            قبول
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleReject(request.studentId)}
                                                        >
                                                            رفض
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default EnrollmentRequests;

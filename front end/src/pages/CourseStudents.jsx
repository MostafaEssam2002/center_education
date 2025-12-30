import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { enrollmentAPI, courseAPI } from '../services/api';

const CourseStudents = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            // Load course details
            const courseResponse = await courseAPI.findAll();
            const foundCourse = courseResponse.data.find(c => c.id === parseInt(id));
            setCourse(foundCourse);

            // Load enrolled students
            const studentsResponse = await enrollmentAPI.getStudentsByCourse(id);
            setStudents(studentsResponse.data);
        } catch (err) {
            setError(err.response?.data?.message || 'فشل تحميل البيانات');
        } finally {
            setLoading(false);
        }
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

    if (error || !course) {
        return (
            <div className="container">
                <div className="card">
                    <div className="message error">{error || 'الكورس غير موجود'}</div>
                    <button className="btn btn-secondary" onClick={() => navigate('/courses')}>
                        العودة
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <h2>الطلاب المسجلين - {course.title}</h2>
                    <button className="btn btn-secondary" onClick={() => navigate(`/courses/${id}`)}>
                        العودة للكورس
                    </button>
                </div>

                <div style={{
                    padding: '15px',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                        <div>
                            <strong style={{ color: '#667eea' }}>عدد الطلاب:</strong>
                            <span style={{ marginRight: '10px' }}>{students.length}</span>
                        </div>
                        <div>
                            <strong style={{ color: '#667eea' }}>الكورس:</strong>
                            <span style={{ marginRight: '10px' }}>{course.title}</span>
                        </div>
                    </div>
                </div>

                {students.length === 0 ? (
                    <div className="empty-state">لا يوجد طلاب مسجلين في هذا الكورس</div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>الاسم الأول</th>
                                    <th>الاسم الأخير</th>
                                    <th>البريد الإلكتروني</th>
                                    <th>رقم الهاتف</th>
                                    <th>العمر</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((enrollment, index) => (
                                    <tr key={enrollment.id}>
                                        <td>{index + 1}</td>
                                        <td>{enrollment.user?.first_name || '-'}</td>
                                        <td>{enrollment.user?.last_name || '-'}</td>
                                        <td>{enrollment.user?.email || '-'}</td>
                                        <td>{enrollment.user?.phone || '-'}</td>
                                        <td>{enrollment.user?.age || '-'}</td>
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

export default CourseStudents;

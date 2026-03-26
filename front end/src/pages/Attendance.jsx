import { useState, useEffect } from 'react';
import { courseAPI } from '../services/api';
import CourseSessions from '../components/attendance/CourseSessions';
import SessionAttendance from '../components/attendance/SessionAttendance';

const Attendance = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedSession, setSelectedSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await courseAPI.findAll(1, 1000);
                setCourses(res.data.data || res.data);
            } catch (error) {
                console.error('Failed to load courses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleSessionSelect = (session) => {
        setSelectedSession(session);
    };

    const handleBackToSessions = () => {
        setSelectedSession(null);
    };

    return (
        <div className="attendance-page">
            <div className="attendance-header">
                <div className="attendance-header-icon">📋</div>
                <h2 className="attendance-title">إدارة الحضور والغياب</h2>
                <p className="attendance-subtitle">تسجيل ومتابعة حضور الطلاب في جلسات الكورسات</p>
            </div>

            {!selectedSession && (
                <div className="attendance-course-select-card">
                    <div className="form-group-modern">
                        <label htmlFor="courseSelect" className="form-label-modern">
                            <span className="label-icon">🎓</span>
                            اختر الكورس:
                        </label>
                        {loading ? (
                            <div className="loading-skeleton"></div>
                        ) : (
                            <select
                                id="courseSelect"
                                className="form-select-modern"
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                            >
                                <option value="">-- اختر كورس --</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
            )}

            {selectedSession ? (
                <SessionAttendance
                    session={selectedSession}
                    onBack={handleBackToSessions}
                />
            ) : (
                selectedCourseId && (
                    <CourseSessions
                        courseId={selectedCourseId}
                        onSelectSession={handleSessionSelect}
                    />
                )
            )}
        </div>
    );
};

export default Attendance;

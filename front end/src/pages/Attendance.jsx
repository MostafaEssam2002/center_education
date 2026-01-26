import { useState, useEffect } from 'react';
import { courseAPI } from '../services/api';
import CourseSessions from '../components/attendance/CourseSessions';
import SessionAttendance from '../components/attendance/SessionAttendance';

const Attendance = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedSession, setSelectedSession] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch all courses for the dropdown
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
        <div className="container mt-4">
            <h2 className="mb-4 text-center" style={{ color: '#4a5568' }}>إدارة الحضور والغياب</h2>

            {!selectedSession && (
                <div className="card mb-4 p-3" style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <div className="form-group">
                        <label htmlFor="courseSelect" className="form-label fw-bold">اختر الكورس:</label>
                        <select
                            id="courseSelect"
                            className="form-select form-control"
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            style={{ fontSize: '1.1em' }}
                        >
                            <option value="">-- اختر كورس --</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>
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

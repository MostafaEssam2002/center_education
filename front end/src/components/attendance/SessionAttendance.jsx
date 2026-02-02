import { useState, useEffect } from 'react';
import { attendanceAPI, enrollmentAPI } from '../../services/api';

const SessionAttendance = ({ session, onBack }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Fetch enrolled students and their current attendance status
    const fetchData = async () => {
        try {
            setLoading(true);
            // 1. Get all students enrolled in the course
            const enrolledRes = await enrollmentAPI.getStudentsByCourse(session.courseId);
            const enrolledStudents = enrolledRes.data.map(item => item.user);

            console.log('Fetching Data...', { session, enrolledStudents });
            // 2. Get existing attendance for this session
            const attendanceRes = await attendanceAPI.getSessionAttendance(session.id);
            console.log('Attendance Response:', attendanceRes.data);

            const existingAttendance = {};
            attendanceRes.data.forEach(record => {
                existingAttendance[record.studentId] = record.status;
            });
            console.log('Existing Attendance Map:', existingAttendance);

            // 3. Merge data
            const mergedData = enrolledStudents.map(student => ({
                ...student,
                // But here we want explicit control.
                // Let's use existing status OR 'ABSENT' as default VISUAL state if nothing exists.
                status: existingAttendance[student.id] || 'ABSENT'
            }));
            console.log('Merged Data:', mergedData);

            setStudents(mergedData);
        } catch (error) {
            console.error('Failed to load attendance data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchData();
        }
    }, [session]);

    const handleStatusChange = (studentId, newStatus) => {
        setStudents(prev => prev.map(s =>
            s.id === studentId ? { ...s, status: newStatus } : s
        ));
    };

    const [studentIdInput, setStudentIdInput] = useState('');

    const calculateStatus = () => {
        const now = new Date();
        const sessionDate = new Date(session.date);

        // Parse start/end times (assumed format "HH:MM")
        const [startH, startM] = session.startTime.split(':').map(Number);
        const [endH, endM] = session.endTime.split(':').map(Number);

        const sessionStart = new Date(sessionDate);
        sessionStart.setHours(startH, startM, 0);

        const sessionEnd = new Date(sessionDate);
        sessionEnd.setHours(endH, endM, 0);

        // Check if student is within the session time
        // If current time < start time -> PRESENT (Arrived early/on time)
        // If current time > start time AND < end time -> LATE
        // If current time > end time -> ABSENT (Technically too late, but we could mark LATE too if desired. Let's stick to LATE for anytime during session)

        // User Request Logic:
        // Between Start and End -> PRESENT
        // After End -> LATE (until "lecture finishes" - assuming indefinite late window or explicit Absent closing later)

        // If we are before or during the session window:
        if (now <= sessionEnd) return 'PRESENT';

        // If after the session end time:
        return 'LATE';
    };

    const handlescan = (e) => {
        e.preventDefault();
        if (!studentIdInput) return;

        const targetId = parseInt(studentIdInput);
        const studentExists = students.find(s => s.id === targetId);

        if (studentExists) {
            const newStatus = calculateStatus();
            handleStatusChange(targetId, newStatus);
            setStudentIdInput('');
            // Optional: Play sound or show toast
        } else {
            alert('طالب غير موجود في هذا الكورس');
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const studentsToSave = students.map(s => ({
                studentId: s.id,
                status: s.status
            }));

            console.log('Saving attendance for students:', studentsToSave);

            await attendanceAPI.markBulkAttendance(session.id, studentsToSave);
            alert('تم حفظ الحضور بنجاح');
            onBack(); // Go back to sessions list
        } catch (error) {
            console.error('Failed to save attendance:', error);
            alert('حدث خطأ أثناء حفظ الحضور');
        } finally {
            setSaving(false);
        }
    };

    if (!session) return null;

    return (
        <div className="session-attendance-container" style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <button onClick={onBack} className="btn btn-secondary btn-sm" style={{ marginBottom: '10px' }}>&larr; عودة للجلسات</button>
                    <h3>تسجيل الحضور: {new Date(session.date).toLocaleDateString('ar-EG')}</h3>
                </div>
                <button
                    className="btn btn-success"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
            </div>

            {/* Quick Add By ID */}
            <div className="card p-3 mb-3 bg-light">
                <form onSubmit={handlescan} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ fontWeight: 'bold' }}>بحث برقم الطالب:</label>
                    <input
                        type="number"
                        className="form-control"
                        style={{ maxWidth: '200px' }}
                        placeholder="أدخل ID الطالب"
                        value={studentIdInput}
                        onChange={(e) => setStudentIdInput(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" className="btn btn-primary">تسجيل</button>
                    <small className="text-muted ms-2">سيتم تحديد الحالة (حاضر/متأخر) تلقائياً بناءً على الوقت الحالي.</small>
                </form>
            </div>

            {loading ? (
                <p>جاري تحميل قائمة الطلاب...</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>اسم الطالب</th>
                                <th className="text-center">حاضر (Present)</th>
                                <th className="text-center">متأخر (Late)</th>
                                <th className="text-center">غائب (Absent)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student.id}>
                                    <td>{student.id}</td>
                                    <td>{student.first_name} {student.last_name}</td>
                                    <td className="text-center">
                                        <input
                                            type="radio"
                                            name={`status-${student.id}`}
                                            checked={student.status === 'PRESENT'}
                                            onChange={() => handleStatusChange(student.id, 'PRESENT')}
                                            style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                                        />
                                    </td>
                                    <td className="text-center">
                                        <input
                                            type="radio"
                                            name={`status-${student.id}`}
                                            checked={student.status === 'LATE'}
                                            onChange={() => handleStatusChange(student.id, 'LATE')}
                                            style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                                        />
                                    </td>
                                    <td className="text-center">
                                        <input
                                            type="radio"
                                            name={`status-${student.id}`}
                                            checked={student.status === 'ABSENT'}
                                            onChange={() => handleStatusChange(student.id, 'ABSENT')}
                                            style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SessionAttendance;

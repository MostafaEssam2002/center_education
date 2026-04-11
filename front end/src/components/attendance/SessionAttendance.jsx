import { useState, useEffect } from 'react';
import { attendanceAPI, enrollmentAPI } from '../../services/api';
import Swal from 'sweetalert2';

const SessionAttendance = ({ session, onBack }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [studentIdInput, setStudentIdInput] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const enrolledRes = await enrollmentAPI.getStudentsByCourse(session.courseId);
            const enrolledStudents = enrolledRes.data.map(item => item.user);

            const attendanceRes = await attendanceAPI.getSessionAttendance(session.id);

            const existingAttendance = {};
            attendanceRes.data.forEach(record => {
                existingAttendance[record.studentId] = record.status;
            });

            const mergedData = enrolledStudents.map(student => ({
                ...student,
                status: existingAttendance[student.id] || 'ABSENT'
            }));

            setStudents(mergedData);
        } catch (error) {
            console.error('Failed to load attendance data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) fetchData();
    }, [session]);

    const handleStatusChange = (studentId, newStatus) => {
        setStudents(prev => prev.map(s =>
            s.id === studentId ? { ...s, status: newStatus } : s
        ));
    };

    const calculateStatus = () => {
        const now = new Date();
        const sessionDate = new Date(session.date);
        const [startH, startM] = session.startTime.split(':').map(Number);
        const [endH, endM] = session.endTime.split(':').map(Number);

        const sessionEnd = new Date(sessionDate);
        sessionEnd.setHours(endH, endM, 0);

        if (now <= sessionEnd) return 'PRESENT';
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
        } else {
            Swal.fire({
                title: 'خطأ',
                text: 'طالب غير موجود في هذا الكورس',
                icon: 'error',
                confirmButtonText: 'حسناً',
                confirmButtonColor: '#3b82f6',
                background: '#1e293b',
                color: '#f3f4f6'
            });
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const studentsToSave = students.map(s => ({
                studentId: s.id,
                status: s.status
            }));
            await attendanceAPI.markBulkAttendance(session.id, studentsToSave);
            Swal.fire({
                title: 'كتمل بنجاح',
                text: 'تم حفظ الحضور بنجاح',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                background: '#1e293b',
                color: '#f3f4f6'
            });
            onBack();
        } catch (error) {
            console.error('Failed to save attendance:', error);
            Swal.fire({
                title: 'حدث خطأ',
                text: 'حدث خطأ أثناء حفظ الحضور',
                icon: 'error',
                confirmButtonText: 'حسناً',
                confirmButtonColor: '#ef4444',
                background: '#1e293b',
                color: '#f3f4f6'
            });
        } finally {
            setSaving(false);
        }
    };

    const getStatusCount = (status) => students.filter(s => s.status === status).length;

    if (!session) return null;

    return (
        <div className="session-attendance-wrapper">
            {/* Header */}
            <div className="session-attendance-header">
                <div className="session-attendance-header-left">
                    <button onClick={onBack} className="btn-attendance btn-attendance-back">
                        <span>→</span> عودة للجلسات
                    </button>
                    <div className="session-attendance-title-group">
                        <h3 className="session-attendance-title">
                            تسجيل الحضور
                        </h3>
                        <span className="session-attendance-date">
                            📅 {new Date(session.date).toLocaleDateString('ar-EG')}
                            &nbsp;|&nbsp; ⏰ {session.startTime} - {session.endTime}
                        </span>
                    </div>
                </div>
                <button
                    className="btn-attendance btn-attendance-success"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <><span className="spinner-tiny"></span> جاري الحفظ...</>
                    ) : (
                        <><span>💾</span> حفظ التغييرات</>
                    )}
                </button>
            </div>

            {/* Stats */}
            <div className="attendance-stats-row">
                <div className="attendance-stat present">
                    <span className="stat-number">{getStatusCount('PRESENT')}</span>
                    <span className="stat-label">✅ حاضر</span>
                </div>
                <div className="attendance-stat late">
                    <span className="stat-number">{getStatusCount('LATE')}</span>
                    <span className="stat-label">⏳ متأخر</span>
                </div>
                <div className="attendance-stat absent">
                    <span className="stat-number">{getStatusCount('ABSENT')}</span>
                    <span className="stat-label">❌ غائب</span>
                </div>
                <div className="attendance-stat total">
                    <span className="stat-number">{students.length}</span>
                    <span className="stat-label">👥 الإجمالي</span>
                </div>
            </div>

            {/* Quick Scan */}
            <div className="quick-scan-card">
                <div className="quick-scan-label">
                    <span>🔍</span> بحث سريع برقم الطالب
                </div>
                <form onSubmit={handlescan} className="quick-scan-form">
                    <input
                        type="number"
                        className="form-input-modern quick-scan-input"
                        placeholder="أدخل ID الطالب"
                        value={studentIdInput}
                        onChange={(e) => setStudentIdInput(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" className="btn-attendance btn-attendance-primary">
                        <span>📌</span> تسجيل
                    </button>
                </form>
                <small className="quick-scan-hint">
                    سيتم تحديد الحالة (حاضر/متأخر) تلقائياً بناءً على الوقت الحالي.
                </small>
            </div>

            {/* Table */}
            {loading ? (
                <div className="sessions-loading">
                    <div className="loading-spinner"></div>
                    <p>جاري تحميل قائمة الطلاب...</p>
                </div>
            ) : (
                <div className="attendance-table-wrapper">
                    <table className="attendance-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>اسم الطالب</th>
                                <th className="text-center">
                                    <span className="status-header present-header">✅ حاضر</span>
                                </th>
                                <th className="text-center">
                                    <span className="status-header late-header">⏳ متأخر</span>
                                </th>
                                <th className="text-center">
                                    <span className="status-header absent-header">❌ غائب</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student.id} className={`attendance-row attendance-row-${student.status.toLowerCase()}`}>
                                    <td className="student-id-cell">#{student.id}</td>
                                    <td className="student-name-cell">
                                        <div className="student-avatar-mini">
                                            {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                                        </div>
                                        {student.first_name} {student.last_name}
                                    </td>
                                    <td className="text-center">
                                        <label className="attendance-radio-label radio-present">
                                            <input
                                                type="radio"
                                                name={`status-${student.id}`}
                                                checked={student.status === 'PRESENT'}
                                                onChange={() => handleStatusChange(student.id, 'PRESENT')}
                                            />
                                            <span className="radio-custom"></span>
                                        </label>
                                    </td>
                                    <td className="text-center">
                                        <label className="attendance-radio-label radio-late">
                                            <input
                                                type="radio"
                                                name={`status-${student.id}`}
                                                checked={student.status === 'LATE'}
                                                onChange={() => handleStatusChange(student.id, 'LATE')}
                                            />
                                            <span className="radio-custom"></span>
                                        </label>
                                    </td>
                                    <td className="text-center">
                                        <label className="attendance-radio-label radio-absent">
                                            <input
                                                type="radio"
                                                name={`status-${student.id}`}
                                                checked={student.status === 'ABSENT'}
                                                onChange={() => handleStatusChange(student.id, 'ABSENT')}
                                            />
                                            <span className="radio-custom"></span>
                                        </label>
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

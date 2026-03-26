import { useState, useEffect } from 'react';
import { attendanceAPI, courseAPI, roomAPI } from '../../services/api';
import Swal from 'sweetalert2';

const CourseSessions = ({ courseId, onSelectSession }) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [newSessionData, setNewSessionData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        roomId: '',
    });

    const fetchSessions = async () => {
        if (!courseId) return;
        try {
            setLoading(true);
            const res = await attendanceAPI.getCourseSessions(courseId);
            setSessions(res.data);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRooms = async () => {
        try {
            const res = await roomAPI.findAll(1, 100);
            setRooms(res.data.data || res.data);
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
        }
    };

    useEffect(() => {
        fetchSessions();
        fetchRooms();
    }, [courseId]);

    const handleCreateSession = async (e) => {
        e.preventDefault();
        try {
            await attendanceAPI.createSession({
                ...newSessionData,
                courseId: parseInt(courseId),
                roomId: parseInt(newSessionData.roomId)
            });
            setShowCreateForm(false);
            setNewSessionData({ date: '', startTime: '', endTime: '', roomId: '' });
            fetchSessions();
            Swal.fire({
                title: 'تأكيد',
                text: 'تم إنشاء الجلسة بنجاح',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                background: '#1e293b',
                color: '#f3f4f6'
            });
        } catch (error) {
            console.error('Failed to create session:', error);
            Swal.fire({
                title: 'خطأ',
                text: 'فشل في إنشاء الجلسة',
                icon: 'error',
                confirmButtonText: 'حسناً',
                confirmButtonColor: '#ef4444',
                background: '#1e293b',
                color: '#f3f4f6'
            });
        }
    };

    if (!courseId) return <div className="attendance-empty-state">الرجاء اختيار كورس لعرض الجلسات</div>;

    return (
        <div className="sessions-container">
            <div className="sessions-header">
                <div className="sessions-title-group">
                    <span className="sessions-icon">📅</span>
                    <h3 className="sessions-title">جلسات الحضور</h3>
                </div>
                <button
                    className={`btn-attendance ${showCreateForm ? 'btn-attendance-cancel' : 'btn-attendance-primary'}`}
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    {showCreateForm ? (
                        <><span>✕</span> إلغاء</>
                    ) : (
                        <><span>+</span> إضافة جلسة جديدة</>
                    )}
                </button>
            </div>

            {showCreateForm && (
                <form onSubmit={handleCreateSession} className="create-session-form">
                    <div className="form-grid-2">
                        <div className="form-group-modern">
                            <label className="form-label-modern">
                                <span className="label-icon">📆</span>
                                التاريخ
                            </label>
                            <input
                                type="date"
                                required
                                className="form-input-modern"
                                value={newSessionData.date}
                                onChange={(e) => setNewSessionData({ ...newSessionData, date: e.target.value })}
                            />
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">
                                <span className="label-icon">🏛️</span>
                                القاعة <span className="required-star">*</span>
                            </label>
                            <select
                                required
                                className="form-select-modern"
                                value={newSessionData.roomId}
                                onChange={(e) => setNewSessionData({ ...newSessionData, roomId: e.target.value })}
                            >
                                <option value="">-- اختر القاعة --</option>
                                {rooms.map(room => (
                                    <option key={room.id} value={room.id}>
                                        {room.name} ({room.type})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">
                                <span className="label-icon">⏰</span>
                                وقت البدء
                            </label>
                            <input
                                type="time"
                                required
                                className="form-input-modern"
                                value={newSessionData.startTime}
                                onChange={(e) => setNewSessionData({ ...newSessionData, startTime: e.target.value })}
                            />
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">
                                <span className="label-icon">⏱️</span>
                                وقت الانتهاء
                            </label>
                            <input
                                type="time"
                                required
                                className="form-input-modern"
                                value={newSessionData.endTime}
                                onChange={(e) => setNewSessionData({ ...newSessionData, endTime: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-attendance btn-attendance-success">
                            <span>💾</span> حفظ الجلسة
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="sessions-loading">
                    <div className="loading-spinner"></div>
                    <p>جاري التحميل...</p>
                </div>
            ) : sessions.length === 0 ? (
                <div className="attendance-empty-state">
                    <div className="empty-icon">📭</div>
                    <p>لا توجد جلسات مسجلة لهذا الكورس.</p>
                </div>
            ) : (
                <div className="sessions-list">
                    {sessions.map(session => (
                        <div
                            key={session.id}
                            className="session-card"
                            onClick={() => onSelectSession(session)}
                        >
                            <div className="session-card-left">
                                <div className="session-date-badge">
                                    <span className="session-date-icon">📅</span>
                                    <h5 className="session-date">{new Date(session.date).toLocaleDateString('ar-EG')}</h5>
                                </div>
                                <div className="session-meta">
                                    <span className="session-time">⏰ {session.startTime} - {session.endTime}</span>
                                    {session.room?.name && (
                                        <span className="session-room">🏛️ {session.room.name}</span>
                                    )}
                                </div>
                            </div>
                            <div className="session-card-right">
                                <span className="session-count-badge">
                                    👥 {session._count?.attendance || 0} طالب مسجل
                                </span>
                                <span className="session-arrow">←</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CourseSessions;

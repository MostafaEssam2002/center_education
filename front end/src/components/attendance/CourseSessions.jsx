import { useState, useEffect } from 'react';
import { attendanceAPI, courseAPI } from '../../services/api';

const CourseSessions = ({ courseId, onSelectSession }) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newSessionData, setNewSessionData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        room: '',
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

    useEffect(() => {
        fetchSessions();
    }, [courseId]);

    const handleCreateSession = async (e) => {
        e.preventDefault();
        try {
            await attendanceAPI.createSession({
                ...newSessionData,
                courseId: parseInt(courseId),
            });
            setShowCreateForm(false);
            setNewSessionData({ date: '', startTime: '', endTime: '', room: '' });
            fetchSessions(); // Refresh list
        } catch (error) {
            console.error('Failed to create session:', error);
            alert('فشل في إنشاء الجلسة');
        }
    };

    if (!courseId) return <div className="text-center p-4">الرجاء اختيار كورس لعرض الجلسات</div>;

    return (
        <div className="course-sessions-container" style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>جلسات الحضور</h3>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    {showCreateForm ? 'إلغاء' : 'إضافة جلسة جديدة'}
                </button>
            </div>

            {showCreateForm && (
                <form onSubmit={handleCreateSession} style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label>التاريخ</label>
                            <input
                                type="date"
                                required
                                className="form-control"
                                value={newSessionData.date}
                                onChange={(e) => setNewSessionData({ ...newSessionData, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>القاعة (اختياري)</label>
                            <input
                                type="text"
                                className="form-control"
                                value={newSessionData.room}
                                onChange={(e) => setNewSessionData({ ...newSessionData, room: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>وقت البدء</label>
                            <input
                                type="time"
                                required
                                className="form-control"
                                value={newSessionData.startTime}
                                onChange={(e) => setNewSessionData({ ...newSessionData, startTime: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>وقت الانتهاء</label>
                            <input
                                type="time"
                                required
                                className="form-control"
                                value={newSessionData.endTime}
                                onChange={(e) => setNewSessionData({ ...newSessionData, endTime: e.target.value })}
                            />
                        </div>
                    </div>
                    <div style={{ marginTop: '15px', textAlign: 'left' }}>
                        <button type="submit" className="btn btn-success">حفظ الجلسة</button>
                    </div>
                </form>
            )}

            {loading ? (
                <p>جاري التحميل...</p>
            ) : sessions.length === 0 ? (
                <p className="text-muted">لا توجد جلسات مسجلة لهذا الكورس.</p>
            ) : (
                <div className="list-group">
                    {sessions.map(session => (
                        <div
                            key={session.id}
                            className="list-group-item list-group-item-action"
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '15px' }}
                            onClick={() => onSelectSession(session)}
                        >
                            <div>
                                <h5 style={{ margin: 0 }}>{new Date(session.date).toLocaleDateString('ar-EG')}</h5>
                                <small className="text-muted">
                                    {session.startTime} - {session.endTime} {session.room && `| ${session.room}`}
                                </small>
                            </div>
                            <span className="badge bg-info rounded-pill">
                                {session._count?.attendance || 0} طالب مسجل
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CourseSessions;

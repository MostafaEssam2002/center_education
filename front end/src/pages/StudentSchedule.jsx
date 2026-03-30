import { useState, useEffect } from 'react';
import { courseScheduleAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const StudentSchedule = () => {
    const { user } = useAuth();
    const [scheduleItems, setScheduleItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const daysOrder = ['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI'];
    const dayNames = {
        SAT: 'السبت',
        SUN: 'الأحد',
        MON: 'الاثنين',
        TUE: 'الثلاثاء',
        WED: 'الأربعاء',
        THU: 'الخميس',
        FRI: 'الجمعة',
    };

    const timeSlots = Array.from({ length: 15 }, (_, i) => {
        const hour = i + 8;
        return `${hour.toString().padStart(2, '0')}:00`;
    });

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const response = await courseScheduleAPI.findStudentSchedule();
            setScheduleItems(response.data);
        } catch (error) {
            console.error("Error fetching schedule:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="container">جاري التحميل...</div>;

    return (
        <div className="main-content">
            <div className="card" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                <div className="card-header">
                    <h2>جدول محاضراتي ({user?.first_name || user?.email})</h2>
                </div>
                <div style={{ padding: '20px', overflowX: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: `100px repeat(${timeSlots.length}, 130px)`, gap: '5px', minWidth: 'max-content' }}>
                        {/* Header Row */}
                        <div style={{ fontWeight: 'bold', background: '#122b54', color: '#f1f6ff', padding: '10px', borderRadius: '5px' }}>اليوم / الساعة</div>
                        {timeSlots.map(time => (
                            <div key={time} style={{ background: '#203f72', color: '#ecf4ff', padding: '10px', textAlign: 'center', borderRadius: '5px' }}>{time}</div>
                        ))}

                        {/* Rows */}
                        {daysOrder.map(day => (
                            <div key={day} style={{ display: 'contents' }}>
                                <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', background: '#122b54', color: '#f1f6ff', padding: '10px', borderRadius: '5px' }}>{dayNames[day]}</div>
                                {timeSlots.map(time => {
                                    const item = scheduleItems.find(i => i.day === day && i.startTime === time);
                                    return (
                                        <div
                                            key={`${day}-${time}`}
                                            style={{
                                                background: item ? '#e6fffa' : '#173A6E',
                                                border: '1px solid #2F4C7E',
                                                minHeight: '80px',
                                                borderRadius: '8px',
                                                padding: '5px',
                                                position: 'relative'
                                            }}
                                        >
                                            {item && (
                                                <div
                                                    style={{
                                                        background: '#667eea',
                                                        color: 'white',
                                                        height: '100%',
                                                        borderRadius: '6px',
                                                        padding: '10px',
                                                        fontSize: '0.9em',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{item.course?.title}</div>
                                                    <div style={{ fontSize: '0.85em', opacity: 0.9 }}>📍 {item.room || 'أونلاين'}</div>
                                                    <div style={{ fontSize: '0.85em', opacity: 0.9 }}>🕒 {item.startTime} - {item.endTime}</div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="card-footer" style={{ textAlign: 'center', color: '#666', fontSize: '0.9em' }}>
                    * هذا الجدول مخصص فقط للكورسات التي تشترك بها حالياً.
                </div>
            </div>
        </div>
    );
};

export default StudentSchedule;

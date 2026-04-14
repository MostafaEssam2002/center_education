import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomAPI, courseScheduleAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2'; 

const RoomManagement = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'ADMIN';
    const isAdminOrEmployee = user?.role === 'ADMIN' || user?.role === 'EMPLOYEE';

    // State
    const [rooms, setRooms] = useState([]);
    const [scheduleItems, setScheduleItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState('SAT');
    const [selectedRoom, setSelectedRoom] = useState(null); // For employee view
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Constants
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
        console.log('RoomManagement component mounted');
        fetchData();
    }, []);

    useEffect(() => {
        console.log('Rooms data updated:', rooms);
    }, [rooms]);

    const fetchData = async (page = currentPage) => {
        try {
            setLoading(true);
            const [roomsRes, scheduleRes] = await Promise.allSettled([
                roomAPI.findAll(page),
                courseScheduleAPI.findWeeklySchedule()
            ]);

            if (roomsRes.status === 'fulfilled') {
                const data = roomsRes.value.data;
                if (Array.isArray(data)) {
                    setRooms(data);
                } else if (data.data && Array.isArray(data.data)) {
                    setRooms(data.data);
                    if (data.pagination) {
                        setPagination(data.pagination);
                    }
                } else {
                    console.error("Unexpected response format:", data);
                    setRooms([]);
                }
            } else {
                console.error("Error fetching rooms:", roomsRes.reason);
                setRooms([]);
            }

            if (scheduleRes.status === 'fulfilled') {
                const scheduleData = scheduleRes.value.data;
                setScheduleItems(Array.isArray(scheduleData) ? scheduleData : []);
            } else {
                console.error("Error fetching schedule:", scheduleRes.reason);
                setScheduleItems([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setRooms([]);
            setScheduleItems([]);
        } finally {
            setLoading(false);
        }
    };



    const handleDeleteClick = (room) => {
        Swal.fire({
            title: 'تأكيد الحذف',
            text: `هل تريد حقاً حذف الغرفة "${room.name}"؟`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f56565',
            cancelButtonColor: '#718096',
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء'
        }).then(result => {
            if (result.isConfirmed) {
                handleDeleteConfirm(room.id);
            }
        });
    };

    const handleDeleteConfirm = async (roomId) => {
        // Add delete implementation when API endpoint is ready
        console.log('Delete room:', roomId);
    };

    // Get schedule items for a specific room, day, and time
    const getScheduleItem = (roomId, day, time) => {
        return scheduleItems.find(item =>
            item.roomId === roomId &&
            item.day === day &&
            item.startTime === time
        );
    };

    // Check if a time slot is covered by a course
    const isCovered = (roomId, day, time30) => {
        return scheduleItems.some(item => {
            if (item.roomId !== roomId || item.day !== day) return false;
            return item.startTime < time30 && item.endTime > time30;
        });
    };

    if (loading) {
        return (
            <div style={{ padding: '20px 40px' }}>
                <h1 style={{ color: 'var(--primary-light)', marginBottom: '20px' }}>إدارة الغرف</h1>
                <div style={{
                    background: '#1f2937',
                    borderRadius: '15px',
                    padding: '40px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}>
                    <div style={{ fontSize: '18px', color: '#9ca3af' }}>⏳ جاري التحميل...</div>
                </div>
            </div>
        );
    }

    if (!isAdminOrEmployee) {
        return (
            <div style={{ padding: '20px 40px' }}>
                <h1 style={{ color: 'var(--primary-light)', marginBottom: '20px' }}>إدارة الغرف</h1>
                <div style={{
                    background: '#1f2937',
                    borderRadius: '15px',
                    padding: '40px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    color: '#ef4444'
                }}>
                    🔒 غير مصرح لك بالوصول لهذه الصفحة
                </div>
            </div>
        );
    }

    return (
        <div className="main-content">
            <h1 style={{ padding: '20px 20px 0', color: 'var(--primary-light)', marginBottom: '10px' }}>إدارة الغرف</h1>

            {/* Navigation Section - Admin and Employee */}
            {isAdminOrEmployee && (
                <div style={{
                    background: '#1f2937',
                    borderRadius: '15px',
                    padding: '40px',
                    marginBottom: '30px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    display: 'flex',
                    gap: '20px',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }}>
                    <button
                        onClick={() => navigate('/add-room')}
                        style={{
                            padding: '20px 40px',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                            transition: 'all 0.3s',
                            minWidth: '200px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--primary-dark)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--primary)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        ➕ إدارة الغرف
                    </button>

                    {/* <button
                        onClick={() => navigate('/room-list')}
                        style={{
                            padding: '20px 40px',
                            background: 'var(--success)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                            transition: 'all 0.3s',
                            minWidth: '200px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#059669';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--success)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        📋 عرض قائمة الغرف
                    </button> */}
                </div>
            )}



            {/* Employee View: Room List with Individual Schedule */}
            {
                !isAdmin && (
                    <div style={{
                        background: '#1f2937',
                        borderRadius: '15px',
                        padding: '25px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}>
                        {!selectedRoom ? (
                            <>
                                <h2 style={{ marginBottom: '20px', color: '#f3f4f6' }}>قائمة الغرف</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                                    {rooms.map(room => (
                                        <div
                                            key={room.id}
                                            onClick={() => setSelectedRoom(room)}
                                            style={{
                                                padding: '20px',
                                                background: '#111827',
                                                borderRadius: '12px',
                                                border: '2px solid #374151',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--primary)';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.25)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = '#374151';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#f3f4f6', marginBottom: '8px' }}>
                                                {room.name}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '12px',
                                                    background: room.type === 'ONLINE' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                                    color: room.type === 'ONLINE' ? '#60a5fa' : '#10b981',
                                                    fontSize: '0.85em'
                                                }}>
                                                    {room.type === 'ONLINE' ? 'أونلاين' : 'حضوري'}
                                                </span>
                                                {room.capacity && (
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '12px',
                                                        background: 'rgba(251, 146, 60, 0.15)',
                                                        color: '#fb923c',
                                                        fontSize: '0.85em'
                                                    }}>
                                                        السعة: {room.capacity}
                                                    </span>
                                                )}
                                            </div>
                                            {room.location && (
                                                <div style={{ marginTop: '8px', color: '#9ca3af', fontSize: '0.9em' }}>
                                                    📍 {room.location}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination Controls for Employee View */}
                                {pagination && (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '10px' }}>
                                        <button
                                            className="btn btn-secondary"
                                            disabled={currentPage === 1}
                                            onClick={() => {
                                                setCurrentPage(currentPage - 1);
                                                fetchData(currentPage - 1);
                                            }}
                                            style={{ padding: '5px 10px', cursor: 'pointer' }}
                                        >
                                            السابق
                                        </button>
                                        <span>صفحة {currentPage} من {pagination.totalPages}</span>
                                        <button
                                            className="btn btn-secondary"
                                            disabled={currentPage === pagination.totalPages}
                                            onClick={() => {
                                                setCurrentPage(currentPage + 1);
                                                fetchData(currentPage + 1);
                                            }}
                                            style={{ padding: '5px 10px', cursor: 'pointer' }}
                                        >
                                            التالي
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h2 style={{ margin: 0, color: '#f3f4f6' }}>جدول {selectedRoom.name}</h2>
                                    <button
                                        onClick={() => setSelectedRoom(null)}
                                        style={{
                                            padding: '8px 16px',
                                            background: '#374151',
                                            color: '#f3f4f6',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        ← رجوع للقائمة
                                    </button>
                                </div>

                                {/* Day Selection */}
                                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '20px' }}>
                                    {daysOrder.map(day => (
                                        <button
                                            key={day}
                                            onClick={() => setSelectedDay(day)}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '15px',
                                                border: 'none',
                                                background: selectedDay === day ? 'var(--primary)' : '#374151',
                                                color: selectedDay === day ? 'white' : '#9ca3af',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                fontSize: '14px'
                                            }}
                                        >
                                            {dayNames[day]}
                                        </button>
                                    ))}
                                </div>

                                {/* Single Room Schedule Grid */}
                                <div style={{ overflowX: 'auto', border: '1px solid #374151', borderRadius: '8px' }}>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: `repeat(${timeSlots.length * 2}, 80px)`,
                                        gap: '1px',
                                        background: '#374151'
                                    }}>
                                        {/* Time Headers */}
                                        {timeSlots.map(time => (
                                            <div key={time} style={{
                                                background: '#111827',
                                                padding: '12px',
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                borderBottom: '2px solid #374151',
                                                gridColumn: 'span 2',
                                                color: '#f3f4f6'
                                            }}>
                                                {time}
                                            </div>
                                        ))}

                                        {/* Time Slots for Selected Room */}
                                        {(() => {
                                            const rowSlots = [];
                                            for (let i = 0; i < timeSlots.length; i++) {
                                                const hour = parseInt(timeSlots[i].split(':')[0]);
                                                rowSlots.push(`${hour.toString().padStart(2, '0')}:00`);
                                                rowSlots.push(`${hour.toString().padStart(2, '0')}:30`);
                                            }

                                            return rowSlots.map(time30 => {
                                                const item = getScheduleItem(selectedRoom.id, selectedDay, time30);
                                                const covered = isCovered(selectedRoom.id, selectedDay, time30);

                                                if (covered) return null;

                                                let span = 1;
                                                if (item) {
                                                    const startMinutes = parseInt(item.startTime.split(':')[0]) * 60 + parseInt(item.startTime.split(':')[1]);
                                                    const endMinutes = parseInt(item.endTime.split(':')[0]) * 60 + parseInt(item.endTime.split(':')[1]);
                                                    const durationMinutes = endMinutes - startMinutes;
                                                    span = Math.ceil(durationMinutes / 30);
                                                }

                                                return (
                                                    <div
                                                        key={time30}
                                                        style={{
                                                            background: item ? 'rgba(59, 130, 246, 0.2)' : '#111827',
                                                            height: '80px',
                                                            padding: '8px',
                                                            gridColumn: `span ${span}`,
                                                            border: item ? '2px solid var(--primary)' : '1px dashed #4b5563',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        {item ? (
                                                            <div style={{
                                                                background: 'var(--primary)',
                                                                color: 'white',
                                                                height: '100%',
                                                                width: '100%',
                                                                borderRadius: '6px',
                                                                padding: '8px',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                justifyContent: 'center',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                            }}>
                                                                <div style={{ fontWeight: 'bold', fontSize: '0.9em', marginBottom: '4px' }}>
                                                                    {item.course?.title || 'Unknown'}
                                                                </div>
                                                                <div style={{ opacity: 0.9, fontSize: '0.8em' }}>
                                                                    {item.startTime} - {item.endTime}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span style={{ color: '#e5e7eb', fontSize: '0.8em' }}>فارغ</span>
                                                        )}
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )
            }

            {/* Admin View: Full Schedule Grid */}
            {
                isAdmin && (
                    <div style={{
                        background: '#1f2937',
                        borderRadius: '15px',
                        padding: '25px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                            <h2 style={{ margin: 0, color: '#f3f4f6' }}>جدول الغرف</h2>

                            {/* Day Selection */}
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                {daysOrder.map(day => (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDay(day)}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '15px',
                                            border: 'none',
                                            background: selectedDay === day ? 'var(--primary)' : '#edf2f7',
                                            color: selectedDay === day ? 'white' : '#4a5568',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            fontSize: '14px'
                                        }}
                                    >
                                        {dayNames[day]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto', border: '1px solid #374151', borderRadius: '8px' }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: `140px repeat(${timeSlots.length * 2}, 60px)`,
                                gap: '1px',
                                background: '#111827'
                            }}>
                                {/* Header */}
                                <div style={{
                                    fontWeight: 'bold',
                                    padding: '12px',
                                    background: '#1f2937',
                                    color: '#f3f4f6',
                                    position: 'sticky',
                                    top: 0,
                                    left: 0,
                                    zIndex: 10,
                                    borderBottom: '2px solid #374151'
                                }}>
                                    الغرفة / الوقت
                                </div>

                                {timeSlots.map(time => (
                                    <div key={time} style={{
                                        background: '#1f2937',
                                        color: '#f3f4f6',
                                        padding: '12px',
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 5,
                                        borderBottom: '2px solid #374151',
                                        gridColumn: 'span 2'
                                    }}>
                                        {time}
                                    </div>
                                ))}

                                {/* Rows */}
                                {rooms.map(room => {
                                    const rowSlots = [];
                                    for (let i = 0; i < timeSlots.length; i++) {
                                        const hour = parseInt(timeSlots[i].split(':')[0]);
                                        rowSlots.push(`${hour.toString().padStart(2, '0')}:00`);
                                        rowSlots.push(`${hour.toString().padStart(2, '0')}:30`);
                                    }

                                    return (
                                        <>
                                            <div key={room.id} style={{
                                                fontWeight: 'bold',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                padding: '10px',
                                                background: '#111827',
                                                position: 'sticky',
                                                left: 0,
                                                zIndex: 5,
                                                borderRight: '2px solid #374151'
                                            }}>
                                                <span style={{ color: '#f3f4f6' }}>{room.name}</span>
                                                <span style={{ fontSize: '0.7em', color: '#9ca3af', marginTop: '2px' }}>
                                                    {room.type === 'ONLINE' ? 'أونلاين' : 'حضوري'}
                                                </span>
                                            </div>

                                            {rowSlots.map(time30 => {
                                                const item = getScheduleItem(room.id, selectedDay, time30);
                                                const covered = isCovered(room.id, selectedDay, time30);

                                                if (covered) return null;

                                                let span = 1;
                                                if (item) {
                                                    const startMinutes = parseInt(item.startTime.split(':')[0]) * 60 + parseInt(item.startTime.split(':')[1]);
                                                    const endMinutes = parseInt(item.endTime.split(':')[0]) * 60 + parseInt(item.endTime.split(':')[1]);
                                                    const durationMinutes = endMinutes - startMinutes;
                                                    span = Math.ceil(durationMinutes / 30);
                                                }

                                                return (
                                                    <div
                                                        key={`${room.id}-${time30}`}
                                                        style={{
                                                            background: item ? 'rgba(59, 130, 246, 0.2)' : '#111827',
                                                            height: '70px',
                                                            padding: '4px',
                                                            position: 'relative',
                                                            gridColumn: `span ${span}`,
                                                            border: item ? '2px solid var(--primary)' : '1px dashed #4b5563'
                                                        }}
                                                    >
                                                        {item && (
                                                            <div style={{
                                                                background: 'var(--primary)',
                                                                color: 'white',
                                                                height: '100%',
                                                                width: '100%',
                                                                borderRadius: '6px',
                                                                padding: '4px 6px',
                                                                fontSize: '0.75em',
                                                                overflow: 'hidden',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                justifyContent: 'center',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                            }}>
                                                                <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                    {item.course?.title || 'Unknown'}
                                                                </div>
                                                                <div style={{ opacity: 0.9, fontSize: '0.9em' }}>
                                                                    {item.startTime} - {item.endTime}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )
            }

        </div>
    );
};

export default RoomManagement;

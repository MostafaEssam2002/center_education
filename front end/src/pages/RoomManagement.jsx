import { useState, useEffect } from 'react';
import { roomAPI, courseScheduleAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from '../components/ConfirmationModal';

const RoomManagement = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';
    const isAdminOrEmployee = user?.role === 'ADMIN' || user?.role === 'EMPLOYEE';

    // State
    const [rooms, setRooms] = useState([]);
    const [scheduleItems, setScheduleItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState('SAT');
    const [selectedRoom, setSelectedRoom] = useState(null); // For employee view
    const [editingRoom, setEditingRoom] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        type: 'OFFLINE',
        capacity: '',
        location: '',
        isActive: true
    });

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
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [roomsRes, scheduleRes] = await Promise.allSettled([
                roomAPI.findAll(),
                courseScheduleAPI.findWeeklySchedule()
            ]);

            if (roomsRes.status === 'fulfilled') {
                setRooms(roomsRes.value.data);
            }

            if (scheduleRes.status === 'fulfilled') {
                setScheduleItems(scheduleRes.value.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert('الرجاء إدخال اسم الغرفة');
            return;
        }

        try {
            // Prepare data with proper types
            const roomData = {
                name: formData.name.trim(),
                type: formData.type,
                capacity: formData.capacity && formData.capacity !== '' ? parseInt(formData.capacity, 10) : null,
                location: formData.location && formData.location.trim() !== '' ? formData.location.trim() : null,
                isActive: formData.isActive
            };

            console.log('Sending room data:', roomData); // Debug log

            if (editingRoom) {
                const response = await roomAPI.update(editingRoom.id, roomData);
                setRooms(prev => prev.map(r => r.id === editingRoom.id ? response.data : r));
                setEditingRoom(null);
            } else {
                const response = await roomAPI.create(roomData);
                setRooms(prev => [...prev, response.data]);
            }

            setFormData({ name: '', type: 'OFFLINE', capacity: '', location: '', isActive: true });
        } catch (error) {
            console.error("Error saving room:", error);
            console.error("Error details:", error.response?.data); // More detailed error
            alert(`فشل حفظ الغرفة: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleEdit = (room) => {
        setEditingRoom(room);
        setFormData({
            name: room.name,
            type: room.type,
            capacity: room.capacity || '',
            location: room.location || '',
            isActive: room.isActive !== undefined ? room.isActive : true
        });
    };

    const handleCancelEdit = () => {
        setEditingRoom(null);
        setFormData({ name: '', type: 'OFFLINE', capacity: '', location: '', isActive: true });
    };

    const handleDeleteClick = (room) => {
        setRoomToDelete(room);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!roomToDelete) return;

        try {
            await roomAPI.remove(roomToDelete.id);
            setRooms(prev => prev.filter(r => r.id !== roomToDelete.id));
            setShowDeleteModal(false);
            setRoomToDelete(null);
        } catch (error) {
            console.error("Error deleting room:", error);
            alert('فشل حذف الغرفة. قد تكون مرتبطة بجداول موجودة.');
        }
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

    if (loading) return <div style={{ padding: '20px' }}>جاري التحميل...</div>;

    if (!isAdminOrEmployee) {
        return <div style={{ padding: '20px' }}>غير مصرح لك بالوصول لهذه الصفحة</div>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '30px', color: '#2d3748' }}>إدارة الغرف</h1>

            {/* CRUD Section - Only for ADMIN */}
            {isAdmin && (
                <div style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '25px',
                    marginBottom: '30px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ marginBottom: '20px', color: '#4a5568' }}>
                        {editingRoom ? 'تعديل الغرفة' : 'إضافة غرفة جديدة'}
                    </h2>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'end', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1', minWidth: '200px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#4a5568' }}>
                                اسم الغرفة
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '2px solid #e2e8f0',
                                    fontSize: '16px'
                                }}
                                placeholder="مثال: قاعة A"
                            />
                        </div>

                        <div style={{ flex: '1', minWidth: '200px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#4a5568' }}>
                                النوع
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '2px solid #e2e8f0',
                                    fontSize: '16px'
                                }}
                            >
                                <option value="OFFLINE">حضوري</option>
                                <option value="ONLINE">أونلاين</option>
                            </select>
                        </div>

                        <div style={{ flex: '1', minWidth: '150px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#4a5568' }}>
                                السعة
                            </label>
                            <input
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '2px solid #e2e8f0',
                                    fontSize: '16px'
                                }}
                                placeholder="عدد الطلاب"
                                min="1"
                            />
                        </div>

                        <div style={{ flex: '1', minWidth: '200px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#4a5568' }}>
                                الموقع
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '2px solid #e2e8f0',
                                    fontSize: '16px'
                                }}
                                placeholder="مثال: الطابق الأول"
                            />
                        </div>

                        <div style={{ flex: '0 0 auto', minWidth: '150px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '28px' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                    style={{
                                        width: '18px',
                                        height: '18px',
                                        cursor: 'pointer'
                                    }}
                                />
                                <span style={{ fontWeight: 'bold', color: '#4a5568' }}>غرفة نشطة</span>
                            </label>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="submit"
                                style={{
                                    padding: '10px 25px',
                                    background: '#667eea',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                {editingRoom ? 'حفظ التعديلات' : 'إضافة'}
                            </button>

                            {editingRoom && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    style={{
                                        padding: '10px 25px',
                                        background: '#e2e8f0',
                                        color: '#4a5568',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    إلغاء
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Rooms Table */}
                    <div style={{ marginTop: '30px', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>اسم الغرفة</th>
                                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>النوع</th>
                                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>السعة</th>
                                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>الموقع</th>
                                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>الحالة</th>
                                    {isAdmin && (
                                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>الإجراءات</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.map(room => (
                                    <tr key={room.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '12px' }}>{room.name}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                background: room.type === 'ONLINE' ? '#ebf8ff' : '#f0fff4',
                                                color: room.type === 'ONLINE' ? '#2c5282' : '#22543d',
                                                fontSize: '14px'
                                            }}>
                                                {room.type === 'ONLINE' ? 'أونلاين' : 'حضوري'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px' }}>{room.capacity || '-'}</td>
                                        <td style={{ padding: '12px' }}>{room.location || '-'}</td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                background: room.isActive ? '#c6f6d5' : '#fed7d7',
                                                color: room.isActive ? '#22543d' : '#742a2a',
                                                fontSize: '14px',
                                                fontWeight: 'bold'
                                            }}>
                                                {room.isActive ? 'نشطة' : 'غير نشطة'}
                                            </span>
                                        </td>
                                        {isAdmin && (
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => handleEdit(room)}
                                                    style={{
                                                        padding: '6px 15px',
                                                        background: '#4299e1',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        marginLeft: '8px',
                                                        cursor: 'pointer',
                                                        fontSize: '14px'
                                                    }}
                                                >
                                                    تعديل
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(room)}
                                                    style={{
                                                        padding: '6px 15px',
                                                        background: '#f56565',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '14px'
                                                    }}
                                                >
                                                    حذف
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                {rooms.length === 0 && (
                                    <tr>
                                        <td colSpan={isAdmin ? "6" : "5"} style={{ padding: '20px', textAlign: 'center', color: '#718096' }}>
                                            لا توجد غرف حالياً
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Employee View: Room List with Individual Schedule */}
            {!isAdmin && (
                <div style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '25px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    {!selectedRoom ? (
                        <>
                            <h2 style={{ marginBottom: '20px', color: '#4a5568' }}>قائمة الغرف</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                                {rooms.map(room => (
                                    <div
                                        key={room.id}
                                        onClick={() => setSelectedRoom(room)}
                                        style={{
                                            padding: '20px',
                                            background: '#f7fafc',
                                            borderRadius: '12px',
                                            border: '2px solid #e2e8f0',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#667eea';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#2d3748', marginBottom: '8px' }}>
                                            {room.name}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                background: room.type === 'ONLINE' ? '#ebf8ff' : '#f0fff4',
                                                color: room.type === 'ONLINE' ? '#2c5282' : '#22543d',
                                                fontSize: '0.85em'
                                            }}>
                                                {room.type === 'ONLINE' ? 'أونلاين' : 'حضوري'}
                                            </span>
                                            {room.capacity && (
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '12px',
                                                    background: '#fef5e7',
                                                    color: '#7c4a00',
                                                    fontSize: '0.85em'
                                                }}>
                                                    السعة: {room.capacity}
                                                </span>
                                            )}
                                        </div>
                                        {room.location && (
                                            <div style={{ marginTop: '8px', color: '#718096', fontSize: '0.9em' }}>
                                                📍 {room.location}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ margin: 0, color: '#4a5568' }}>جدول {selectedRoom.name}</h2>
                                <button
                                    onClick={() => setSelectedRoom(null)}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#e2e8f0',
                                        color: '#4a5568',
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
                                            background: selectedDay === day ? '#667eea' : '#edf2f7',
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

                            {/* Single Room Schedule Grid */}
                            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${timeSlots.length * 2}, 80px)`,
                                    gap: '1px',
                                    background: '#e2e8f0'
                                }}>
                                    {/* Time Headers */}
                                    {timeSlots.map(time => (
                                        <div key={time} style={{
                                            background: '#f7fafc',
                                            padding: '12px',
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            borderBottom: '2px solid #cbd5e0',
                                            gridColumn: 'span 2'
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
                                                        background: item ? '#ebf8ff' : '#fff',
                                                        height: '80px',
                                                        padding: '8px',
                                                        gridColumn: `span ${span}`,
                                                        border: item ? '2px solid #4299e1' : 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    {item ? (
                                                        <div style={{
                                                            background: '#4299e1',
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
                                                        <span style={{ color: '#cbd5e0', fontSize: '0.8em' }}>فارغ</span>
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
            )}

            {/* Admin View: Full Schedule Grid */}
            {isAdmin && (
                <div style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '25px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                        <h2 style={{ margin: 0, color: '#4a5568' }}>جدول الغرف</h2>

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
                                        background: selectedDay === day ? '#667eea' : '#edf2f7',
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

                    <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: `140px repeat(${timeSlots.length * 2}, 60px)`,
                            gap: '1px',
                            background: '#e2e8f0'
                        }}>
                            {/* Header */}
                            <div style={{
                                fontWeight: 'bold',
                                padding: '12px',
                                background: '#f7fafc',
                                position: 'sticky',
                                top: 0,
                                left: 0,
                                zIndex: 10,
                                borderBottom: '2px solid #cbd5e0'
                            }}>
                                الغرفة / الوقت
                            </div>

                            {timeSlots.map(time => (
                                <div key={time} style={{
                                    background: '#f7fafc',
                                    padding: '12px',
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 5,
                                    borderBottom: '2px solid #cbd5e0',
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
                                            background: '#fff',
                                            position: 'sticky',
                                            left: 0,
                                            zIndex: 5,
                                            borderRight: '2px solid #e2e8f0'
                                        }}>
                                            <span style={{ color: '#2d3748' }}>{room.name}</span>
                                            <span style={{ fontSize: '0.7em', color: '#718096', marginTop: '2px' }}>
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
                                                        background: item ? '#ebf8ff' : '#fff',
                                                        height: '70px',
                                                        padding: '4px',
                                                        position: 'relative',
                                                        gridColumn: `span ${span}`,
                                                        border: item ? '2px solid #4299e1' : 'none'
                                                    }}
                                                >
                                                    {item && (
                                                        <div style={{
                                                            background: '#4299e1',
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
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setRoomToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="تأكيد الحذف"
                message={`هل أنت متأكد من حذف الغرفة "${roomToDelete?.name}"؟`}
                type="danger"
                confirmText="حذف"
                cancelText="إلغاء"
            />
        </div>
    );
};

export default RoomManagement;

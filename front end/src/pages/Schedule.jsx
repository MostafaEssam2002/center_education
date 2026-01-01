import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { courseAPI, courseScheduleAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Schedule = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    // Check if user has admin or employee role (case-insensitive)
    const isAdminOrEmployee = user?.role === 'ADMIN' || user?.role === 'EMPLOYEE';
    const isStudent = user?.role === 'STUDENT';

    // Data State
    const [courses, setCourses] = useState([]);
    const [scheduleItems, setScheduleItems] = useState([]);
    const [loading, setLoading] = useState(true);

    if (isStudent) {
        return <Navigate to="/student-schedule" replace />;
    }
    // Removed saving, newItems, deletedIds states as we auto-save now

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

    // Time Slots: 8 AM to 10 PM (22:00)
    const timeSlots = Array.from({ length: 15 }, (_, i) => {
        const hour = i + 8;
        return `${hour.toString().padStart(2, '0')}:00`;
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [coursesRes, scheduleRes] = await Promise.all([
                courseAPI.findAll(),
                courseScheduleAPI.findWeeklySchedule()
            ]);
            setCourses(coursesRes.data);
            setScheduleItems(scheduleRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            // Handle error ui
        } finally {
            setLoading(false);
        }
    };

    // Drag Handlers
    const handleDragStart = (e, course) => {
        e.dataTransfer.setData('courseId', course.id);
        e.dataTransfer.setData('courseTitle', course.title);
        e.dataTransfer.setData('type', 'new');
    };

    const handleExistingDragStart = (e, item) => {
        e.dataTransfer.setData('itemId', item.id);
        e.dataTransfer.setData('type', 'move');
    };

    const handleDrop = async (e, day, time) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent bubbling to container (which handles deletion)
        const type = e.dataTransfer.getData('type');

        if (type === 'new') {
            const courseId = parseInt(e.dataTransfer.getData('courseId'));
            // Validate Overlap locally
            if (isOverlapping(day, time, null)) {
                alert('يوجد تعارض في هذا الموعد!');
                return;
            }

            try {
                const newItemPayload = {
                    courseId: courseId,
                    day: day,
                    startTime: time,
                    endTime: getEndTime(time),
                    room: 'Online' // Default or ask
                };

                const response = await courseScheduleAPI.create(newItemPayload);
                setScheduleItems(prev => [...prev, response.data]);
            } catch (error) {
                console.error("Failed to add schedule:", error);
                alert("فشل إضافة الموعد. تأكد من عدم وجود تعارض.");
            }

        } else if (type === 'move') {
            // Handle moving existing item
            const itemId = parseInt(e.dataTransfer.getData('itemId'));

            // Find item in state
            const item = scheduleItems.find(i => i.id === itemId);
            if (!item) return;

            // Validate
            if (isOverlapping(day, time, item)) {
                alert('يوجد تعارض في هذا الموعد!');
                return;
            }

            // Optimistic update (or wait for server) - Let's wait for server for cleaner error handling
            // Update item
            try {
                const updatedItemPayload = {
                    day,
                    startTime: time,
                    endTime: getEndTime(time)
                };

                const response = await courseScheduleAPI.update(itemId, updatedItemPayload);

                // Update local state with server response to ensure sync
                setScheduleItems(prev => prev.map(i => i.id === itemId ? response.data : i));

            } catch (error) {
                console.error("Failed to update schedule:", error);
                alert("فشل تعديل الموعد. تأكد من عدم وجود تعارض.");
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const getEndTime = (startTime) => {
        const [hour, min] = startTime.split(':').map(Number);
        const endHour = hour + 1;
        return `${endHour.toString().padStart(2, '0')}:00`;
    };

    const isOverlapping = (day, startTime, currentItem) => {
        // Simple check: Is there any item on this day/time?
        // Excluding the current item if we are moving it.
        return scheduleItems.some(item => {
            if (currentItem && item.id === currentItem.id) return false;
            return item.day === day && item.startTime === startTime;
        });
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`هل أنت متأكد من حذف موعد ${item.course.title}؟`)) return;

        try {
            await courseScheduleAPI.remove(item.id);
            setScheduleItems(prev => prev.filter(i => i.id !== item.id));
        } catch (error) {
            console.error("Failed to delete schedule:", error);
            alert("فشل حذف الموعد.");
        }
    };

    const handleTrashDrop = async (e) => {
        e.preventDefault();
        if (!isAdminOrEmployee) return;

        const type = e.dataTransfer.getData('type');
        if (type === 'move') {
            const itemId = parseInt(e.dataTransfer.getData('itemId'));
            // Find item in state
            const item = scheduleItems.find(i => i.id === itemId);

            if (item) {
                // Call handleDelete (which confirms and deletes)
                handleDelete(item);
            }
        }
    };

    // Removed handleSave

    if (loading) return <div>جاري التحميل...</div>;

    return (
        <div
            style={{ display: 'flex', height: 'calc(100vh - 100px)', gap: '20px', padding: '20px' }}
            onDragOver={handleDragOver}
            onDrop={handleTrashDrop}
        >
            {/* Sidebar */}
            <div style={{ flex: 1, background: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', overflowY: 'auto' }}>
                <h3 style={{ borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>الكورسات المتاحة</h3>
                <p style={{ fontSize: '0.9em', color: '#777' }}>
                    اسحب الكورس وأفلته في الجدول.
                    <br />
                    <span style={{ color: '#e53e3e', fontSize: '0.9em' }}>* لإلغاء موعد، اسحبه خارج الجدول.</span>
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                    {courses.map(course => (
                        <div
                            key={course.id}
                            draggable={isAdminOrEmployee}
                            onDragStart={(e) => handleDragStart(e, course)}
                            style={{
                                padding: '15px',
                                background: '#f8f9fa',
                                border: '1px solid #ddd',
                                borderRadius: '10px',
                                cursor: isAdminOrEmployee ? 'grab' : 'default',
                                transition: 'transform 0.2s',
                                fontWeight: 'bold',
                                color: '#2d3748'
                            }}
                            onMouseEnter={e => isAdminOrEmployee && (e.currentTarget.style.transform = 'scale(1.02)')}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {course.title}
                        </div>
                    ))}
                </div>
            </div>

            {/* Grid Area */}
            <div style={{ flex: 3, overflow: 'auto', background: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2>الجدول الدراسي</h2>
                    {/* Removed Save Button */}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: `100px repeat(${timeSlots.length}, 120px)`, gap: '5px' }}>
                    {/* Header Row */}
                    <div style={{ fontWeight: 'bold' }}>اليوم / الساعة</div>
                    {timeSlots.map(time => (
                        <div key={time} style={{ background: '#f0f0f0', padding: '10px', textAlign: 'center', borderRadius: '5px' }}>{time}</div>
                    ))}

                    {/* Rows */}
                    {daysOrder.map(day => (
                        <>
                            <div key={day} style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>{dayNames[day]}</div>
                            {timeSlots.map(time => {
                                const item = scheduleItems.find(i => i.day === day && i.startTime === time);
                                return (
                                    <div
                                        key={`${day}-${time}`}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => isAdminOrEmployee && handleDrop(e, day, time)}
                                        style={{
                                            background: item ? '#e6fffa' : '#fafafa',
                                            border: '1px solid #eee',
                                            height: '80px',
                                            borderRadius: '8px',
                                            padding: '5px',
                                            position: 'relative'
                                        }}
                                    >
                                        {item && (
                                            <div
                                                draggable={isAdminOrEmployee}
                                                onDragStart={(e) => handleExistingDragStart(e, item)}
                                                style={{
                                                    background: '#667eea',
                                                    color: 'white',
                                                    height: '100%',
                                                    borderRadius: '6px',
                                                    padding: '5px',
                                                    fontSize: '0.8em',
                                                    cursor: isAdminOrEmployee ? 'grab' : 'default',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {isAdminOrEmployee && (
                                                    <span
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // prevent drag start if overlapping
                                                            handleDelete(item);
                                                        }}
                                                        style={{ position: 'absolute', top: '2px', left: '2px', cursor: 'pointer', color: '#ffcccc', zIndex: 10 }}
                                                    >x</span>
                                                )}
                                                <div>{item.course?.title || 'Unknown'}</div>
                                                <div>{item.room}</div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Schedule;

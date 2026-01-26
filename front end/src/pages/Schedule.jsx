import { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { courseAPI, courseScheduleAPI, roomAPI } from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';
import { useAuth } from '../context/AuthContext';

const Schedule = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    // Check if user has admin or employee role (case-insensitive)
    const isAdminOrEmployee = user?.role === 'ADMIN' || user?.role === 'EMPLOYEE';
    const isStudent = user?.role === 'STUDENT';

    // Responsiveness
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    // Data State
    const [courses, setCourses] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [scheduleItems, setScheduleItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [pendingSchedule, setPendingSchedule] = useState(null);
    const [selectedDay, setSelectedDay] = useState('SAT');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Resizing State
    const [isResizing, setIsResizing] = useState(false);
    const resizingItemRef = useRef(null); // Use ref to track item being resized without re-renders loop

    if (isStudent) {
        return <Navigate to="/student-schedule" replace />;
    }

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
            const [coursesRes, scheduleRes, roomsRes] = await Promise.allSettled([
                courseAPI.findAll(1, 1000),
                courseScheduleAPI.findWeeklySchedule(),
                roomAPI.findAll(1, 1000)
            ]);

            if (coursesRes.status === 'fulfilled') {
                const data = coursesRes.value.data.data || coursesRes.value.data;
                setCourses(data);
            }

            if (scheduleRes.status === 'fulfilled') {
                setScheduleItems(scheduleRes.value.data);
            }

            if (roomsRes.status === 'fulfilled') {
                const data = roomsRes.value.data.data || roomsRes.value.data;
                setRooms(data);
            } else {
                setRooms([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
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

    const handleDrop = async (e, roomId, time) => {
        e.preventDefault();
        e.stopPropagation();
        const type = e.dataTransfer.getData('type');

        if (type === 'new') {
            const courseId = parseInt(e.dataTransfer.getData('courseId'));

            if (isOverlapping(selectedDay, time, roomId, null)) {
                alert('يوجد تعارض في هذا الموعد!');
                return;
            }

            try {
                const newItemPayload = {
                    courseId: courseId,
                    day: selectedDay,
                    startTime: time,
                    endTime: getEndTime(time),
                    roomId: roomId
                };

                const response = await courseScheduleAPI.create(newItemPayload);
                setScheduleItems(prev => [...prev, response.data]);
            } catch (error) {
                console.error("Failed to add schedule:", error);
                alert("فشل إضافة الموعد. تأكد من عدم وجود تعارض.");
            }

        } else if (type === 'move') {
            const itemId = parseInt(e.dataTransfer.getData('itemId'));
            const item = scheduleItems.find(i => i.id === itemId);
            if (!item) return;

            if (isOverlapping(selectedDay, time, roomId, item)) {
                alert('يوجد تعارض في هذا الموعد!');
                return;
            }

            try {
                // Calculate new end time based on original duration
                const startMin = parseInt(item.startTime.split(':')[0]) * 60 + parseInt(item.startTime.split(':')[1]);
                const endMin = parseInt(item.endTime.split(':')[0]) * 60 + parseInt(item.endTime.split(':')[1]);
                const duration = endMin - startMin; // minutes

                const newStartMin = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
                const newEndMin = newStartMin + duration;

                const endHour = Math.floor(newEndMin / 60);
                const endRelMin = newEndMin % 60;
                const newEndTime = `${endHour.toString().padStart(2, '0')}:${endRelMin.toString().padStart(2, '0')}`;

                const updatedItemPayload = {
                    day: selectedDay,
                    startTime: time,
                    endTime: newEndTime,
                    roomId: roomId
                };

                const response = await courseScheduleAPI.update(itemId, updatedItemPayload);
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

    // --- REZISING LOGIC ---
    const handleResizeStart = (e, item) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAdminOrEmployee) return;

        setIsResizing(true);
        resizingItemRef.current = item;
    };

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e) => {
            if (!resizingItemRef.current) return;

            const gridContainer = document.querySelector('.schedule-grid-container');
            if (!gridContainer) return;

            const gridRect = gridContainer.getBoundingClientRect();
            // gridRect.left is the start of the sticky header column (140px width)
            // relativeX calculation:
            // e.clientX is global mouse X.
            // gridRect.left is global container left.
            // scrollLeft needs to be accounted for IF the container scrolls? 
            // Actually, if we use e.clientX inside the container, getBoundingClientRect accounts for viewport.
            // But if the container has internal scroll, the "content" moves.
            // Best way: find the slot element under mouse? OR calculate purely by geometry if we know scroll.

            // Simpler Geometry approach assuming standard layout:
            // X position relative to the Start of Time Columns (after 140px header)
            // The 140px header is STICKY, so it stays on left.
            // BUT the content scrolls.
            // Let's rely on calculating offset from the row start? No, row is long.

            // Let's use simpler logic:
            // Calculate pixel distance from the START of the item's original position?
            // No, we want absolute snap to grid.

            // Let's Try: Calculate index based on container scroll
            // RTL Logic
            const distFromRight = gridRect.right - e.clientX;
            const scrollOffset = Math.abs(gridContainer.scrollLeft);
            const totalDist = distFromRight + scrollOffset;
            const relativeX = totalDist - 140;

            let slotIndex = Math.floor(relativeX / 60); // 60px per slot
            slotIndex = Math.max(0, slotIndex);

            // Start time details (Fixed)
            const [startH, startM] = resizingItemRef.current.startTime.split(':').map(Number);
            const startSlotIndex = (startH - 8) * 2 + (startM === 30 ? 1 : 0);

            // New End Slot must be > Start Slot
            let newEndSlotIndex = Math.max(startSlotIndex + 1, slotIndex + 1);
            newEndSlotIndex = Math.min(newEndSlotIndex, 30); // Max 15 hours * 2

            // Convert back to time
            const totalStartMinutes = 8 * 60;
            const endMinutes = totalStartMinutes + (newEndSlotIndex * 30);
            const endHour = Math.floor(endMinutes / 60);
            const endRelMin = endMinutes % 60;
            const newEndTime = `${endHour.toString().padStart(2, '0')}:${endRelMin.toString().padStart(2, '0')}`;

            if (newEndTime !== resizingItemRef.current.endTime) {
                // Update local state "optimistically" for UI feedback
                // We update 'scheduleItems' directly to show the stretch
                // We effectively "mutate" the item in the list for display
                // But we must check overlap first to assume valid move?
                // Or we allow invalid visual, but reject on drop? 
                // Better UI: Show red if invalid? 
                // For simplicity: Just update if no overlap.

                const potentialItem = { ...resizingItemRef.current, endTime: newEndTime };

                // Helper to check overlap excluding self
                const hasOverlap = scheduleItems.some(i => {
                    if (i.id === potentialItem.id) return false;
                    if (i.day !== potentialItem.day || i.roomId !== potentialItem.roomId) return false;
                    return potentialItem.startTime < i.endTime && potentialItem.endTime > i.startTime;
                });

                if (!hasOverlap) {
                    setScheduleItems(prev => prev.map(i =>
                        i.id === resizingItemRef.current.id ? { ...i, endTime: newEndTime } : i
                    ));
                    // Update ref too so next move compares against new state? 
                    // No, ref should keep "identity" but maybe track current values?
                    // Actually, we usually keep ref to INITIAL or CURRENT?
                    // Let's keep ref.current updated so we know where we are.
                    resizingItemRef.current = { ...resizingItemRef.current, endTime: newEndTime };
                }
            }
        };

        const handleMouseUp = async () => {
            setIsResizing(false);
            if (resizingItemRef.current) {
                try {
                    const item = resizingItemRef.current;
                    // Only call API if time actually changed? We should compare with initial?
                    // For now, safe to just update.
                    await courseScheduleAPI.update(item.id, {
                        day: item.day,
                        startTime: item.startTime,
                        endTime: item.endTime,
                        roomId: item.roomId
                    });
                } catch (error) {
                    console.error("Resize save failed", error);
                    alert("فشل حفظ التعديل");
                    // We should probably revert? fetchInitialData();
                }
                resizingItemRef.current = null;
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, scheduleItems]); // dependent on scheduleItems for overlap check


    const getEndTime = (startTime) => {
        const [hour, min] = startTime.split(':').map(Number);
        const endHour = hour + 1;
        return `${endHour.toString().padStart(2, '0')}:00`;
    };

    const isOverlapping = (day, newStartTime, roomId, currentItem) => {
        // Assume default duration is 1 hour if we're just checking a slot, 
        // BUT for a more robust check we should calculate standard end time if it's a new insertion.
        // If currentItem exists, we use its own duration if we were keeping it same, but here we are moving it.
        // Actually, the simplest check for 'dropping into a slot' is:
        // Does this NEW time range overlap with any EXISTING item?

        let newEndTime = getEndTime(newStartTime);
        if (currentItem) {
            // If we are moving an item, we might want to preserve its duration?
            // For now, let's assume dragging resets to default slot or keeps duration?
            // The user prompt implies we want to see valid durations.
            // If we just drop, we usually set start time.
            // If we want to support preserving duration of moved items:
            const startMin = parseInt(currentItem.startTime.split(':')[0]) * 60 + parseInt(currentItem.startTime.split(':')[1]);
            const endMin = parseInt(currentItem.endTime.split(':')[0]) * 60 + parseInt(currentItem.endTime.split(':')[1]);
            const duration = endMin - startMin; // minutes

            const newStartMin = parseInt(newStartTime.split(':')[0]) * 60 + parseInt(newStartTime.split(':')[1]);
            const newEndMin = newStartMin + duration;

            const endHour = Math.floor(newEndMin / 60);
            const endRelMin = newEndMin % 60;
            newEndTime = `${endHour.toString().padStart(2, '0')}:${endRelMin.toString().padStart(2, '0')}`;
        }

        return scheduleItems.some(item => {
            if (currentItem && item.id === currentItem.id) return false; // Don't check against self
            if (item.day !== day || item.roomId !== roomId) return false;

            // Check overlap: StartA < EndB && EndA > StartB
            return newStartTime < item.endTime && newEndTime > item.startTime;
        });
    };

    const handleDelete = (item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            await courseScheduleAPI.remove(itemToDelete.id);
            setScheduleItems(prev => prev.filter(i => i.id !== itemToDelete.id));
            setShowDeleteModal(false);
            setItemToDelete(null);
        } catch (error) {
            console.error("Failed to delete schedule:", error);
            alert("فشل حذف الموعد.");
            setShowDeleteModal(false);
        }
    };

    const handleRoomSelect = async (roomId) => {
        if (!pendingSchedule || !roomId) return;

        try {
            const newItemPayload = {
                ...pendingSchedule,
                roomId: parseInt(roomId)
            };

            const response = await courseScheduleAPI.create(newItemPayload);
            setScheduleItems(prev => [...prev, response.data]);
            setShowRoomModal(false);
            setPendingSchedule(null);
        } catch (error) {
            console.error("Failed to add schedule:", error);
            alert("فشل إضافة الموعد. تأكد من عدم وجود تعارض.");
        }
    };

    const handleTrashDrop = async (e) => {
        e.preventDefault();
        if (!isAdminOrEmployee) return;

        const type = e.dataTransfer.getData('type');
        if (type === 'move') {
            const itemId = parseInt(e.dataTransfer.getData('itemId'));
            const item = scheduleItems.find(i => i.id === itemId);
            if (item) {
                handleDelete(item);
            }
        }
    };

    if (loading) return <div>جاري التحميل...</div>;

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                height: isMobile ? 'auto' : 'calc(100vh - 100px)',
                gap: '20px',
                padding: '20px'
            }}
            onDragOver={handleDragOver}
            onDrop={handleTrashDrop}
            className={isResizing ? 'disable-selection' : ''}
        >
            {/* Sidebar (Courses) */}
            <div style={{
                width: isMobile ? '100%' : '260px',
                flexShrink: 0,
                background: 'white',
                borderRadius: '15px',
                padding: '20px',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                overflowY: 'auto',
                maxHeight: isMobile ? '200px' : 'none',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <h3 style={{ borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>الكورسات المتاحة</h3>
                <p style={{ fontSize: '0.85em', color: '#777', margin: '10px 0' }}>
                    اسحب الكورس وأفلته في الجدول.
                    <br />
                    <span style={{ color: '#e53e3e' }}>* لإلغاء موعد، اسحبه خارج الجدول.</span>
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                    {courses.map(course => (
                        <div
                            key={course.id}
                            draggable={isAdminOrEmployee}
                            onDragStart={(e) => handleDragStart(e, course)}
                            style={{
                                padding: '12px',
                                background: '#f8f9fa',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                cursor: isAdminOrEmployee ? 'grab' : 'default',
                                fontWeight: 'bold',
                                color: '#2d3748',
                                fontSize: '0.9em',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                        >
                            {course.title}
                        </div>
                    ))}
                </div>
            </div>

            {/* Grid Area */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: 'white',
                borderRadius: '15px',
                padding: '20px',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                minWidth: 0 // Prevents flex child from overflowing parent
            }}>
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '20px', gap: '15px' }}>
                    <h2 style={{ margin: 0 }}>الجدول الدراسي</h2>
                    {/* Day Selection Tabs */}
                    <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', maxWidth: '100%', paddingBottom: '5px' }}>
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
                                    fontSize: '0.9em',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {dayNames[day]}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="schedule-grid-container" style={{ overflow: 'auto', flex: 1, border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    {/* 
                        Grid Template:
                        - First column: 140px fixed (Room Name)
                        - Subsequent columns: 50px each (representing 30 minutes)
                        - 15 hours * 2 slots/hour = 30 slots
                    */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `140px repeat(${timeSlots.length * 2}, 60px)`, // 60px per 30 mins
                        gap: '1px',
                        background: '#e2e8f0'
                    }}>

                        {/* Header Row (Times) */}
                        <div style={{
                            fontWeight: 'bold',
                            padding: '12px',
                            background: '#f7fafc',
                            position: 'sticky',
                            top: 0,
                            left: 0,
                            zIndex: 10,
                            borderBottom: '2px solid #cbd5e0',
                            gridColumn: '1 / span 1'
                        }}>
                            الغرفة / الساعة
                        </div>
                        {timeSlots.map((time, index) => (
                            <div key={time} style={{
                                background: '#f7fafc',
                                padding: '12px',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                position: 'sticky',
                                top: 0,
                                zIndex: 5,
                                borderBottom: '2px solid #cbd5e0',
                                gridColumn: `span 2` // Each hour header spans 2 slots (2 * 30mins)
                            }}>
                                {time}
                            </div>
                        ))}

                        {/* Rows (Rooms) */}
                        {rooms.map(room => {
                            // Helper to check if a slot is occupied by a STARTING course
                            // Returns the course item if this slot matches its start time
                            const getStartingItem = (time30) => {
                                return scheduleItems.find(i =>
                                    i.day === selectedDay &&
                                    i.roomId === room.id &&
                                    i.startTime === time30
                                );
                            };

                            // Helper to check if a slot is COVERED by a course starting earlier
                            const isCovered = (time30) => {
                                return scheduleItems.some(i => {
                                    if (i.day !== selectedDay || i.roomId !== room.id) return false;
                                    // It is covered if: ItemStart < CurrentSlot AND ItemEnd > CurrentSlot
                                    return i.startTime < time30 && i.endTime > time30;
                                });
                            };

                            // Generate all 30-min slots for the row
                            const rowSlots = [];
                            for (let i = 0; i < timeSlots.length; i++) {
                                const hour = parseInt(timeSlots[i].split(':')[0]);
                                // Slot 1: HH:00
                                rowSlots.push(`${hour.toString().padStart(2, '0')}:00`);
                                // Slot 2: HH:30
                                rowSlots.push(`${hour.toString().padStart(2, '0')}:30`);
                            }

                            return (
                                <>
                                    {/* Room Name Cell (Sticky Left) */}
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
                                        const item = getStartingItem(time30);
                                        const covered = isCovered(time30);

                                        // If this slot is covered by a previous course, we DO NOT render a cell for it
                                        // providing the previous cell used grid-column span.
                                        // However, in standard CSS Grid, if we want "empty" cells to be droppable,
                                        // we must render them unless they are physically displaced by a spanning cell.
                                        // BUT, a spanning cell takes up the grid tracks. So we effectively SKIP rendering 
                                        // components for slots that are "underneath" a span.

                                        if (covered) return null;

                                        // Calculate span if item exists
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
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => isAdminOrEmployee && !item && handleDrop(e, room.id, time30)} // Only allow drop if empty
                                                style={{
                                                    background: item ? '#ebf8ff' : '#fff',
                                                    height: '70px',
                                                    padding: '4px',
                                                    position: 'relative',
                                                    transition: 'background 0.2s',
                                                    gridColumn: `span ${span}`,
                                                    zIndex: item ? 2 : 1 // Bring items to front
                                                }}
                                            >
                                                {item && (
                                                    <div
                                                        draggable={isAdminOrEmployee && !isResizing} // Disable drag while resizing
                                                        onDragStart={(e) => handleExistingDragStart(e, item)}
                                                        style={{
                                                            background: '#5a67d8',
                                                            color: 'white',
                                                            height: '100%',
                                                            width: '100%',
                                                            borderRadius: '6px',
                                                            padding: '4px 6px',
                                                            fontSize: '0.75em',
                                                            cursor: isAdminOrEmployee ? 'grab' : 'default',
                                                            overflow: 'hidden',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            justifyContent: 'center',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                            position: 'relative' // Needed for absolute positioning of handle
                                                        }}
                                                        title={`${item.course?.title} (${item.startTime} - ${item.endTime})`}
                                                    >
                                                        {isAdminOrEmployee && (
                                                            <>
                                                                <span
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDelete(item);
                                                                    }}
                                                                    style={{
                                                                        position: 'absolute',
                                                                        top: '2px',
                                                                        left: '4px',
                                                                        cursor: 'pointer',
                                                                        color: '#feb2b2',
                                                                        fontWeight: 'bold',
                                                                        fontSize: '14px',
                                                                        lineHeight: 1,
                                                                        zIndex: 20
                                                                    }}
                                                                >×</span>

                                                                {/* Resize Handle */}
                                                                <div
                                                                    onMouseDown={(e) => handleResizeStart(e, item)}
                                                                    style={{
                                                                        position: 'absolute',
                                                                        top: 0,
                                                                        left: 0,
                                                                        width: '12px',
                                                                        height: '100%',
                                                                        cursor: 'col-resize',
                                                                        zIndex: 20,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        // background: 'rgba(0,0,0,0.1)', // Optional visuals
                                                                    }}
                                                                    title="Drag to resize"
                                                                >
                                                                    <div style={{ width: '4px', height: '20px', background: 'rgba(255,255,255,0.5)', borderRadius: '2px' }}></div>
                                                                </div>
                                                            </>
                                                        )}
                                                        <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {item.course?.title || 'Unknown'}
                                                        </div>
                                                        <div style={{ opacity: 0.9 }}>{item.startTime} - {item.endTime}</div>
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

            {/* Room Selection Modal (Still kept but not triggered directly by drag anymore in this design) */}
            <ConfirmationModal
                isOpen={showRoomModal}
                onClose={() => {
                    setShowRoomModal(false);
                    setPendingSchedule(null);
                }}
                onConfirm={() => {
                    const selectedRoom = document.getElementById('room-select')?.value;
                    if (selectedRoom) {
                        handleRoomSelect(selectedRoom);
                    }
                }}
                title="اختر الغرفة"
                message={
                    <div style={{ padding: '10px' }}>
                        <label htmlFor="room-select" style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>الغرفة:</label>
                        <select
                            id="room-select"
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '2px solid #e0e0e0',
                                fontSize: '16px'
                            }}
                        >
                            <option value="">-- اختر غرفة --</option>
                            {rooms.map(room => (
                                <option key={room.id} value={room.id}>
                                    {room.name} - {room.type === 'ONLINE' ? 'أونلاين' : 'حضوري'}
                                </option>
                            ))}
                        </select>
                    </div>
                }
                type="info"
                confirmText="إضافة"
                cancelText="إلغاء"
                hideCancel={false}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="تأكيد الحذف"
                message={`هل أنت متأكد من حذف موعد "${itemToDelete?.course?.title}"؟`}
                type="danger"
                confirmText="حذف"
                cancelText="إلغاء"
            />
        </div>
    );
};

export default Schedule;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const AddRoom = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';
    const navigate = useNavigate();

    const [editingRoom, setEditingRoom] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'OFFLINE',
        capacity: '',
        location: '',
        isActive: true
    });
    const [rooms, setRooms] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'بيانات ناقصة',
                text: 'الرجاء إدخال اسم الغرفة'
            });
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

            if (editingRoom) {
                await roomAPI.update(editingRoom.id, roomData);
                Swal.fire({
                    icon: 'success',
                    title: 'تم التعديل بنجاح',
                    text: 'تم تعديل الغرفة بنجاح'
                });
            } else {
                await roomAPI.create(roomData);
                Swal.fire({
                    icon: 'success',
                    title: 'تم الإضافة بنجاح',
                    text: 'تم إضافة الغرفة بنجاح'
                });
            }

            setFormData({ name: '', type: 'OFFLINE', capacity: '', location: '', isActive: true });
            setEditingRoom(null);
        } catch (error) {
            console.error("Error saving room:", error);
            Swal.fire({
                icon: 'error',
                title: 'فشل الحفظ',
                text: error.response?.data?.message || error.message
            });
        }
    };

    const handleCancelEdit = () => {
        setEditingRoom(null);
        setFormData({ name: '', type: 'OFFLINE', capacity: '', location: '', isActive: true });
    };

    const handleEdit = (room) => {
        setEditingRoom(room);
        setFormData({
            name: room.name || '',
            type: room.type || 'OFFLINE',
            capacity: room.capacity || '',
            location: room.location || '',
            isActive: room.isActive !== undefined ? room.isActive : true
        });
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const fetchRooms = async (page = currentPage) => {
        try {
            setLoading(true);
            const response = await roomAPI.findAll(page);
            const data = response.data;
            
            if (Array.isArray(data)) {
                setRooms(data);
            } else if (data.data && Array.isArray(data.data)) {
                setRooms(data.data);
                if (data.pagination) {
                    setPagination(data.pagination);
                }
            } else {
                setRooms([]);
            }
        } catch (error) {
            console.error("Error fetching rooms:", error);
            setRooms([]);
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
        try {
            await roomAPI.delete(roomId);
            Swal.fire({
                icon: 'success',
                title: 'تم الحذف بنجاح',
                text: 'تم حذف الغرفة بنجاح'
            });
            fetchRooms();
        } catch (error) {
            console.error('Error deleting room:', error);
            Swal.fire({
                icon: 'error',
                title: 'خطأ',
                text: error.response?.data?.message || 'حدث خطأ أثناء حذف الغرفة'
            });
        }
    };

    if (!isAdmin) {
        return <div style={{ padding: '20px' }}>غير مصرح لك بالوصول لهذه الصفحة</div>;
    }

    return (
        <div className="main-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 0', marginBottom: '10px' }}>
                <h1 style={{ color: 'var(--primary-light)', margin: 0 }}>إضافة غرفة جديدة</h1>
                <button
                    onClick={() => navigate('/rooms')}
                    style={{
                        padding: '10px 20px',
                        background: '#374151',
                        color: '#f3f4f6',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    ← رجوع
                </button>
            </div>

            <div style={{
                background: '#1f2937',
                borderRadius: '15px',
                padding: '25px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
                <h2 style={{ marginBottom: '20px', color: '#f3f4f6' }}>
                    {editingRoom ? 'تعديل الغرفة' : 'إضافة غرفة جديدة'}
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'end', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1', minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#f3f4f6' }}>
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
                                border: '2px solid #374151',
                                fontSize: '16px',
                                background: '#111827',
                                color: '#f3f4f6'
                            }}
                            placeholder="مثال: قاعة A"
                        />
                    </div>

                    <div style={{ flex: '1', minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#f3f4f6' }}>
                            النوع
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '2px solid #374151',
                                fontSize: '16px',
                                background: '#111827',
                                color: '#f3f4f6'
                            }}
                        >
                            <option value="OFFLINE">حضوري</option>
                            <option value="ONLINE">أونلاين</option>
                        </select>
                    </div>

                    <div style={{ flex: '1', minWidth: '150px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#f3f4f6' }}>
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
                                border: '2px solid #374151',
                                fontSize: '16px',
                                background: '#111827',
                                color: '#f3f4f6'
                            }}
                            placeholder="عدد الطلاب"
                            min="1"
                        />
                    </div>

                    <div style={{ flex: '1', minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#f3f4f6' }}>
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
                                border: '2px solid #374151',
                                fontSize: '16px',
                                background: '#111827',
                                color: '#f3f4f6'
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
                            <span style={{ fontWeight: 'bold', color: '#f3f4f6' }}>غرفة نشطة</span>
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="submit"
                            style={{
                                padding: '10px 25px',
                                background: 'var(--primary)',
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
                                    background: '#374151',
                                    color: '#f3f4f6',
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
            </div>

            {/* Rooms Table */}
            <div style={{
                background: '#1f2937',
                borderRadius: '15px',
                padding: '25px',
                marginTop: '30px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                overflowX: 'auto'
            }}>
                <h2 style={{ marginBottom: '20px', color: '#f3f4f6' }}>قائمة الغرف</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#111827', borderBottom: '2px solid #374151' }}>
                                <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#f3f4f6' }}>اسم الغرفة</th>
                                <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#f3f4f6' }}>النوع</th>
                                <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#f3f4f6' }}>السعة</th>
                                <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#f3f4f6' }}>الموقع</th>
                                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#f3f4f6' }}>الحالة</th>
                                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#f3f4f6' }}>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map(room => (
                                <tr key={room.id} style={{ borderBottom: '1px solid #374151', background: '#111827' }}>
                                    <td style={{ padding: '12px', color: '#f3f4f6' }}>{room.name}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            background: room.type === 'ONLINE' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                            color: room.type === 'ONLINE' ? '#60a5fa' : '#10b981',
                                            fontSize: '14px'
                                        }}>
                                            {room.type === 'ONLINE' ? 'أونلاين' : 'حضوري'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', color: '#f3f4f6' }}>{room.capacity || '-'}</td>
                                    <td style={{ padding: '12px', color: '#f3f4f6' }}>{room.location || '-'}</td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            background: room.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                            color: room.isActive ? '#10b981' : '#ef4444',
                                            fontSize: '14px',
                                            fontWeight: 'bold'
                                        }}>
                                            {room.isActive ? 'نشطة' : 'غير نشطة'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleEdit(room)}
                                            style={{
                                                padding: '6px 15px',
                                                background: 'var(--primary)',
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
                                                background: 'var(--danger)',
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
                                </tr>
                            ))}
                            {rooms.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', background: '#111827' }}>
                                        لا توجد غرف حالياً
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {pagination && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '10px' }}>
                        <button
                            className="btn btn-secondary"
                            disabled={currentPage === 1}
                            onClick={() => {
                                setCurrentPage(currentPage - 1);
                                fetchRooms(currentPage - 1);
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
                                fetchRooms(currentPage + 1);
                            }}
                            style={{ padding: '5px 10px', cursor: 'pointer' }}
                        >
                            التالي
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddRoom;

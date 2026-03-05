import { useState } from 'react';
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

    if (!isAdmin) {
        return <div style={{ padding: '20px' }}>غير مصرح لك بالوصول لهذه الصفحة</div>;
    }

    return (
        <div className="main-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 0', marginBottom: '10px' }}>
                <h1 style={{ color: 'var(--primary-light)', margin: 0 }}>إضافة غرفة جديدة</h1>
                <button
                    onClick={() => navigate('/room-management')}
                    style={{
                        padding: '10px 20px',
                        background: '#e2e8f0',
                        color: '#4a5568',
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
                background: 'white',
                borderRadius: '15px',
                padding: '25px',
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
            </div>
        </div>
    );
};

export default AddRoom;

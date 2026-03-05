import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from '../components/ConfirmationModal';
import Swal from 'sweetalert2';

const RoomList = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';
    const navigate = useNavigate();

    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (page = currentPage) => {
        try {
            const roomsRes = await roomAPI.findAll(page);

            if (roomsRes.data.data) {
                setRooms(roomsRes.data.data);
                setPagination(roomsRes.data.pagination);
            } else {
                setRooms(roomsRes.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
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
            Swal.fire({
                icon: 'success',
                title: 'تم الحذف بنجاح',
                text: 'تم حذف الغرفة بنجاح'
            });
        } catch (error) {
            console.error("Error deleting room:", error);
            Swal.fire({
                icon: 'error',
                title: 'فشل الحذف',
                text: 'فشل حذف الغرفة. قد تكون مرتبطة بجداول موجودة.'
            });
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>جاري التحميل...</div>;

    if (!isAdmin) {
        return <div style={{ padding: '20px' }}>غير مصرح لك بالوصول لهذه الصفحة</div>;
    }

    return (
        <div className="main-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 0', marginBottom: '10px' }}>
                <h1 style={{ color: 'var(--primary-light)', margin: 0 }}>قائمة الغرف</h1>
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
                marginBottom: '30px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                {/* Rooms Table */}
                <div style={{ overflowX: 'auto' }}>
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
                                                onClick={() => navigate(`/edit-room/${room.id}`)}
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

                    {/* Pagination Controls */}
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
                </div>
            </div>

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

export default RoomList;

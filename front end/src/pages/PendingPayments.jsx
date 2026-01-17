import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { enrollmentAPI, courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/ConfirmationModal';

const PendingPayments = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { },
    });

    useEffect(() => {
        loadPendingPayments();
    }, []);

    const loadPendingPayments = async () => {
        setLoading(true);
        try {
            const response = await enrollmentAPI.getMyRequests();
            // Filter only WAIT_FOR_PAY requests
            const myPendingRequests = response.data.filter(req => req.status === 'WAIT_FOR_PAY');
            setPendingRequests(myPendingRequests);
        } catch (error) {
            console.error('Failed to load pending payments:', error);
            showToast('فشل تحميل الطلبات المعلقة', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = (courseId, courseName) => {
        setConfirmModal({
            isOpen: true,
            title: 'تأكيد الدفع للدورة',
            message: `حالياً نظام الدفع الإلكتروني قيد التطوير. 
            هل قمت بدفع الرسوم للإدارة وتود تأكيد تفعيل اشتراكك يدوياً الآن؟`, // رسالة توضيحية مؤقتة
            type: 'info',
            confirmText: 'نعم، قمت بالدفع وتفعيل الاشتراك',
            cancelText: 'إلغاء',
            onConfirm: async () => {
                try {
                    await enrollmentAPI.confirmPayment(courseId);
                    showToast('تم تفعيل الاشتراك بنجاح! 🎉', 'success');
                    loadPendingPayments();
                } catch (err) {
                    showToast(err.response?.data?.message || 'فشل تأكيد الدفع', 'error');
                }
                setConfirmModal({ ...confirmModal, isOpen: false });
            }
        });
    };

    if (loading) {
        return <div className="loading-spinner">جاري التحميل...</div>;
    }

    return (
        <div className="container" style={{ maxWidth: '1000px', padding: '20px' }}>
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText={confirmModal.confirmText}
                cancelText={confirmModal.cancelText}
                onConfirm={confirmModal.onConfirm}
            />

            <div className="card" style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '2rem', color: '#4f46e5', margin: 0 }}>المدفوعات المعلقة 💰</h2>
                    <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                        العودة
                    </button>
                </div>

                {pendingRequests.length === 0 ? (
                    <div className="empty-state" style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontSize: '4em', marginBottom: '20px' }}>✅</div>
                        <h3 style={{ color: '#28a745', marginBottom: '10px' }}>رائع! لا توجد مدفوعات معلقة</h3>
                        <p style={{ color: '#666' }}>جميع طلباتك تمت معالجتها</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gap: '20px',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
                    }}>
                        {pendingRequests.map((request) => {
                            const course = request.course;
                            const finalPrice = course.discount && course.discount > 0
                                ? course.price - course.discount
                                : course.price;

                            return (
                                <div
                                    key={request.id}
                                    className="card"
                                    style={{
                                        padding: '25px',
                                        margin: 0,
                                        borderLeft: '5px solid #17a2b8',
                                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        transition: 'transform 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            background: '#17a2b8',
                                            color: 'white',
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            fontSize: '0.85em',
                                            fontWeight: 'bold',
                                            marginBottom: '15px'
                                        }}>
                                            ⏳ في انتظار الدفع
                                        </div>
                                        <h3 style={{ margin: '0 0 10px', color: '#333', fontSize: '1.4em' }}>
                                            {course.title}
                                        </h3>
                                        <p style={{ color: '#666', fontSize: '0.95em', margin: '0 0 15px' }}>
                                            {course.description || 'لا يوجد وصف'}
                                        </p>
                                    </div>

                                    <div style={{
                                        background: '#f8f9fa',
                                        padding: '15px',
                                        borderRadius: '10px',
                                        marginBottom: '20px'
                                    }}>
                                        <div style={{ marginBottom: '10px' }}>
                                            <span style={{ fontWeight: 'bold', color: '#555' }}>المدرس: </span>
                                            <span style={{ color: '#333' }}>
                                                {course.teacher?.first_name} {course.teacher?.last_name}
                                            </span>
                                        </div>

                                        <div style={{ marginBottom: '10px' }}>
                                            <span style={{ fontWeight: 'bold', color: '#555' }}>تاريخ الطلب: </span>
                                            <span style={{ color: '#333' }}>
                                                {new Date(request.createdAt).toLocaleDateString('ar-EG')}
                                            </span>
                                        </div>

                                        <div style={{
                                            marginTop: '15px',
                                            paddingTop: '15px',
                                            borderTop: '2px solid #e2e8f0'
                                        }}>
                                            <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#28a745' }}>
                                                {course.discount && course.discount > 0 ? (
                                                    <div>
                                                        <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.8em' }}>
                                                            {course.price} ج.م
                                                        </span>
                                                        {' '}
                                                        <span>{finalPrice} ج.م</span>
                                                    </div>
                                                ) : (
                                                    <span>{finalPrice} ج.م</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-primary"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            fontSize: '1em',
                                            fontWeight: 'bold',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            border: 'none',
                                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                                        }}
                                        onClick={() => handlePayment(course.id, course.title)}
                                    >
                                        💳 الدفع الآن
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PendingPayments;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { enrollmentAPI, paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/ConfirmationModal';

const PendingPayments = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { },
    });

    useEffect(() => {
        loadPendingPayments();

        // Check for payment status in URL (returned from Paymob)
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment');
        const orderId = urlParams.get('order');

        if (paymentStatus === 'success') {
            showToast(`✅ تم الدفع بنجاح! جاري تفعيل الاشتراك...`, 'success');
            // Refresh the list to remove the paid request
            loadPendingPayments();
        } else if (paymentStatus === 'failed') {
            showToast(`❌ فشل الدفع. يرجى المحاولة مرة أخرى. (Order: ${orderId})`, 'error');
        }

        // Clean URL to remove query params
        if (paymentStatus) {
            window.history.replaceState({}, '', '/pending-payments');
        }
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

    const [walletModal, setWalletModal] = useState({
        isOpen: false,
        request: null,
        phoneNumber: ''
    });

    const handlePaymentClick = (request, type) => {
        if (type === 'wallet') {
            setWalletModal({
                isOpen: true,
                request: request,
                phoneNumber: user?.phone || ''
            });
        } else {
            processPayment(request, 'card');
        }
    };

    const processPayment = async (request, type, walletPhoneNumber = null) => {
        // Integration IDs
        const INTEGRATION_IDS = {
            CARD: Number(import.meta.env.VITE_PAYMOB_INTEGRATION_ID) || 5468545,
            WALLET: 5470931
        };

        const integration_id = type === 'wallet' ? INTEGRATION_IDS.WALLET : INTEGRATION_IDS.CARD;

        setPaymentLoading(true);
        if (type === 'wallet') {
            setWalletModal(prev => ({ ...prev, isOpen: false }));
        }

        try {
            const response = await paymentAPI.initiatePayment(request.id, integration_id, walletPhoneNumber);
            const { redirectUrl } = response.data;

            // Redirect to Paymob payment page
            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else {
                showToast('فشل في إنشاء رابط الدفع', 'error');
            }
        } catch (err) {
            console.error('Payment initiation failed:', err);
            showToast(err.response?.data?.message || 'فشل بدء عملية الدفع', 'error');
        } finally {
            setPaymentLoading(false);
        }
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

            {/* Wallet Number Input Modal */}
            {walletModal.isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(5px)'
                }} onClick={(e) => {
                    if (e.target === e.currentTarget) setWalletModal({ ...walletModal, isOpen: false });
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '20px',
                        width: '90%',
                        maxWidth: '400px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <h3 style={{ margin: '0 0 20px', color: '#1f2937', textAlign: 'center', fontSize: '1.5rem' }}>
                            📱 رقم المحفظة الإلكترونية
                        </h3>
                        <p style={{ color: '#6b7280', marginBottom: '20px', textAlign: 'center' }}>
                            من فضلك أدخل رقم الهاتف المرتبط بالمحفظة التي تريد الدفع منها.
                        </p>

                        <input
                            type="tel"
                            placeholder="01xxxxxxxxx"
                            value={walletModal.phoneNumber}
                            onChange={(e) => setWalletModal({ ...walletModal, phoneNumber: e.target.value })}
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '10px',
                                fontSize: '1.2rem',
                                marginBottom: '24px',
                                textAlign: 'center',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setWalletModal({ ...walletModal, isOpen: false })}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={() => {
                                    if (!walletModal.phoneNumber || walletModal.phoneNumber.length < 11) {
                                        showToast('يرجى إدخال رقم هاتف صحيح', 'error');
                                        return;
                                    }
                                    processPayment(walletModal.request, 'wallet', walletModal.phoneNumber);
                                }}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px -1px rgba(221, 36, 118, 0.3)'
                                }}
                            >
                                متابعة للدفع
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <button
                                            className="btn"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                fontSize: '1em',
                                                fontWeight: 'bold',
                                                color: 'white',
                                                background: paymentLoading ? '#999' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px rgba(102, 126, 234, 0.4)',
                                                cursor: paymentLoading ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                            onClick={() => handlePaymentClick(request, 'card')}
                                            disabled={paymentLoading}
                                        >
                                            {paymentLoading ? '⏳' : '💳'} الدفع بالبطاقة البنكية
                                        </button>

                                        <button
                                            className="btn"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                fontSize: '1em',
                                                fontWeight: 'bold',
                                                color: 'white',
                                                background: paymentLoading ? '#999' : 'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px rgba(221, 36, 118, 0.4)',
                                                cursor: paymentLoading ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                            onClick={() => handlePaymentClick(request, 'wallet')}
                                            disabled={paymentLoading}
                                        >
                                            {paymentLoading ? '⏳' : '📱'} الدفع بالمحفظة الإلكترونية
                                        </button>
                                    </div>
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

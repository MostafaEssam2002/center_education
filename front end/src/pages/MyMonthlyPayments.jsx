import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/ConfirmationModal';

const MyMonthlyPayments = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [monthlySubscriptions, setMonthlySubscriptions] = useState([]);
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
        loadMonthlySubscriptions();

        // Check for payment status in URL (returned from Paymob)
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment');
        const orderId = urlParams.get('order');

        if (paymentStatus === 'success') {
            showToast(`✅ تم الدفع بنجاح! تم تفعيل الاشتراك الشهري...`, 'success');
            // Refresh the list to update the paid subscription
            loadMonthlySubscriptions();
        } else if (paymentStatus === 'failed') {
            showToast(`❌ فشل الدفع. يرجى المحاولة مرة أخرى. (Order: ${orderId})`, 'error');
        }

        // Clean URL to remove query params
        if (paymentStatus) {
            window.history.replaceState({}, '', '/my-monthly-payments');
        }
    }, []);

    const loadMonthlySubscriptions = async () => {
        setLoading(true);
        try {
            const response = await paymentAPI.getMyMonthlySubscriptions();
            // Filter only PENDING subscriptions that need payment
            const pendingSubscriptions = response.data.filter(sub => sub.status === 'PENDING');
            setMonthlySubscriptions(pendingSubscriptions);
        } catch (error) {
            console.error('Failed to load monthly subscriptions:', error);
            showToast('فشل تحميل الاشتراكات الشهرية', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentClick = (subscription) => {
        // For now, we'll use a simple confirmation
        // In a real implementation, you might want to integrate with Paymob
        setConfirmModal({
            isOpen: true,
            title: 'تأكيد الدفع',
            message: `هل تريد تأكيد دفع الاشتراك الشهري لكورس "${subscription.course.title}" لشهر ${subscription.month}/${subscription.year} بمبلغ ${subscription.amountCents / 100} جنيه؟`,
            type: 'info',
            onConfirm: () => processPayment(subscription),
        });
    };

    const processPayment = async (subscription) => {
        setPaymentLoading(true);
        setConfirmModal({ ...confirmModal, isOpen: false });

        try {
            // For now, directly mark as paid
            // In production, you should integrate with Paymob payment gateway
            await paymentAPI.markMonthlySubscriptionPaid(subscription.id, {
                paidAt: new Date().toISOString(),
                transactionId: `manual-${Date.now()}`, // Generate a transaction ID
            });

            showToast('✅ تم دفع الاشتراك الشهري بنجاح!', 'success');
            // Refresh the list
            loadMonthlySubscriptions();
        } catch (error) {
            console.error('Payment failed:', error);
            showToast(error.response?.data?.message || 'فشل في دفع الاشتراك الشهري', 'error');
        } finally {
            setPaymentLoading(false);
        }
    };

    const formatMonth = (month) => {
        const months = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        return months[month - 1];
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ar-EG');
    };

    if (loading) {
        return (
            <div className="container">
                <div className="card">
                    <div className="loading">جاري تحميل الاشتراكات الشهرية...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <h2>الاشتراكات الشهرية المعلقة</h2>
                    <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                        العودة للوحة التحكم
                    </button>
                </div>

                {monthlySubscriptions.length === 0 ? (
                    <div className="empty-state">
                        🎉 لا توجد اشتراكات شهرية معلقة للدفع
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>الكورس</th>
                                    <th>الشهر</th>
                                    <th>المبلغ</th>
                                    <th>تاريخ الاستحقاق</th>
                                    <th>الحالة</th>
                                    <th>الإجراء</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlySubscriptions.map((subscription) => (
                                    <tr key={subscription.id}>
                                        <td>{subscription.course.title}</td>
                                        <td>{formatMonth(subscription.month)} {subscription.year}</td>
                                        <td>{subscription.amountCents / 100} جنيه</td>
                                        <td>{formatDate(subscription.dueDate)}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.9em',
                                                backgroundColor: subscription.status === 'PENDING' ? '#fff3cd' : '#d4edda',
                                                color: subscription.status === 'PENDING' ? '#856404' : '#155724'
                                            }}>
                                                {subscription.status === 'PENDING' ? 'معلق' : 'مدفوع'}
                                            </span>
                                        </td>
                                        <td>
                                            {subscription.status === 'PENDING' && (
                                                <button
                                                    className="btn btn-success"
                                                    onClick={() => handlePaymentClick(subscription)}
                                                    disabled={paymentLoading}
                                                    style={{ padding: '6px 10px', borderRadius: '6px', fontSize: '0.85em' }}
                                                >
                                                    {paymentLoading ? 'جاري المعالجة...' : 'دفع الآن'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            />
        </div>
    );
};

export default MyMonthlyPayments;</content>
<parameter name="filePath">c:\Users\mws83\Desktop\center_education\front end\src\pages\MyMonthlyPayments.jsx
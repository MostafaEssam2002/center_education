import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI, enrollmentAPI, paymentAPI } from '../services/api';

const MonthlyPayments = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [students, setStudents] = useState([]);
    const [monthlyPayments, setMonthlyPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [lastUpdate, setLastUpdate] = useState(null);

    useEffect(() => {
        loadCourses();
    }, []);

    useEffect(() => {
        // عندما يتغير الكورس أو الشهر أو السنة، حمل حالة الدفع تلقائيًا
        if (selectedCourse) {
            loadMonthlyPayments();
        } else {
            setStudents([]);
            setMonthlyPayments([]);
        }

        // تحديث تلقائي كل 5 ثواني لعرض آخر حالة بدون تدخل يدوي
        const intervalId = setInterval(() => {
            if (selectedCourse) {
                loadMonthlyPayments();
            }
        }, 5000);

        return () => clearInterval(intervalId);
    }, [selectedCourse, selectedMonth, selectedYear]);

    const loadCourses = async () => {
        try {
            const response = await courseAPI.findAll(1, 1000);
            const coursesData = response.data.data || response.data;
            // اختر فقط الكورسات الشهرية
            const monthlyCourses = coursesData.filter(c => (c.paymentType || c.payment_type || '').toUpperCase() === 'MONTHLY');
            setCourses(monthlyCourses);
        } catch (err) {
            setError('فشل تحميل الكورسات');
        }
    };

    const loadMonthlyPayments = async () => {
        if (!selectedCourse) return;

        setLoading(true);
        setError('');
        try {
            // Load enrolled students
            const studentsResponse = await enrollmentAPI.getStudentsByCourse(selectedCourse);
            setStudents(studentsResponse.data);

            // Load monthly payment status
            const paymentsResponse = await paymentAPI.getMonthlySubscriptionsForCourse(
                selectedCourse,
                selectedMonth,
                selectedYear
            );
            setMonthlyPayments(paymentsResponse.data);
            setLastUpdate(new Date());
        } catch (err) {
            setError(err.response?.data?.message || 'فشل تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };



    const handleCourseChange = (e) => {
        setSelectedCourse(e.target.value);
        setStudents([]);
        setMonthlyPayments([]);
    };

    const handleMonthChange = (e) => {
        setSelectedMonth(parseInt(e.target.value));
        setStudents([]);
        setMonthlyPayments([]);
    };

    const handleYearChange = (e) => {
        setSelectedYear(parseInt(e.target.value));
        setStudents([]);
        setMonthlyPayments([]);
    };

    const handleSearch = () => {
        loadMonthlyPayments();
    };

    const getPaymentStatus = (studentId) => {
        const payment = monthlyPayments.find(p => p.studentId === studentId);
        if (!payment) return { status: 'لم يتم إنشاء سجل', paidAt: null };
        return {
            status: payment.status === 'PAID' ? 'مدفوع' : payment.status === 'PENDING' ? 'معلق' : 'متأخر',
            paidAt: payment.paidAt
        };
    };

    const handleMarkPaid = async (subscriptionId, studentId) => {
        try {
            await paymentAPI.markMonthlySubscriptionPaid(subscriptionId, { paidAt: new Date().toISOString() });
            // refresh data
            await loadMonthlyPayments();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'فشل تحديث حالة الدفع');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ar-EG');
    };

    const months = [
        { value: 1, label: 'يناير' },
        { value: 2, label: 'فبراير' },
        { value: 3, label: 'مارس' },
        { value: 4, label: 'أبريل' },
        { value: 5, label: 'مايو' },
        { value: 6, label: 'يونيو' },
        { value: 7, label: 'يوليو' },
        { value: 8, label: 'أغسطس' },
        { value: 9, label: 'سبتمبر' },
        { value: 10, label: 'أكتوبر' },
        { value: 11, label: 'نوفمبر' },
        { value: 12, label: 'ديسمبر' }
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <h2>متابعة الاشتراكات الشهرية</h2>
                    <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                        العودة للوحة التحكم
                    </button>
                </div>

                <div style={{
                    padding: '20px',
                    background: 'inherit',
                    borderRadius: '12px',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                اختر الكورس:
                            </label>
                            <select
                                value={selectedCourse}
                                onChange={handleCourseChange}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--glass-bg)',
                                    color: 'var(--text-primary)',
                                    minWidth: '200px'
                                }}
                            >
                                <option value="">اختر كورس...</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                الشهر:
                            </label>
                            <select
                                value={selectedMonth}
                                onChange={handleMonthChange}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--glass-bg)',
                                    color: 'var(--text-primary)',
                                    minWidth: '120px'
                                }}
                            >
                                {months.map(month => (
                                    <option key={month.value} value={month.value}>
                                        {month.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                السنة:
                            </label>
                            <select
                                value={selectedYear}
                                onChange={handleYearChange}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--glass-bg)',
                                    color: 'var(--text-primary)',
                                    minWidth: '100px'
                                }}
                            >
                                {years.map(year => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ alignSelf: 'flex-end' }}>
                            <button
                                className="btn btn-primary"
                                onClick={handleSearch}
                                disabled={!selectedCourse || loading}
                            >
                                {loading ? 'جاري البحث...' : 'عرض'}
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="message error" style={{ marginBottom: '20px' }}>
                        {error}
                    </div>
                )}

                {lastUpdate && (
                    <div className="message info" style={{ marginBottom: '20px', fontSize: '0.9em' }}>
                        آخر تحديث: {lastUpdate.toLocaleTimeString('ar-EG')}
                    </div>
                )}

                {students.length > 0 && (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>الاسم الأول</th>
                                    <th>الاسم الأخير</th>
                                    <th>البريد الإلكتروني</th>
                                    <th>حالة الدفع</th>
                                    <th>تاريخ الدفع</th>
                                    <th>اجراء</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((enrollment, index) => {
                                    const paymentInfo = getPaymentStatus(enrollment.studentId);
                                    const subscription = monthlyPayments.find(p => p.studentId === enrollment.studentId);
                                    return (
                                        <tr key={enrollment.id}>
                                            <td>{index + 1}</td>
                                            <td>{enrollment.user?.first_name || '-'}</td>
                                            <td>{enrollment.user?.last_name || '-'}</td>
                                            <td>{enrollment.user?.email || '-'}</td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.9em',
                                                    backgroundColor: paymentInfo.status === 'مدفوع'
                                                        ? '#d4edda'
                                                        : paymentInfo.status === 'معلق'
                                                        ? '#fff3cd'
                                                        : '#f8d7da',
                                                    color: paymentInfo.status === 'مدفوع'
                                                        ? '#155724'
                                                        : paymentInfo.status === 'معلق'
                                                        ? '#856404'
                                                        : '#721c24'
                                                }}>
                                                    {paymentInfo.status}
                                                </span>
                                            </td>
                                            <td>{formatDate(paymentInfo.paidAt)}</td>
                                            <td>
                                                {subscription && subscription.status === 'PENDING' ? (
                                                    <button
                                                        className="btn btn-success"
                                                        onClick={() => handleMarkPaid(subscription.id)}
                                                        style={{ padding: '6px 10px', borderRadius: '6px', fontSize: '0.85em' }}
                                                    >
                                                        تأكيد دفع
                                                    </button>
                                                ) : (
                                                    '-' 
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {selectedCourse && students.length === 0 && !loading && (
                    <div className="empty-state">
                        لا يوجد طلاب مسجلين في هذا الكورس لهذا الشهر
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonthlyPayments;
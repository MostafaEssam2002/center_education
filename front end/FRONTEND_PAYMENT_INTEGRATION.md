# Frontend Payment Integration - التوثيق

## التعديلات المنفذة ✅

تم تحديث واجهة المستخدم الأمامية لاستخدام نظام الدفع الإلكتروني عبر Paymob بدلاً من نظام التأكيد اليدوي.

---

## الملفات المعدلة

### 1. `src/services/api.js`

**التعديل:** إضافة Payment API

```javascript
export const paymentAPI = {
  initiatePayment: (enrollmentRequestId, integration_id) =>
    api.post('/payments/initiate', { enrollmentRequestId, integration_id }),
};
```

**الغرض:** توفير endpoint لبدء عملية الدفعالإلكتروني.

---

### 2. `src/pages/PendingPayments.jsx`

**التعديلات الرئيسية:**

#### أ) تحديث الـ Imports
```javascript
import { enrollmentAPI, paymentAPI } from '../services/api';
```

#### ب) إضافة Payment Loading State
```javascript
const [paymentLoading, setPaymentLoading] = useState(false);
```

#### ج) إعادة كتابة `handlePayment` Function
**قبل:**
- كان يعرض modal للتأكيد اليدوي
- يستدعي `enrollmentAPI.confirmPayment()` مباشرة

**بعد:**
```javascript
const handlePayment = async (request) => {
    const integration_id = parseInt(import.meta.env.VITE_PAYMOB_INTEGRATION_ID || '4839033');
    
    setPaymentLoading(true);
    try {
        const response = await paymentAPI.initiatePayment(request.id, integration_id);
        const { redirectUrl } = response.data;
        
        if (redirectUrl) {
            window.location.href = redirectUrl; // Redirect to Paymob
        } else {
            showToast('فشل في إنشاء رابط الدفع', 'error');
        }
    } catch (err) {
        showToast(err.response?.data?.message || 'فشل بدء عملية الدفع', 'error');
    } finally {
        setPaymentLoading(false);
    }
};
```

**الوظيفة الجديدة:**
1. الحصول على Integration ID من environment variables
2. استدعاء Payment API لإنشاء رابط دفع
3. التوجيه التلقائي إلى صفحة الدفع في Paymob

#### د) تحديث زر الدفع
```jsx
<button
    onClick={() => handlePayment(request)}
    disabled={paymentLoading}
    style={{
        background: paymentLoading ? '#999' : 'linear-gradient(...)',
        cursor: paymentLoading ? 'not-allowed' : 'pointer'
    }}
>
    {paymentLoading ? '⏳ جاري التحويل...' : '💳 الدفع الآن'}
</button>
```

**المميزات:**
- إظهار حالة التحميل أثناء معالجة الدفع
- تعطيل الزر لمنع النقرات المتكررة
- رسالة واضحة للمستخدم

---

### 3. `.env.example` (جديد)

**الملف:** `front end/.env.example`

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_PAYMOB_INTEGRATION_ID=4839033
```

**الغرض:** توثيق المتغيرات البيئية المطلوبة.

---

## سير عمل الدفع الجديد 🔄

### من وجهة نظر الطالب:

1. **الطالب يطلب الانضمام**
   - يذهب لصفحة الكورس
   - يضغط "طلب الانضمام"

2. **المدرس يوافق**
   - حالة الطلب تتحول إلى `WAIT_FOR_PAY`
   - الطلب يظهر في صفحة "المدفوعات المعلقة"

3. **الطالب يضغط "الدفع الآن"** ⬅️ **هنا التحديث**
   - **قديماً:** modal يسأل عن التأكيد اليدوي
   - **حديثاً:** 
     - يتم إنشاء payment record في قاعدة البيانات
     - يتم إنشاء Paymob order
     - يتم التوجيه التلقائي لصفحة الدفع Paymob
   
4. **الطالب يدفع في Paymob**
   - بطاقة ائتمان / محفظة إلكترونية
   - Paymob يرسل webhook للسيرفر

5. **السيرفر يستقبل Webhook**
   - يحدث Payment status → `PAID`
   - يقوم بتسجيل الطالب تلقائياً
   - يحذف Enrollment Request

6. **Paymob يوجه الطالب للموقع**
   - الطالب يرى رسالة النجاح
   - يتم تسجيله في الكورس

---

## Configuration المطلوبة ⚙️

### Frontend `.env` File

أنشئ ملف `.env` في مجلد `front end/`:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_PAYMOB_INTEGRATION_ID=YOUR_INTEGRATION_ID
```

**كيفية الحصول على Integration ID:**
1. سجل دخول على [Paymob Dashboard](https://accept.paymob.com)
2. اذهب إلى Settings → Payment Integrations
3. انسخ Integration ID

---

## الاختبار 🧪

### Test Scenario

1. **قم بتسجيل الدخول كطالب**
2. **اطلب الانضمام لكورس**
3. **سجل دخول كمدرس ووافق على الطلب**
4. **ارجع للطالب واذهب لـ "المدفوعات المعلقة"**
5. **اضغط "الدفع الآن"**
6. **تأكد من:**
   - ظهور رسالة "جاري التحويل..."
   - التوجيه لصفحة Paymob
   - وجود بيانات الكورس صحيحة
   - السعر صحيح (مع الخصم إذا وجد)

### Paymob Test Cards

للاختبار استخدم:
- **Card Number:** 4987654321098769
- **CVV:** 123
- **Expiry:** أي تاريخ مستقبلي
- **Cardholder:** أي اسم

---

## الفوائد ✨

1. **تجربة مستخدم أفضل**
   - دفع إلكتروني احترافي
   - لا حاجة للتأكيد اليدوي

2. **أمان أعلى**
   - معالجة الدفع عبر Paymob (PCI Compliant)
   - HMAC verification للـ webhooks

3. **تتبع أفضل**
   - كل دفعة مسجلة في قاعدة البيانات
   - تقارير دفع تلقائية

4. **أتمتة كاملة**
   - تسجيل تلقائي بعد الدفع
   - لا تدخل يدوي من المدرب

---

## ملاحظات مهمة ⚠️

1. **لا تنس إضافة `.env` للـ `.gitignore`**
   ```
   .env
   .env.local
   ```

2. **للـ Production:**
   - استخدم HTTPS فقط
   - غير Integration ID للـ production integration
   - تأكد من صحة Webhook URL في Paymob dashboard

3. **Webhook URL Configuration:**
   - في Paymob Dashboard → Settings → API Configuration
   - أضف: `https://yourdomain.com/payments/webhook`

---

## الخلاصة 🎯

تم بنجاح تحويل نظام الدفع من تأكيد يدوي إلى نظام دفع إلكتروني متكامل مع Paymob. الآن الطلاب يمكنهم الدفع أونلاين بشكل آمن، والتسجيل يتم تلقائياً بعد نجاح عملية الدفع! 🚀

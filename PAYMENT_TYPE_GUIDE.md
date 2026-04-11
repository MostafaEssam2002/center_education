# دليل نظام أنواع الدفع للكورسات

## 📋 النظام الجديد

تم إضافة نظام شامل لحساب نوع الدفع للكورسات حيث يمكن للمعلم/Admin اختيار بين:

### 1. **دفعة واحدة (ONE_TIME)**
- الطالب يدفع مبلغ واحد فقط كي ينضم للكورس
- المبلغ يُحتسب من حقل `price` في جدول `course`
- يمكن تطبيق خصم باستخدام حقل `discount`

### 2. **اشتراك شهري (MONTHLY)**
- الطالب يدفع مبلغ شهري لكل شهر
- المبلغ الشهري يُحتسب من حقل `monthlyPrice` في جدول `course`
- يمكن تطبيق خصم باستخدام حقل `discount`
- يتم إنشاء سجل في جدول `monthlySubscription` للطالب لكل شهر

---

## 🗄️ تغييرات قاعدة البيانات

### جدول `course` - الحقول الجديدة:

```sql
ALTER TABLE `course` ADD COLUMN `paymentType` ENUM('ONE_TIME', 'MONTHLY') NOT NULL DEFAULT 'ONE_TIME';
ALTER TABLE `course` ADD COLUMN `monthlyPrice` FLOAT NULL;
```

### الحقول:
- `paymentType` - نوع الدفع (ONE_TIME أو MONTHLY)
- `monthlyPrice` - السعر الشهري (مستخدم فقط عند paymentType = MONTHLY)

---

## 🛠️ التعديلات في الكود

### Backend - CreateCourseDto
تم إضافة حقول جديدة:
```typescript
@IsEnum(PaymentType)
paymentType?: PaymentType;  // ONE_TIME أو MONTHLY

@IsNumber()
monthlyPrice?: number;      // السعر الشهري
```

### Backend - Course Service
تم تحديث `create()` لحفظ الحقول الجديدة:
```typescript
paymentType: createCourseDto.paymentType,
monthlyPrice: createCourseDto.monthlyPrice
```

### Backend - Payments Service
تم تحديث حساب المبلغ في `initiatePayment()`:
```typescript
const basePrice = enrollmentRequest.course.paymentType === 'MONTHLY' 
  ? (enrollmentRequest.course.monthlyPrice || 0) 
  : enrollmentRequest.course.price;
```

### Frontend - Courses.jsx
- تم إضافة حقل `paymentType` و `monthlyPrice` في form state
- تم إضافة dropdown لاختيار نوع الدفع
- يظهر حقل السعر الشهري فقط عند اختيار "اشتراك شهري"
- يتم إرسال الحقول الجديدة عند الإنشاء والتحديث

### Frontend - CourseCard.jsx
تم تحديث عرض السعر:
- إذا كان `paymentType = MONTHLY` → يعرض السعر الشهري مع "/شهر"
- إذا كان `paymentType = ONE_TIME` → يعرض السعر الواحد

---

## 🔄 عملية الدفع

### عند دفع الطالب:

1. **للدفعة الواحدة (ONE_TIME)**:
   - يتم حساب المبلغ من `price - discount`
   - بعد نجاح الدفع → يتم تسجيل الطالب في الكورس

2. **للاشتراك الشهري (MONTHLY)**:
   - يتم حساب المبلغ من `monthlyPrice - discount`
   - بعد نجاح الدفع:
     - يتم تسجيل الطالب في الكورس
     - يتم إنشاء سجل في `monthlySubscription` للشهر الحالي بحالة PAID

---

## 📝 أمثلة الاستخدام

### إنشاء كورس بدفعة واحدة:
```json
{
  "title": "كورس البرمجة",
  "description": "كورس شامل",
  "teacherId": 1,
  "price": 500,
  "discount": 50,
  "paymentType": "ONE_TIME"
}
```

### إنشاء كورس باشتراك شهري:
```json
{
  "title": "كورس اللغة الإنجليزية",
  "description": "دروس يومية",
  "teacherId": 1,
  "monthlyPrice": 200,
  "discount": 20,
  "paymentType": "MONTHLY"
}
```

---

## ✅ التجريب

### على الواجهة الأمامية:
1. اذهب إلى صفحة الكورسات
2. اضغط "إضافة كورس جديد"
3. اختر نوع الدفع (دفعة واحدة أو اشتراك شهري)
4. أدخل السعر المناسب
5. احفظ الكورس

### على الـ API مباشرة:
```bash
POST /course
{
  "title": "اختبار",
  "description": "Test course",
  "teacherId": 1,
  "price": 100,
  "paymentType": "ONE_TIME",
  "discount": 0
}
```

---

## 🔧 ملاحظات مهمة

- **القيمة الافتراضية**: جميع الكورسات الحالية سيكون لها `paymentType = ONE_TIME`
- **monthlyPrice**: يترك كـ NULL إذا كان النوع ONE_TIME
- **Webhook**: عند نجاح الدفع، يتم إنشاء monthlySubscription للكورسات الشهرية تلقائياً
- **الفحوصات**: تأكد من تحديد نوع الدفع عند إنشاء كورس جديد

---

## 🚀 الخطوات التالية (مستقبلية)

- [ ] إضافة نظام إرسال تذكيرات الدفع الشهري
- [ ] إنشاء تقرير شامل عن الاشتراكات الشهرية
- [ ] إضافة خاصية إلغاء الاشتراك للطلاب
- [ ] إضافة نظام استرجاع المبلغ (Refund)

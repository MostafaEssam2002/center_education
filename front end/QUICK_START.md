# دليل البدء السريع - Frontend

## خطوات التشغيل

### 1. تثبيت المكتبات
```bash
cd "front end"
npm install
```

### 2. تشغيل المشروع
```bash
npm run dev
```

سيتم فتح التطبيق على: **http://localhost:5173**

### 3. تأكد من تشغيل Backend
تأكد من أن Backend يعمل على **http://localhost:3000**

إذا كان Backend يعمل على منفذ آخر، أنشئ ملف `.env` في مجلد `front end`:

```env
VITE_API_BASE_URL=http://localhost:YOUR_PORT
```

## الصفحات المتاحة

- `/login` - تسجيل الدخول
- `/register` - تسجيل مستخدم جديد
- `/dashboard` - لوحة التحكم الرئيسية
- `/users` - إدارة المستخدمين
- `/courses` - إدارة الكورسات
- `/chapters` - إدارة الفصول

## ملاحظات

- جميع الصفحات (عدا login و register) محمية وتتطلب تسجيل الدخول
- يتم حفظ Token تلقائياً في localStorage
- عند انتهاء صلاحية Token، سيتم توجيهك تلقائياً لصفحة تسجيل الدخول


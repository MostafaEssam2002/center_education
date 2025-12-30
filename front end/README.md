# مركز التعليم - Frontend

مشروع Frontend متكامل يربط جميع endpoints من Backend API.

## المميزات

- ✅ تسجيل الدخول والتسجيل
- ✅ إدارة المستخدمين (عرض، تعديل، حذف، بحث)
- ✅ إدارة الكورسات (إنشاء، عرض، تعديل، حذف، بحث)
- ✅ إدارة الفصول (إنشاء، عرض، تعديل، حذف)
- ✅ رفع الملفات (الصور)
- ✅ نظام Authentication مع Protected Routes
- ✅ واجهة مستخدم عربية جميلة ومتجاوبة

## التثبيت والتشغيل

### 1. تثبيت المكتبات

```bash
cd "front end"
npm install
```

### 2. إعداد متغيرات البيئة (اختياري)

أنشئ ملف `.env` في مجلد `front end`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

إذا لم تقم بإنشاء الملف، سيتم استخدام `http://localhost:3000` كقيمة افتراضية.

### 3. تشغيل المشروع

```bash
npm run dev
```

سيتم فتح التطبيق على `http://localhost:5173`

### 4. بناء المشروع للإنتاج

```bash
npm run build
```

الملفات المبنية ستكون في مجلد `dist`

## البنية

```
front end/
├── src/
│   ├── components/        # المكونات المشتركة
│   │   ├── Layout.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/           # Context API
│   │   └── AuthContext.jsx
│   ├── pages/             # الصفحات
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Users.jsx
│   │   ├── Courses.jsx
│   │   └── Chapters.jsx
│   ├── services/          # API Services
│   │   └── api.js
│   ├── App.jsx            # المكون الرئيسي
│   ├── main.jsx           # نقطة الدخول
│   └── index.css          # الأنماط العامة
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## API Endpoints المستخدمة

### Authentication
- `POST /auth/login` - تسجيل الدخول
- `GET /auth` - الحصول على جميع المستخدمين (ADMIN, TEACHER)
- `GET /auth/:id` - الحصول على مستخدم بالمعرف

### Users
- `POST /user/register` - تسجيل مستخدم جديد
- `GET /user` - الحصول على جميع المستخدمين
- `GET /user/:email` - الحصول على مستخدم بالبريد الإلكتروني
- `PATCH /user/:id` - تحديث مستخدم
- `DELETE /user/:id` - حذف مستخدم

### Courses
- `POST /course` - إنشاء كورس جديد (ADMIN, TEACHER)
- `GET /course` - الحصول على جميع الكورسات
- `GET /course/search?title=...` - البحث في الكورسات
- `PATCH /course/:id` - تحديث كورس (ADMIN, TEACHER)
- `DELETE /course/:id` - حذف كورس (ADMIN, TEACHER)

### Chapters
- `POST /chapter` - إنشاء فصل جديد (ADMIN, TEACHER)
- `GET /chapter/course/:courseId` - الحصول على فصول كورس
- `GET /chapter/:id` - الحصول على فصل بالمعرف (ADMIN, TEACHER, STUDENT)
- `PATCH /chapter/:id` - تحديث فصل (ADMIN, TEACHER)
- `DELETE /chapter/:id` - حذف فصل (ADMIN, TEACHER)

### Upload
- `POST /upload-file` - رفع ملف (صورة/فيديو)

## الصلاحيات

- **ADMIN, TEACHER**: يمكنهم إدارة الكورسات والفصول
- **جميع المستخدمين**: يمكنهم عرض الكورسات والفصول
- **المستخدمين المسجلين**: يمكنهم الوصول لجميع الصفحات

## التقنيات المستخدمة

- React 18
- React Router DOM 6
- Axios
- Vite
- Context API للـ Authentication

## ملاحظات

- تأكد من تشغيل Backend على `http://localhost:3000` (أو غيّر `VITE_API_BASE_URL`)
- يتم حفظ Token في `localStorage`
- جميع الطلبات تتضمن Token تلقائياً في Header


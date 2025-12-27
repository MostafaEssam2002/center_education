# Center Education - نظام إدارة التعليم

## المتطلبات الأساسية

**فقط Docker و Docker Compose** - لا حاجة لتثبيت أي شيء آخر!

- [Docker Desktop](https://www.docker.com/products/docker-desktop) (لنظام Windows/Mac)
- أو Docker و Docker Compose (لنظام Linux)

## كيفية التشغيل

### 1. تأكد من تثبيت Docker
افتح Terminal أو Command Prompt وتحقق من تثبيت Docker:
```bash
docker --version
docker-compose --version
```

### 2. تشغيل المشروع
افتح Terminal في مجلد المشروع وقم بتشغيل الأمر التالي:

```bash
docker-compose up -d --build
```

**ملاحظة:** في المرة الأولى قد يستغرق الأمر بضع دقائق لتحميل الصور وبناء التطبيق.

### 3. التحقق من التشغيل
بعد اكتمال البناء، يمكنك الوصول إلى:

- **التطبيق**: http://localhost:3001
- **Swagger API Documentation**: http://localhost:3001/api
- **phpMyAdmin**: http://localhost:8080

## إدارة المشروع

### عرض السجلات (Logs)
```bash
docker-compose logs -f
```

### إيقاف المشروع
```bash
docker-compose down
```

### إعادة تشغيل المشروع
```bash
docker-compose restart
```

### إيقاف وحذف جميع البيانات
```bash
docker-compose down -v
```
**تحذير:** هذا الأمر سيحذف قاعدة البيانات بالكامل!

## بيانات الاتصال

### قاعدة البيانات (MySQL)
- **Host**: `mysql` (من داخل Docker) أو `localhost` (من خارج Docker)
- **Port**: `3307` (من خارج Docker) أو `3306` (من داخل Docker)
- **Database**: `center_education`
- **Username**: `center_user`
- **Password**: `center_password`

### phpMyAdmin
- **URL**: http://localhost:8080
- **Server**: `mysql`
- **Username**: `root`
- **Password**: `rootpassword`

## حل المشاكل الشائعة

### المشروع لا يعمل
```bash
# تحقق من حالة الحاويات
docker-compose ps

# عرض السجلات للتحقق من الأخطاء
docker-compose logs app
docker-compose logs mysql
```

### إعادة بناء المشروع من الصفر
```bash
docker-compose down -v
docker-compose up -d --build
```

### مشكلة في الاتصال بقاعدة البيانات
تأكد من أن حاوية MySQL تعمل:
```bash
docker-compose ps mysql
```

إذا لم تكن تعمل:
```bash
docker-compose restart mysql
```

## ملاحظات مهمة

1. **البيانات محفوظة**: جميع بيانات قاعدة البيانات محفوظة في Docker Volume وستبقى حتى بعد إيقاف الحاويات
2. **الملفات الثابتة**: الملفات في مجلد `public` متصلة مباشرة مع الحاوية
3. **Migrations**: يتم تشغيل migrations تلقائياً عند بدء التطبيق
4. **الأمان**: في بيئة الإنتاج، يجب تغيير كلمات المرور في ملف `docker-compose.yml`

## الدعم الفني

إذا واجهت أي مشاكل، تحقق من:
- أن Docker يعمل بشكل صحيح
- أن المنافذ 3001 و 3307 و 8080 غير مستخدمة من قبل تطبيقات أخرى
- السجلات باستخدام `docker-compose logs`

### مشاكل المنافذ المستخدمة
إذا ظهرت رسالة "port is already in use":
- **المنفذ 3306**: تم تغييره إلى 3307 (لأن MySQL مثبت على جهازك)
- **المنفذ 3000**: تم تغييره إلى 3001 (لأن تطبيق آخر يستخدم 3000)
- استخدم المنافذ الجديدة للاتصال من خارج Docker

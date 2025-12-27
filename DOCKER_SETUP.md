# إعداد Docker للمشروع

## المتطلبات
- Docker
- Docker Compose

## كيفية التشغيل

### 1. بناء وتشغيل الحاويات
```bash
docker-compose up -d --build
```

### 2. عرض السجلات
```bash
docker-compose logs -f
```

### 3. إيقاف الحاويات
```bash
docker-compose down
```

### 4. إيقاف الحاويات مع حذف البيانات
```bash
docker-compose down -v
```

## الوصول إلى الخدمات

- **التطبيق**: http://localhost:3000
- **Swagger API**: http://localhost:3000/api
- **phpMyAdmin**: http://localhost:8080

## بيانات الاتصال بقاعدة البيانات

### من داخل Docker:
- Host: `mysql`
- Port: `3306`
- Database: `center_education`
- Username: `center_user`
- Password: `center_password`

### من خارج Docker (localhost):
- Host: `localhost`
- Port: `3306`
- Database: `center_education`
- Username: `center_user`
- Password: `center_password`

### phpMyAdmin:
- Server: `mysql`
- Username: `root`
- Password: `rootpassword`

## ملاحظات مهمة

1. البيانات محفوظة في volume اسمه `mysql_data` حتى بعد إيقاف الحاويات
2. الملفات الثابتة في مجلد `public` متصلة كـ volume
3. يتم تشغيل migrations تلقائياً عند بدء التطبيق
4. إذا أردت إعادة بناء قاعدة البيانات من الصفر:
   ```bash
   docker-compose down -v
   docker-compose up -d --build
   ```


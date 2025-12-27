# حل مشاكل Docker

## مشكلة TLS Handshake Timeout

إذا واجهت مشكلة `TLS handshake timeout` عند تحميل الصور، جرب الحلول التالية:

### الحل 1: إعادة المحاولة
```bash
docker-compose down
docker-compose up -d --build
```

### الحل 2: تحميل الصور يدوياً
```bash
# تحميل صور MySQL و phpMyAdmin يدوياً
docker pull mysql:8.0
docker pull phpmyadmin/phpmyadmin

# ثم تشغيل docker-compose
docker-compose up -d --build
```

### الحل 3: تغيير DNS في Docker Desktop
1. افتح Docker Desktop
2. اذهب إلى Settings > Docker Engine
3. أضف DNS servers:
```json
{
  "dns": ["8.8.8.8", "8.8.4.4"]
}
```
4. اضغط Apply & Restart

### الحل 4: استخدام VPN أو تغيير الاتصال
إذا كنت في شبكة مقيدة، جرب:
- استخدام VPN
- تغيير الاتصال بالإنترنت
- استخدام Hotspot من الهاتف

### الحل 5: تنظيف Docker
```bash
# تنظيف الصور القديمة
docker system prune -a

# ثم إعادة المحاولة
docker-compose up -d --build
```

### الحل 6: زيادة Timeout في Docker Desktop
1. افتح Docker Desktop
2. اذهب إلى Settings > Resources > Advanced
3. تأكد من أن Memory و CPU كافية

### الحل 7: استخدام صور بديلة (إذا استمرت المشكلة)
يمكنك تعديل docker-compose.yml لاستخدام صور من مصادر أخرى أو نسخ محلية.


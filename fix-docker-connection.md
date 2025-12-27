# حل مشكلة TLS Handshake Timeout في Docker

## الحل السريع (الأفضل)

### 1. تغيير DNS في Docker Desktop

1. افتح **Docker Desktop**
2. اذهب إلى **Settings** (الإعدادات)
3. اختر **Docker Engine**
4. أضف هذا الكود في JSON:

```json
{
  "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"],
  "registry-mirrors": []
}
```

5. اضغط **Apply & Restart**
6. انتظر حتى يعيد Docker التشغيل
7. جرب مرة أخرى: `docker-compose up -d --build`

---

## حلول أخرى

### الحل 2: تحميل الصور يدوياً

افتح Terminal جديد واكتب هذه الأوامر واحداً تلو الآخر:

```bash
docker pull mysql:8.0
docker pull phpmyadmin/phpmyadmin
docker pull node:20-alpine
```

بعد تحميل الصور، جرب:
```bash
docker-compose up -d --build
```

### الحل 3: استخدام VPN

إذا كنت في شبكة مقيدة:
- استخدم VPN
- أو استخدم Hotspot من هاتفك

### الحل 4: إعادة تشغيل Docker

```bash
# إيقاف Docker Desktop
# ثم إعادة تشغيله
# ثم جرب مرة أخرى
docker-compose up -d --build
```

### الحل 5: تنظيف Docker

```bash
docker system prune -a
docker-compose up -d --build
```

### الحل 6: زيادة Timeout

في Docker Desktop > Settings > Resources:
- تأكد من أن Memory كافية (4GB على الأقل)
- تأكد من أن CPU كافي

---

## إذا استمرت المشكلة

### استخدام صور بديلة (أصغر حجماً)

يمكنك تعديل `docker-compose.yml` لاستخدام:
- `mysql:8.0-alpine` بدلاً من `mysql:8.0` (أصغر)
- لكن هذا قد يحتاج تعديلات إضافية

---

## ملاحظة مهمة

المشكلة عادة تكون بسبب:
- اتصال إنترنت بطيء أو غير مستقر
- DNS لا يعمل بشكل صحيح
- Firewall أو Proxy يمنع الاتصال

الحل الأول (تغيير DNS) يحل المشكلة في 90% من الحالات.


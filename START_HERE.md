🚀 ابدأ من هنا - تعليمات سريعة
المتطلبات الوحيدة
Docker Desktop فقط (لا حاجة لأي شيء آخر!)
خطوة واحدة للتشغيل
افتح Terminal في مجلد المشروع واكتب:

docker-compose up -d --build -d
انتظر حتى ينتهي البناء (قد يستغرق 5-10 دقائق في المرة الأولى).

الوصول للتطبيق
بعد اكتمال البناء، افتح المتصفح واذهب إلى:

✅ التطبيق: http://localhost:3001
✅ API Documentation: http://localhost:3001/api
✅ phpMyAdmin: http://localhost:8080
إيقاف المشروع
docker-compose down
إعادة التشغيل
docker-compose restart
ملاحظة: إذا واجهت أي مشاكل، راجع ملف README.md للحصول على تفاصيل أكثر.
#!/bin/bash

echo "========================================"
echo "تحميل صور Docker المطلوبة"
echo "========================================"
echo ""

echo "[1/3] تحميل MySQL..."
docker pull mysql:8.0
if [ $? -ne 0 ]; then
    echo "فشل تحميل MySQL"
    exit 1
fi

echo ""
echo "[2/3] تحميل phpMyAdmin..."
docker pull phpmyadmin/phpmyadmin
if [ $? -ne 0 ]; then
    echo "فشل تحميل phpMyAdmin"
    exit 1
fi

echo ""
echo "[3/3] تحميل Node.js..."
docker pull node:20-alpine
if [ $? -ne 0 ]; then
    echo "فشل تحميل Node.js"
    exit 1
fi

echo ""
echo "========================================"
echo "تم تحميل جميع الصور بنجاح!"
echo "الآن يمكنك تشغيل: docker-compose up -d --build"
echo "========================================"


@echo off
echo ========================================
echo تحميل صور Docker المطلوبة
echo ========================================
echo.

echo [1/3] تحميل MySQL...
docker pull mysql:8.0
if %errorlevel% neq 0 (
    echo فشل تحميل MySQL
    pause
    exit /b 1
)

echo.
echo [2/3] تحميل phpMyAdmin...
docker pull phpmyadmin/phpmyadmin
if %errorlevel% neq 0 (
    echo فشل تحميل phpMyAdmin
    pause
    exit /b 1
)

echo.
echo [3/3] تحميل Node.js...
docker pull node:20-alpine
if %errorlevel% neq 0 (
    echo فشل تحميل Node.js
    pause
    exit /b 1
)

echo.
echo ========================================
echo تم تحميل جميع الصور بنجاح!
echo الآن يمكنك تشغيل: docker-compose up -d --build
echo ========================================
pause


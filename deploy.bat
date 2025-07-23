@echo off
echo ========================================
echo   🚀 AUTOMATISCHES DEPLOYMENT STARTEN
echo ========================================
echo.

echo 📝 Füge alle Änderungen hinzu...
git add .

echo.
set /p commit_message="💬 Commit-Nachricht (oder Enter für automatische): "
if "%commit_message%"=="" set commit_message=Update %date% %time%

echo.
echo 📦 Erstelle Commit...
git commit -m "%commit_message%"

echo.
echo 🚀 Pushe zu GitHub...
git push origin main

echo.
echo ========================================
echo   ✅ DEPLOYMENT GESTARTET!
echo ========================================
echo.
echo 🌐 Deine Website wird in 2-3 Minuten automatisch aktualisiert!
echo 📱 Du kannst den Fortschritt hier verfolgen:
echo    https://github.com/YOUR_USERNAME/clan-dashboard/actions
echo.
echo ⏰ Warte ein paar Minuten und besuche dann deine Website.
echo.
pause

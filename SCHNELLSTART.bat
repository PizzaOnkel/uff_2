@echo off
echo ========================================
echo   CLAN DASHBOARD - SCHNELLSTART
echo ========================================
echo.
echo Starte Clan Dashboard...
echo.
cd /d "c:\Users\user\Desktop\clan-dashboard\uff_2"

echo Prüfe Node.js...
node --version
if %errorlevel% neq 0 (
    echo FEHLER: Node.js nicht gefunden!
    echo Bitte installieren Sie Node.js von https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Starte Anwendung...
echo.
echo Öffne Browser automatisch in 10 Sekunden...
echo Drücken Sie Ctrl+C um abzubrechen
echo.

start /min cmd /c "timeout /t 10 /nobreak >nul & start http://localhost:3000"

npm start

echo.
echo Anwendung beendet.
pause

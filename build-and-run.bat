@echo off
echo Erstelle neue Build-Version...
cd /d "c:\Users\user\Desktop\clan-dashboard\uff_2"
npm run build
if %errorlevel% neq 0 (
    echo Fehler beim Build!
    pause
    exit /b 1
)
echo Build erfolgreich!
echo Öffne die Anwendung...
start "" "build\index.html"
pause

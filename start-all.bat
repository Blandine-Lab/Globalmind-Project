@echo off
echo === Globalmind SmartWatch - Demarrage ===
start "SmartWatch Backend" cmd /k "%~dp0start-backend.bat"
timeout /t 2 /nobreak >nul
start "SmartWatch Frontend" cmd /k "%~dp0start-frontend.bat"
echo.
echo Deux fenetres ouvertes : backend (8000) et frontend (3000).
timeout /t 3 /nobreak >nul
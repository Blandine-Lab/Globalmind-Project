@echo off
cd /d "%~dp0backend"
call .venv\Scripts\activate.bat
echo === Globalmind SmartWatch - Backend ===
echo API : http://localhost:8000
echo Swagger : http://localhost:8000/docs
echo.
uvicorn app.main:app --reload --port 8000
pause
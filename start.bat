@echo off
cd /d "%~dp0backend"
.\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 3000
pause
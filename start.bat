@echo off
cd /d C:\Users\MJ\Desktop\bussiness\clone_gojiberry\backend
.\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 3000
pause
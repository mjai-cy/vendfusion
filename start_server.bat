@echo off
cd /d C:\Users\MJ\Desktop\bussiness\clone_gojiberry\backend
echo Starting VendFusion Server...
.\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000
pause
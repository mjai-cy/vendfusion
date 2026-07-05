import uvicorn
import os

# Kill any existing server
os.system("taskkill /F /IM python.exe 2>nul")

# Delete old database
if os.path.exists("oppora.db"):
    os.remove("oppora.db")

# Start fresh server
uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=False)

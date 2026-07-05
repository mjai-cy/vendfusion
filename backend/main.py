from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from database import init_db
from routers import auth, leads, campaigns, ai, mailboxes, dashboard, crm
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="VendFusion API",
    description="AI-Powered Outbound Sales Platform",
    version="1.0.0"
)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:8000,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(campaigns.router)
app.include_router(ai.router)
app.include_router(mailboxes.router)
app.include_router(dashboard.router)
app.include_router(crm.router)

frontend_path = os.path.join(os.path.dirname(__file__), "..")

if os.path.exists(os.path.join(frontend_path, "index.html")):
    app.mount("/static", StaticFiles(directory=frontend_path), name="static")
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_path, "assets")), name="assets")


@app.get("/app.js")
def serve_app_js():
    js_path = os.path.join(frontend_path, "app.js")
    if os.path.exists(js_path):
        return FileResponse(js_path, media_type="application/javascript")
    return {"detail": "Not Found"}


@app.get("/dashboard.html")
def serve_dashboard_html():
    dash_path = os.path.join(frontend_path, "dashboard.html")
    if os.path.exists(dash_path):
        return FileResponse(dash_path)
    return {"detail": "Not Found"}


@app.on_event("startup")
def startup():
    init_db()
    print("=" * 50)
    print("VendFusion API Server Started")
    print("=" * 50)
    print(f"Frontend: http://localhost:8000")
    print(f"API Docs: http://localhost:8000/docs")
    print(f"Database: {os.getenv('DATABASE_URL', 'sqlite')[:30]}...")
    print(f"AI Service: {'Gemini' if os.getenv('GEMINI_API_KEY') else 'Template'}")
    print(f"Email: {os.getenv('SMTP_HOST', 'Not configured')}")
    print("=" * 50)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "VendFusion API",
        "version": "1.0.0",
        "features": {
            "ai": bool(os.getenv("GEMINI_API_KEY")),
            "email": bool(os.getenv("SMTP_HOST")),
            "hubspot": bool(os.getenv("HUBSPOT_PRIVATE_APP_TOKEN")),
            "zoho": bool(os.getenv("ZOHO_CLIENT_ID")),
        }
    }


@app.get("/")
def serve_frontend():
    index_path = os.path.join(frontend_path, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "VendFusion API is running. Visit /docs for API documentation."}


@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    api_prefixes = ["api", "docs", "redoc", "openapi.json"]
    if any(full_path.startswith(p) for p in api_prefixes):
        return {"detail": "Not Found"}
    if full_path.startswith("static/") or full_path.startswith("assets/"):
        return {"detail": "Not Found"}
    app_routes = ["dashboard", "leads", "campaigns", "mailboxes", "ideal-customer",
                   "lists", "ai-workflow", "finder", "email-accounts", "unibox",
                   "linkedin", "crm", "reports", "settings", "integrations", "setup-guide"]
    first_segment = full_path.split("/")[0] if full_path else ""
    if first_segment in app_routes:
        dash_path = os.path.join(frontend_path, "dashboard.html")
        if os.path.exists(dash_path):
            return FileResponse(dash_path)
    index_path = os.path.join(frontend_path, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"detail": "Not Found"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

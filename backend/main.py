from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.config import settings
from core.database import create_tables
from routers import auth, doctors, appointments, payments, chatbot, admin, receipts, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


app = FastAPI(
    title="CliniSmile AI API",
    description="AI-Powered Dental Web Application",
    version="1.0.0",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan,
)

# ── CORS MUST BE FIRST MIDDLEWARE ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        settings.FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,
)

PREFIX = "/api/v1"
app.include_router(auth.router,         prefix=PREFIX)
app.include_router(users.router,        prefix=PREFIX)   
app.include_router(doctors.router,      prefix=PREFIX)
app.include_router(appointments.router, prefix=PREFIX)
app.include_router(payments.router,     prefix=PREFIX)
app.include_router(chatbot.router,      prefix=PREFIX)
app.include_router(admin.router,        prefix=PREFIX)
app.include_router(receipts.router,     prefix=PREFIX)


@app.get("/")
async def root():
    return {
        "message": "CliniSmile AI API is running",
        "docs": "/api/v1/docs",
        "version": "1.0.0",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
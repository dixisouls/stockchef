from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.api import auth, users, inventory, recipes
from app.db.database import create_tables
from app.config import limiter

app = FastAPI(title="StockChef API", description="API for StockChef recipe generator")

# Set up rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# CORS settings
origins = [
    "http://localhost:3000",  # React frontend
    "http://localhost:8000",
    "https://stockchef-frontend.vercel.app",  # Production frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(inventory.router, prefix="/api")
app.include_router(recipes.router, prefix="/api")

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.on_event("startup")
async def startup():
    # Create tables if they don't exist
    create_tables()


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "StockChef API is running"}


@app.get("/")
async def root():
    return {
        "message": "Welcome to StockChef API",
        "version": "1.0.0",
        "documentation": "/docs",
    }

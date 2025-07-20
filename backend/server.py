from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager

# Import database functions
from .database import connect_to_mongo, close_mongo_connection

# Import routers
from .routers import words, audio, users, quiz, tiers

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan"""
    # Startup
    await connect_to_mongo()
    logger.info("Somali Learning PWA backend started")
    
    yield
    
    # Shutdown
    await close_mongo_connection()
    logger.info("Somali Learning PWA backend stopped")

# Create the main app with lifespan management
app = FastAPI(
    title="Somali Learning PWA API",
    description="Backend API for the Somali language learning progressive web app",
    version="1.0.0",
    lifespan=lifespan
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoint
@api_router.get("/")
async def root():
    return {
        "message": "Somali Learning PWA API",
        "version": "1.0.0",
        "status": "active"
    }

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "somali-learning-pwa",
        "version": "1.0.0"
    }

# Include all routers
api_router.include_router(words.router, prefix="/somali", tags=["Words"])
api_router.include_router(audio.router, prefix="/tts", tags=["Text-to-Speech"])
api_router.include_router(users.router, prefix="/progress", tags=["User Progress"])
api_router.include_router(quiz.router, prefix="/quiz", tags=["Quizzes"])
api_router.include_router(tiers.router, prefix="/tiers", tags=["Learning Tiers"])

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

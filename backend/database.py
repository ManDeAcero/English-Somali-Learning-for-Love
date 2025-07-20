from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import os
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class Database:
    client: Optional[AsyncIOMotorClient] = None
    database: Optional[AsyncIOMotorDatabase] = None

database = Database()

async def connect_to_mongo():
    """Create database connection"""
    try:
        mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
        db_name = os.getenv("DB_NAME", "somali_learning_pwa")
        
        logger.info(f"Connecting to MongoDB at {mongo_url}")
        
        database.client = AsyncIOMotorClient(mongo_url)
        database.database = database.client[db_name]
        
        # Test the connection
        await database.client.admin.command('ping')
        logger.info(f"Successfully connected to MongoDB database: {db_name}")
        
        # Create indexes
        await create_indexes()
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise

async def create_indexes():
    """Create database indexes for better performance"""
    try:
        if database.database is None:
            return
        
        # Somali words indexes
        await database.database.somali_words.create_index("tier")
        await database.database.somali_words.create_index("category") 
        await database.database.somali_words.create_index([
            ("somali", "text"),
            ("english", "text"),
            ("tags", "text")
        ])
        
        # User progress indexes
        await database.database.user_progress.create_index("user_id", unique=True)
        await database.database.user_progress.create_index("last_activity")
        
        # Audio cache indexes
        await database.database.audio_cache.create_index("cache_key", unique=True)
        await database.database.audio_cache.create_index(
            "created_at", 
            expireAfterSeconds=30 * 24 * 60 * 60  # 30 days TTL
        )
        
        # Quiz sessions indexes
        await database.database.quiz_sessions.create_index("user_id")
        await database.database.quiz_sessions.create_index("started_at")
        await database.database.quiz_sessions.create_index("completed_at")
        
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.error(f"Error creating database indexes: {e}")

async def close_mongo_connection():
    """Close database connection"""
    try:
        if database.client:
            database.client.close()
            logger.info("Database connection closed")
    except Exception as e:
        logger.error(f"Error closing database connection: {e}")

def get_database() -> AsyncIOMotorDatabase:
    """Get database instance for dependency injection"""
    if database.database is None:
        raise RuntimeError("Database not initialized")
    return database.database
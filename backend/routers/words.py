from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
import logging

from models.somali_models import SomaliWord, SomaliWordCreate
from database import get_database
from data.somali_vocabulary import SOMALI_VOCABULARY

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/words", response_model=List[SomaliWord])
async def get_words(
    tier: Optional[int] = Query(None, description="Filter by tier"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: Optional[int] = Query(100, description="Limit number of results"),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get Somali words with optional filtering"""
    try:
        # Build query
        query = {}
        if tier:
            query["tier"] = tier
        if category:
            query["category"] = category
        
        # Fetch from database
        cursor = db.somali_words.find(query).limit(limit)
        words = await cursor.to_list(length=None)
        
        # Convert to SomaliWord objects
        result = [SomaliWord(**word) for word in words]
        
        logger.info(f"Retrieved {len(result)} words with query: {query}")
        return result
        
    except Exception as e:
        logger.error(f"Error retrieving words: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve words")

@router.get("/words/{word_id}", response_model=SomaliWord)
async def get_word(word_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    """Get a specific Somali word by ID"""
    try:
        word = await db.somali_words.find_one({"id": word_id})
        if not word:
            raise HTTPException(status_code=404, detail="Word not found")
        
        return SomaliWord(**word)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving word {word_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve word")

@router.post("/words/seed")
async def seed_vocabulary(db: AsyncIOMotorDatabase = Depends(get_database)):
    """Seed the database with initial Somali vocabulary"""
    try:
        # Check if already seeded
        existing_count = await db.somali_words.count_documents({})
        if existing_count > 0:
            return {"message": f"Database already contains {existing_count} words", "seeded": False}
        
        # Convert vocabulary data to word objects
        words_to_insert = []
        for vocab_data in SOMALI_VOCABULARY:
            word = SomaliWordCreate(**vocab_data)
            word_dict = word.dict()
            word_dict["id"] = f"word_{len(words_to_insert) + 1}"
            word_dict["created_at"] = datetime.utcnow()
            words_to_insert.append(word_dict)
        
        # Insert into database
        result = await db.somali_words.insert_many(words_to_insert)
        
        logger.info(f"Seeded database with {len(result.inserted_ids)} words")
        return {
            "message": f"Successfully seeded {len(result.inserted_ids)} words",
            "seeded": True,
            "word_count": len(result.inserted_ids)
        }
    
    except Exception as e:
        logger.error(f"Error seeding vocabulary: {e}")
        raise HTTPException(status_code=500, detail="Failed to seed vocabulary")

@router.get("/words/tier/{tier_id}")
async def get_tier_words(
    tier_id: int, 
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all words for a specific tier"""
    try:
        words = await db.somali_words.find({"tier": tier_id}).to_list(length=None)
        result = [SomaliWord(**word) for word in words]
        
        return {
            "tier": tier_id,
            "word_count": len(result),
            "words": result
        }
    
    except Exception as e:
        logger.error(f"Error retrieving tier {tier_id} words: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve tier {tier_id} words")

@router.get("/words/category/{category}")
async def get_category_words(
    category: str,
    tier: Optional[int] = Query(None, description="Filter by tier within category"),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all words for a specific category"""
    try:
        query = {"category": category}
        if tier:
            query["tier"] = tier
            
        words = await db.somali_words.find(query).to_list(length=None)
        result = [SomaliWord(**word) for word in words]
        
        return {
            "category": category,
            "tier": tier,
            "word_count": len(result),
            "words": result
        }
    
    except Exception as e:
        logger.error(f"Error retrieving category {category} words: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve {category} words")

@router.get("/search")
async def search_words(
    q: str = Query(..., description="Search query"),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Search words by Somali text, English translation, or tags"""
    try:
        # Create text search query
        search_query = {
            "$or": [
                {"somali": {"$regex": q, "$options": "i"}},
                {"english": {"$regex": q, "$options": "i"}},
                {"tags": {"$in": [q.lower()]}},
                {"phonetic": {"$regex": q, "$options": "i"}}
            ]
        }
        
        words = await db.somali_words.find(search_query).to_list(length=50)
        result = [SomaliWord(**word) for word in words]
        
        return {
            "query": q,
            "results": len(result),
            "words": result
        }
    
    except Exception as e:
        logger.error(f"Error searching words with query '{q}': {e}")
        raise HTTPException(status_code=500, detail="Search failed")

@router.get("/categories")
async def get_categories(db: AsyncIOMotorDatabase = Depends(get_database)):
    """Get all available word categories with counts"""
    try:
        pipeline = [
            {
                "$group": {
                    "_id": "$category",
                    "count": {"$sum": 1},
                    "tiers": {"$addToSet": "$tier"}
                }
            },
            {
                "$sort": {"_id": 1}
            }
        ]
        
        categories = await db.somali_words.aggregate(pipeline).to_list(length=None)
        
        # Add category icons
        category_icons = {
            "basic": "🌟",
            "greetings": "👋", 
            "cute_tease": "😊",
            "compliments": "💝",
            "deep_talk": "💭"
        }
        
        result = []
        for cat in categories:
            result.append({
                "id": cat["_id"],
                "name": cat["_id"].replace("_", " ").title(),
                "icon": category_icons.get(cat["_id"], "📝"),
                "word_count": cat["count"],
                "tiers": sorted(cat["tiers"])
            })
        
        return {"categories": result}
    
    except Exception as e:
        logger.error(f"Error retrieving categories: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve categories")
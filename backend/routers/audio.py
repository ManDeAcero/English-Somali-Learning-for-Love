from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
import logging

from models.somali_models import AudioRequest, AudioResponse
from services.tts_service import tts_service
from database import get_database

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/audio/synthesize", response_model=AudioResponse)
async def synthesize_audio(
    request: AudioRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Generate Somali audio pronunciation with caching"""
    try:
        # Generate cache key
        cache_key = tts_service.generate_cache_key(request.text, request.speed)
        
        # Check cache first
        cached_audio = await db.audio_cache.find_one({"cache_key": cache_key})
        if cached_audio:
            logger.info(f"Serving cached audio for: {request.text[:50]}...")
            return AudioResponse(
                audio_content=cached_audio["audio_content"],
                cache_key=cache_key,
                duration_seconds=cached_audio.get("duration_seconds")
            )
        
        # Generate new audio
        audio_content, _ = await tts_service.synthesize_speech(
            text=request.text,
            speed=request.speed
        )
        
        # Estimate duration
        duration = tts_service.estimate_audio_duration(request.text, request.speed)
        
        # Cache the audio
        cache_document = {
            "cache_key": cache_key,
            "text": request.text,
            "speed": request.speed,
            "audio_content": audio_content,
            "duration_seconds": duration,
            "created_at": datetime.utcnow(),
            "access_count": 1
        }
        
        await db.audio_cache.insert_one(cache_document)
        
        # Create TTL index for automatic cleanup (30 days)
        await db.audio_cache.create_index(
            "created_at",
            expireAfterSeconds=30 * 24 * 60 * 60  # 30 days
        )
        
        logger.info(f"Generated and cached new audio for: {request.text[:50]}...")
        
        return AudioResponse(
            audio_content=audio_content,
            cache_key=cache_key,
            duration_seconds=duration
        )
    
    except Exception as e:
        logger.error(f"Error synthesizing audio: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to generate audio: {str(e)}"
        )

@router.get("/audio/cache-stats")
async def get_cache_stats(db: AsyncIOMotorDatabase = Depends(get_database)):
    """Get audio cache statistics"""
    try:
        total_cached = await db.audio_cache.count_documents({})
        
        # Get cache usage stats
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_items": {"$sum": 1},
                    "total_access_count": {"$sum": "$access_count"},
                    "avg_access_count": {"$avg": "$access_count"}
                }
            }
        ]
        
        stats = await db.audio_cache.aggregate(pipeline).to_list(length=1)
        cache_stats = stats[0] if stats else {
            "total_items": 0,
            "total_access_count": 0,
            "avg_access_count": 0
        }
        
        # Get speed distribution
        speed_pipeline = [
            {
                "$group": {
                    "_id": "$speed",
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id": 1}}
        ]
        
        speed_dist = await db.audio_cache.aggregate(speed_pipeline).to_list(length=None)
        
        return {
            "total_cached_items": total_cached,
            "total_access_count": cache_stats["total_access_count"],
            "average_access_count": round(cache_stats["avg_access_count"], 2),
            "speed_distribution": speed_dist,
            "cache_hit_rate": "N/A"  # Would need request tracking to calculate
        }
    
    except Exception as e:
        logger.error(f"Error retrieving cache stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve cache statistics")

@router.delete("/audio/cache-clear")
async def clear_audio_cache(db: AsyncIOMotorDatabase = Depends(get_database)):
    """Clear the audio cache (admin function)"""
    try:
        result = await db.audio_cache.delete_many({})
        logger.info(f"Cleared {result.deleted_count} items from audio cache")
        
        return {
            "message": f"Cleared {result.deleted_count} cached audio items",
            "cleared_count": result.deleted_count
        }
    
    except Exception as e:
        logger.error(f"Error clearing audio cache: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear audio cache")

@router.post("/audio/pregenerate")
async def pregenerate_common_audio(db: AsyncIOMotorDatabase = Depends(get_database)):
    """Pre-generate audio for common words to improve performance"""
    try:
        # Get most common words (tier 1 and 2)
        common_words = await db.somali_words.find(
            {"tier": {"$in": [1, 2]}}
        ).to_list(length=None)
        
        generated_count = 0
        speeds = [1.0, 0.7, 0.4]  # Normal, Slow, Ultra Slow
        
        for word in common_words:
            for speed in speeds:
                cache_key = tts_service.generate_cache_key(word["somali"], speed)
                
                # Check if already cached
                existing = await db.audio_cache.find_one({"cache_key": cache_key})
                if existing:
                    continue
                
                try:
                    # Generate audio
                    audio_content, _ = await tts_service.synthesize_speech(
                        text=word["somali"],
                        speed=speed
                    )
                    
                    duration = tts_service.estimate_audio_duration(word["somali"], speed)
                    
                    # Cache it
                    cache_document = {
                        "cache_key": cache_key,
                        "text": word["somali"],
                        "speed": speed,
                        "audio_content": audio_content,
                        "duration_seconds": duration,
                        "created_at": datetime.utcnow(),
                        "access_count": 0,
                        "pregenerated": True
                    }
                    
                    await db.audio_cache.insert_one(cache_document)
                    generated_count += 1
                    
                    logger.info(f"Pre-generated audio for: {word['somali']} at speed {speed}")
                
                except Exception as e:
                    logger.warning(f"Failed to pre-generate audio for {word['somali']}: {e}")
                    continue
        
        return {
            "message": f"Pre-generated {generated_count} audio files",
            "generated_count": generated_count,
            "total_words_processed": len(common_words),
            "speeds_generated": speeds
        }
    
    except Exception as e:
        logger.error(f"Error pre-generating audio: {e}")
        raise HTTPException(status_code=500, detail="Failed to pre-generate audio")
from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
import logging

from database import get_database
from data.somali_vocabulary import TIER_DEFINITIONS, CULTURAL_RESPECT_MESSAGES

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/tiers")
async def get_all_tiers(db: AsyncIOMotorDatabase = Depends(get_database)):
    """Get all tier definitions with current word counts"""
    try:
        # Get actual word counts from database
        tier_counts = {}
        for tier_id in range(1, 6):  # Tiers 1-5
            count = await db.somali_words.count_documents({"tier": tier_id})
            tier_counts[tier_id] = count
        
        # Enhance tier definitions with actual counts
        enhanced_tiers = []
        for tier in TIER_DEFINITIONS:
            tier_data = tier.copy()
            tier_data["actual_word_count"] = tier_counts.get(tier["id"], 0)
            enhanced_tiers.append(tier_data)
        
        return {
            "tiers": enhanced_tiers,
            "total_tiers": len(enhanced_tiers)
        }
    
    except Exception as e:
        logger.error(f"Error retrieving tiers: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve tiers")

@router.get("/tiers/{tier_id}")
async def get_tier_details(
    tier_id: int,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get detailed information about a specific tier"""
    try:
        # Find tier definition
        tier_def = None
        for tier in TIER_DEFINITIONS:
            if tier["id"] == tier_id:
                tier_def = tier
                break
        
        if not tier_def:
            raise HTTPException(status_code=404, detail="Tier not found")
        
        # Get words for this tier
        words = await db.somali_words.find({"tier": tier_id}).to_list(length=None)
        
        # Get category breakdown
        categories = {}
        for word in words:
            category = word["category"]
            if category not in categories:
                categories[category] = 0
            categories[category] += 1
        
        # Get difficulty breakdown
        difficulties = {}
        for word in words:
            difficulty = word["difficulty"]
            if difficulty not in difficulties:
                difficulties[difficulty] = 0
            difficulties[difficulty] += 1
        
        # Check if tier has cultural content
        cultural_info = None
        if tier_id in CULTURAL_RESPECT_MESSAGES:
            cultural_info = CULTURAL_RESPECT_MESSAGES[tier_id]
        
        return {
            "tier": tier_def,
            "word_count": len(words),
            "category_breakdown": categories,
            "difficulty_breakdown": difficulties,
            "cultural_sensitivity": cultural_info,
            "sample_words": words[:3] if words else []  # First 3 words as preview
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving tier {tier_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve tier {tier_id}")

@router.get("/tiers/check-unlock/{tier_id}")
async def check_tier_unlock(
    tier_id: int,
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Check if a user can unlock a specific tier"""
    try:
        # Get tier definition
        tier_def = None
        for tier in TIER_DEFINITIONS:
            if tier["id"] == tier_id:
                tier_def = tier
                break
        
        if not tier_def:
            raise HTTPException(status_code=404, detail="Tier not found")
        
        # Get user progress
        progress = await db.user_progress.find_one({"user_id": user_id})
        if not progress:
            return {
                "can_unlock": False,
                "reason": "User progress not found",
                "requirements": tier_def["unlock_requirements"]
            }
        
        requirements = tier_def["unlock_requirements"]
        can_unlock = True
        missing_requirements = []
        
        # Check point requirements
        required_points = requirements.get("points", 0)
        user_points = progress.get("total_points", 0)
        if user_points < required_points:
            can_unlock = False
            missing_requirements.append({
                "type": "points",
                "required": required_points,
                "current": user_points,
                "missing": required_points - user_points
            })
        
        # Check previous tier completion
        required_prev_tier = requirements.get("completed_tier")
        if required_prev_tier:
            unlocked_tiers = progress.get("unlocked_tiers", [])
            if required_prev_tier not in unlocked_tiers:
                can_unlock = False
                missing_requirements.append({
                    "type": "previous_tier",
                    "required": required_prev_tier,
                    "message": f"Must complete Tier {required_prev_tier} first"
                })
        
        # Check cultural acknowledgment
        requires_cultural = requirements.get("cultural_acknowledgment", False)
        if requires_cultural:
            cultural_acks = progress.get("cultural_acknowledgments", [])
            if tier_id not in cultural_acks:
                can_unlock = False
                missing_requirements.append({
                    "type": "cultural_acknowledgment", 
                    "required": tier_id,
                    "message": "Must acknowledge cultural sensitivity guidelines"
                })
        
        return {
            "tier_id": tier_id,
            "tier_name": tier_def["name"],
            "can_unlock": can_unlock,
            "already_unlocked": tier_id in progress.get("unlocked_tiers", []),
            "requirements": requirements,
            "missing_requirements": missing_requirements,
            "cultural_info": CULTURAL_RESPECT_MESSAGES.get(tier_id)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking tier unlock for tier {tier_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to check tier unlock status")

@router.post("/tiers/{tier_id}/cultural-acknowledge")
async def acknowledge_cultural_guidelines(
    tier_id: int,
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Acknowledge cultural sensitivity guidelines for a tier"""
    try:
        # Verify tier has cultural content
        if tier_id not in CULTURAL_RESPECT_MESSAGES:
            raise HTTPException(
                status_code=400, 
                detail="This tier does not require cultural acknowledgment"
            )
        
        # Get user progress
        progress = await db.user_progress.find_one({"user_id": user_id})
        if not progress:
            raise HTTPException(status_code=404, detail="User progress not found")
        
        # Add cultural acknowledgment
        cultural_acks = progress.get("cultural_acknowledgments", [])
        if tier_id not in cultural_acks:
            cultural_acks.append(tier_id)
            
            # Update database
            await db.user_progress.update_one(
                {"user_id": user_id},
                {
                    "$set": {"cultural_acknowledgments": cultural_acks},
                    "$currentDate": {"updated_at": True}
                }
            )
        
        # Check if this unlocks the tier
        unlock_result = await check_tier_unlock(tier_id, user_id, db)
        
        logger.info(f"User {user_id} acknowledged cultural guidelines for tier {tier_id}")
        
        return {
            "tier_id": tier_id,
            "acknowledged": True,
            "can_now_unlock": unlock_result["can_unlock"],
            "cultural_message": CULTURAL_RESPECT_MESSAGES[tier_id]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error acknowledging cultural guidelines: {e}")
        raise HTTPException(status_code=500, detail="Failed to acknowledge cultural guidelines")

@router.get("/cultural-guidelines/{tier_id}")
async def get_cultural_guidelines(tier_id: int):
    """Get cultural sensitivity guidelines for a tier"""
    try:
        if tier_id not in CULTURAL_RESPECT_MESSAGES:
            raise HTTPException(
                status_code=404, 
                detail="No cultural guidelines found for this tier"
            )
        
        return {
            "tier_id": tier_id,
            "guidelines": CULTURAL_RESPECT_MESSAGES[tier_id]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving cultural guidelines: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve cultural guidelines")
from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from datetime import datetime
import logging

from ..models.somali_models import UserProgress, UserProgressUpdate, UserStats
from ..database import get_database
from ..data.somali_vocabulary import TIER_DEFINITIONS

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/users/{user_id}/progress", response_model=UserProgress)
async def create_user_progress(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create initial progress for a user"""
    try:
        # Check if user already exists
        existing_user = await db.user_progress.find_one({"user_id": user_id})
        if existing_user:
            return UserProgress(**existing_user)
        
        # Create new user progress
        user_progress = UserProgress(
            user_id=user_id,
            level=1,
            total_points=0,
            current_streak=0,
            longest_streak=0,
            unlocked_tiers=[1],
            completed_words=[],
            favorites=[],
            badges_earned=["newcomer"],
            quiz_scores=[],
            cultural_acknowledgments=[]
        )
        
        await db.user_progress.insert_one(user_progress.dict())
        logger.info(f"Created progress for user {user_id}")
        
        return user_progress
    
    except Exception as e:
        logger.error(f"Error creating user progress: {e}")
        raise HTTPException(status_code=500, detail="Failed to create user progress")

@router.get("/users/{user_id}/progress", response_model=UserProgress)
async def get_user_progress(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get user progress"""
    try:
        progress = await db.user_progress.find_one({"user_id": user_id})
        if not progress:
            # Create new user if doesn't exist
            return await create_user_progress(user_id, db)
        
        return UserProgress(**progress)
    
    except Exception as e:
        logger.error(f"Error retrieving user progress: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve user progress")

@router.put("/users/{user_id}/progress", response_model=UserProgress)
async def update_user_progress(
    user_id: str,
    update: UserProgressUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update user progress"""
    try:
        # Get current progress
        current_progress = await db.user_progress.find_one({"user_id": user_id})
        if not current_progress:
            raise HTTPException(status_code=404, detail="User progress not found")
        
        progress = UserProgress(**current_progress)
        
        # Handle word completion
        if update.word_completed and update.points_earned:
            if update.word_completed not in progress.completed_words:
                progress.completed_words.append(update.word_completed)
                progress.total_points += update.points_earned
                
                # Update streak
                progress.current_streak += 1
                if progress.current_streak > progress.longest_streak:
                    progress.longest_streak = progress.current_streak
                
                # Check for level up
                new_level = (progress.total_points // 100) + 1
                if new_level > progress.level:
                    progress.level = new_level
                    # Award level up badge
                    level_badge = f"level_{new_level}"
                    if level_badge not in progress.badges_earned:
                        progress.badges_earned.append(level_badge)
                
                # Check for tier unlocks
                unlocked_new_tier = False
                for tier in TIER_DEFINITIONS:
                    tier_id = tier["id"]
                    if tier_id not in progress.unlocked_tiers:
                        requirements = tier["unlock_requirements"]
                        
                        # Check point requirements
                        if progress.total_points >= requirements.get("points", 0):
                            # Check if previous tier completed (if required)
                            prev_tier = requirements.get("completed_tier")
                            if not prev_tier or prev_tier in progress.unlocked_tiers:
                                # Check cultural acknowledgment (for sensitive tiers)
                                cultural_req = requirements.get("cultural_acknowledgment", False)
                                if not cultural_req or tier_id in progress.cultural_acknowledgments:
                                    progress.unlocked_tiers.append(tier_id)
                                    unlocked_new_tier = True
                
                if unlocked_new_tier:
                    # Award tier unlock badge
                    if "tier_master" not in progress.badges_earned:
                        progress.badges_earned.append("tier_master")
        
        # Handle favorite toggle
        if update.favorite_toggled:
            word_id = update.favorite_toggled
            if word_id in progress.favorites:
                progress.favorites.remove(word_id)
            else:
                progress.favorites.append(word_id)
                # Award first favorite badge
                if len(progress.favorites) == 1 and "first_favorite" not in progress.badges_earned:
                    progress.badges_earned.append("first_favorite")
        
        # Handle quiz completion
        if update.quiz_completed:
            progress.quiz_scores.append(update.quiz_completed)
            
            # Award quiz badges
            quiz_count = len(progress.quiz_scores)
            if quiz_count == 1 and "first_quiz" not in progress.badges_earned:
                progress.badges_earned.append("first_quiz")
            elif quiz_count == 10 and "quiz_master" not in progress.badges_earned:
                progress.badges_earned.append("quiz_master")
        
        # Handle cultural acknowledgment
        if update.cultural_tier_acknowledged:
            tier_id = update.cultural_tier_acknowledged
            if tier_id not in progress.cultural_acknowledgments:
                progress.cultural_acknowledgments.append(tier_id)
                
                # Check if this unlocks any tiers
                for tier in TIER_DEFINITIONS:
                    if (tier["id"] == tier_id and 
                        tier["id"] not in progress.unlocked_tiers and
                        progress.total_points >= tier["unlock_requirements"].get("points", 0)):
                        progress.unlocked_tiers.append(tier["id"])
        
        # Update timestamp
        progress.updated_at = datetime.utcnow()
        progress.last_activity = datetime.utcnow()
        
        # Save to database
        await db.user_progress.replace_one(
            {"user_id": user_id}, 
            progress.dict()
        )
        
        logger.info(f"Updated progress for user {user_id}")
        return progress
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user progress: {e}")
        raise HTTPException(status_code=500, detail="Failed to update user progress")

@router.get("/users/{user_id}/stats", response_model=UserStats)
async def get_user_stats(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get detailed user statistics"""
    try:
        # Get user progress
        progress = await db.user_progress.find_one({"user_id": user_id})
        if not progress:
            raise HTTPException(status_code=404, detail="User not found")
        
        progress_obj = UserProgress(**progress)
        
        # Get completed words details
        completed_words = []
        if progress_obj.completed_words:
            completed_words = await db.somali_words.find(
                {"id": {"$in": progress_obj.completed_words}}
            ).to_list(length=None)
        
        # Calculate stats
        words_by_category = {}
        words_by_tier = {}
        
        for word in completed_words:
            category = word["category"]
            tier = str(word["tier"])
            
            words_by_category[category] = words_by_category.get(category, 0) + 1
            words_by_tier[tier] = words_by_tier.get(tier, 0) + 1
        
        # Calculate average quiz score
        avg_quiz_score = 0
        if progress_obj.quiz_scores:
            total_score = sum(quiz.get("score", 0) for quiz in progress_obj.quiz_scores)
            avg_quiz_score = total_score / len(progress_obj.quiz_scores)
        
        # Estimate time spent (rough calculation based on completed words)
        estimated_time = len(progress_obj.completed_words) * 2  # 2 minutes per word
        
        return UserStats(
            total_words_learned=len(progress_obj.completed_words),
            words_by_category=words_by_category,
            words_by_tier=words_by_tier,
            average_quiz_score=round(avg_quiz_score, 2),
            time_spent_learning=estimated_time,
            pronunciation_attempts=0  # Would track this separately
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving user stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve user statistics")

@router.get("/users/{user_id}/favorites")
async def get_user_favorites(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get user's favorite words"""
    try:
        progress = await db.user_progress.find_one({"user_id": user_id})
        if not progress:
            return {"favorites": []}
        
        progress_obj = UserProgress(**progress)
        
        if not progress_obj.favorites:
            return {"favorites": []}
        
        # Get favorite words details
        favorite_words = await db.somali_words.find(
            {"id": {"$in": progress_obj.favorites}}
        ).to_list(length=None)
        
        return {
            "user_id": user_id,
            "favorite_count": len(favorite_words),
            "favorites": favorite_words
        }
    
    except Exception as e:
        logger.error(f"Error retrieving user favorites: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve favorites")

@router.get("/users/{user_id}/badges")
async def get_user_badges(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get user's earned badges with descriptions"""
    try:
        progress = await db.user_progress.find_one({"user_id": user_id})
        if not progress:
            return {"badges": []}
        
        progress_obj = UserProgress(**progress)
        
        # Badge definitions
        badge_definitions = {
            "newcomer": {"name": "Welcome!", "icon": "🎯", "description": "Started your Somali journey"},
            "first_favorite": {"name": "First Love", "icon": "💝", "description": "Favorited your first word"},
            "first_quiz": {"name": "Quiz Starter", "icon": "🧠", "description": "Completed your first quiz"},
            "level_2": {"name": "Rising Scholar", "icon": "📚", "description": "Reached Level 2"},
            "level_3": {"name": "Dedicated Learner", "icon": "🌟", "description": "Reached Level 3"},
            "level_5": {"name": "Somali Speaker", "icon": "🗣️", "description": "Reached Level 5"},
            "tier_master": {"name": "Tier Climber", "icon": "🏔️", "description": "Unlocked a new tier"},
            "quiz_master": {"name": "Quiz Champion", "icon": "🏆", "description": "Completed 10 quizzes"},
            "week_warrior": {"name": "Week Warrior", "icon": "🔥", "description": "7-day learning streak"},
            "compliment_king": {"name": "Compliment King/Queen", "icon": "👑", "description": "Mastered compliment words"}
        }
        
        # Add earned badges with details
        earned_badges = []
        for badge_id in progress_obj.badges_earned:
            if badge_id in badge_definitions:
                badge_info = badge_definitions[badge_id].copy()
                badge_info["id"] = badge_id
                badge_info["earned"] = True
                earned_badges.append(badge_info)
        
        # Add available badges (not yet earned)
        available_badges = []
        for badge_id, badge_info in badge_definitions.items():
            if badge_id not in progress_obj.badges_earned:
                badge_info_copy = badge_info.copy()
                badge_info_copy["id"] = badge_id
                badge_info_copy["earned"] = False
                available_badges.append(badge_info_copy)
        
        return {
            "user_id": user_id,
            "earned_badges": earned_badges,
            "available_badges": available_badges,
            "total_earned": len(earned_badges)
        }
    
    except Exception as e:
        logger.error(f"Error retrieving user badges: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve badges")
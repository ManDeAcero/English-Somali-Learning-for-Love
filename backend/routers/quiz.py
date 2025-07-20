from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Dict, Any
from datetime import datetime
import random
import logging

from ..models.somali_models import QuizSession, QuizQuestion, QuizAnswer
from ..database import get_database

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/quiz/generate")
async def generate_quiz(
    user_id: str,
    word_ids: List[str],
    quiz_type: str = "mixed",  # favorites, tier, mixed
    question_count: int = 10,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Generate a new quiz session"""
    try:
        # Validate question count
        if question_count > len(word_ids):
            question_count = len(word_ids)
        
        # Get words for quiz
        words = await db.somali_words.find(
            {"id": {"$in": word_ids}}
        ).to_list(length=None)
        
        if len(words) < question_count:
            raise HTTPException(
                status_code=400, 
                detail=f"Not enough words available. Found {len(words)}, needed {question_count}"
            )
        
        # Randomly select words for quiz
        selected_words = random.sample(words, question_count)
        
        # Generate questions
        questions = []
        all_words = await db.somali_words.find({}).to_list(length=None)
        
        for word in selected_words:
            question = await generate_question(word, all_words)
            questions.append(question)
        
        # Create quiz session
        quiz_session = QuizSession(
            user_id=user_id,
            questions=questions,
            total_questions=len(questions)
        )
        
        # Save to database
        await db.quiz_sessions.insert_one(quiz_session.dict())
        
        logger.info(f"Generated quiz with {len(questions)} questions for user {user_id}")
        
        return {
            "quiz_id": quiz_session.id,
            "question_count": len(questions),
            "quiz_type": quiz_type,
            "questions": questions
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating quiz: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate quiz")

async def generate_question(target_word: Dict[str, Any], all_words: List[Dict[str, Any]]) -> QuizQuestion:
    """Generate a multiple choice question for a word"""
    try:
        # Get wrong answers from same tier/category when possible
        same_tier_words = [w for w in all_words if w["tier"] == target_word["tier"] and w["id"] != target_word["id"]]
        same_category_words = [w for w in all_words if w["category"] == target_word["category"] and w["id"] != target_word["id"]]
        
        # Prioritize same tier, then same category, then random
        candidate_wrong = same_tier_words if same_tier_words else same_category_words if same_category_words else all_words
        
        # Filter out the target word
        candidate_wrong = [w for w in candidate_wrong if w["id"] != target_word["id"]]
        
        # Select 3 wrong answers
        wrong_answers = random.sample(candidate_wrong, min(3, len(candidate_wrong)))
        
        # Create options (correct + wrong answers)
        options = [target_word["english"]] + [w["english"] for w in wrong_answers]
        
        # Shuffle options
        random.shuffle(options)
        
        return QuizQuestion(
            word_id=target_word["id"],
            question_type="multiple_choice",
            options=options,
            correct_answer=target_word["english"]
        )
    
    except Exception as e:
        logger.error(f"Error generating question for word {target_word.get('id', 'unknown')}: {e}")
        # Fallback simple question
        return QuizQuestion(
            word_id=target_word["id"],
            question_type="multiple_choice", 
            options=[target_word["english"], "Wrong 1", "Wrong 2", "Wrong 3"],
            correct_answer=target_word["english"]
        )

@router.get("/quiz/{quiz_id}")
async def get_quiz(
    quiz_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get quiz session details"""
    try:
        quiz = await db.quiz_sessions.find_one({"id": quiz_id})
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        quiz_obj = QuizSession(**quiz)
        
        # Get word details for questions
        word_ids = [q.word_id for q in quiz_obj.questions]
        words = await db.somali_words.find(
            {"id": {"$in": word_ids}}
        ).to_list(length=None)
        
        word_dict = {w["id"]: w for w in words}
        
        # Enhance questions with word details
        enhanced_questions = []
        for question in quiz_obj.questions:
            word = word_dict.get(question.word_id, {})
            enhanced_question = question.dict()
            enhanced_question["word"] = {
                "somali": word.get("somali", ""),
                "phonetic": word.get("phonetic", ""),
                "category": word.get("category", ""),
                "cultural_tip": word.get("cultural_tip", "")
            }
            enhanced_questions.append(enhanced_question)
        
        return {
            "quiz_id": quiz_id,
            "user_id": quiz_obj.user_id,
            "total_questions": quiz_obj.total_questions,
            "current_score": quiz_obj.score,
            "started_at": quiz_obj.started_at,
            "completed_at": quiz_obj.completed_at,
            "is_completed": quiz_obj.completed_at is not None,
            "questions": enhanced_questions,
            "answers": quiz_obj.answers
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving quiz {quiz_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve quiz")

@router.post("/quiz/{quiz_id}/answer")
async def submit_answer(
    quiz_id: str,
    answer: QuizAnswer,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Submit an answer to a quiz question"""
    try:
        # Get quiz session
        quiz = await db.quiz_sessions.find_one({"id": quiz_id})
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        quiz_obj = QuizSession(**quiz)
        
        if quiz_obj.completed_at:
            raise HTTPException(status_code=400, detail="Quiz already completed")
        
        # Find the question
        question = None
        for q in quiz_obj.questions:
            if q.id == answer.question_id:
                question = q
                break
        
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        # Check if answer is correct
        is_correct = answer.selected_answer == question.correct_answer
        answer.is_correct = is_correct
        
        # Update score
        if is_correct:
            quiz_obj.score += 1
        
        # Add answer to quiz session
        quiz_obj.answers.append(answer.dict())
        
        # Check if quiz is completed
        if len(quiz_obj.answers) >= quiz_obj.total_questions:
            quiz_obj.completed_at = datetime.utcnow()
        
        # Update in database
        await db.quiz_sessions.replace_one(
            {"id": quiz_id},
            quiz_obj.dict()
        )
        
        logger.info(f"Answer submitted for quiz {quiz_id}, question {answer.question_id}: {'correct' if is_correct else 'incorrect'}")
        
        return {
            "correct": is_correct,
            "correct_answer": question.correct_answer,
            "current_score": quiz_obj.score,
            "questions_answered": len(quiz_obj.answers),
            "total_questions": quiz_obj.total_questions,
            "quiz_completed": quiz_obj.completed_at is not None
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting answer: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit answer")

@router.get("/quiz/{quiz_id}/results")
async def get_quiz_results(
    quiz_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get detailed quiz results"""
    try:
        quiz = await db.quiz_sessions.find_one({"id": quiz_id})
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        quiz_obj = QuizSession(**quiz)
        
        if not quiz_obj.completed_at:
            raise HTTPException(status_code=400, detail="Quiz not yet completed")
        
        # Calculate detailed results
        total_questions = quiz_obj.total_questions
        correct_answers = quiz_obj.score
        percentage = round((correct_answers / total_questions) * 100, 1) if total_questions > 0 else 0
        
        # Calculate average time per question
        if quiz_obj.answers:
            total_time = sum(answer.get("time_taken", 0) for answer in quiz_obj.answers)
            avg_time = round(total_time / len(quiz_obj.answers), 1)
        else:
            avg_time = 0
        
        # Get performance level
        if percentage >= 90:
            performance = {"level": "Excellent", "badge": "🏆", "message": "Outstanding mastery!"}
        elif percentage >= 75:
            performance = {"level": "Good", "badge": "⭐", "message": "Great progress!"}
        elif percentage >= 60:
            performance = {"level": "Fair", "badge": "📖", "message": "Keep practicing!"}
        else:
            performance = {"level": "Needs Improvement", "badge": "💪", "message": "Don't give up!"}
        
        # Analyze mistakes by category
        mistake_analysis = {}
        word_ids = [q.word_id for q in quiz_obj.questions]
        words = await db.somali_words.find(
            {"id": {"$in": word_ids}}
        ).to_list(length=None)
        word_dict = {w["id"]: w for w in words}
        
        for i, answer in enumerate(quiz_obj.answers):
            if not answer.get("is_correct", False):
                question = quiz_obj.questions[i]
                word = word_dict.get(question.word_id, {})
                category = word.get("category", "unknown")
                
                if category not in mistake_analysis:
                    mistake_analysis[category] = 0
                mistake_analysis[category] += 1
        
        return {
            "quiz_id": quiz_id,
            "completed_at": quiz_obj.completed_at,
            "score": {
                "correct": correct_answers,
                "total": total_questions,
                "percentage": percentage
            },
            "performance": performance,
            "timing": {
                "total_time_seconds": sum(answer.get("time_taken", 0) for answer in quiz_obj.answers),
                "average_time_per_question": avg_time
            },
            "mistake_analysis": mistake_analysis,
            "detailed_answers": [
                {
                    "question_id": answer.get("question_id"),
                    "selected": answer.get("selected_answer"),
                    "correct": answer.get("is_correct"),
                    "time_taken": answer.get("time_taken", 0)
                }
                for answer in quiz_obj.answers
            ]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving quiz results: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve quiz results")

@router.get("/users/{user_id}/quiz-history")
async def get_user_quiz_history(
    user_id: str,
    limit: int = 20,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get user's quiz history"""
    try:
        quizzes = await db.quiz_sessions.find(
            {"user_id": user_id, "completed_at": {"$exists": True}}
        ).sort("completed_at", -1).limit(limit).to_list(length=None)
        
        quiz_history = []
        for quiz in quizzes:
            quiz_obj = QuizSession(**quiz)
            percentage = round((quiz_obj.score / quiz_obj.total_questions) * 100, 1) if quiz_obj.total_questions > 0 else 0
            
            quiz_history.append({
                "quiz_id": quiz_obj.id,
                "completed_at": quiz_obj.completed_at,
                "score": quiz_obj.score,
                "total_questions": quiz_obj.total_questions,
                "percentage": percentage,
                "duration_minutes": round((quiz_obj.completed_at - quiz_obj.started_at).total_seconds() / 60, 1) if quiz_obj.completed_at else 0
            })
        
        return {
            "user_id": user_id,
            "quiz_count": len(quiz_history),
            "quizzes": quiz_history
        }
    
    except Exception as e:
        logger.error(f"Error retrieving quiz history: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve quiz history")
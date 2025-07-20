from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

# Word/Phrase Models
class SomaliWord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    somali: str
    english: str
    phonetic: str  # English-based phonetic guide
    category: str  # basic, greetings, cute_tease, compliments, deep_talk
    tier: int  # 1-20 tier system
    example_somali: str
    example_english: str
    cultural_tip: str  # DO: or DON'T: guidance
    difficulty: str  # beginner, intermediate, advanced
    tags: List[str] = []
    points: int = 10
    is_sensitive: bool = False  # Requires cultural popup
    audio_cache_key: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SomaliWordCreate(BaseModel):
    somali: str
    english: str
    phonetic: str
    category: str
    tier: int
    example_somali: str
    example_english: str
    cultural_tip: str
    difficulty: str
    tags: List[str] = []
    points: int = 10
    is_sensitive: bool = False

# User Progress Models
class UserProgress(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    level: int = 1
    total_points: int = 0
    current_streak: int = 0
    longest_streak: int = 0
    last_activity: datetime = Field(default_factory=datetime.utcnow)
    unlocked_tiers: List[int] = [1]
    completed_words: List[str] = []  # word IDs
    favorites: List[str] = []  # word IDs
    badges_earned: List[str] = []
    quiz_scores: List[Dict[str, Any]] = []
    cultural_acknowledgments: List[int] = []  # tier numbers acknowledged
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserProgressUpdate(BaseModel):
    word_completed: Optional[str] = None
    points_earned: Optional[int] = None
    favorite_toggled: Optional[str] = None
    quiz_completed: Optional[Dict[str, Any]] = None
    cultural_tier_acknowledged: Optional[int] = None

# Audio Generation Models
class AudioRequest(BaseModel):
    text: str
    speed: float = Field(default=1.0, ge=0.25, le=4.0)  # Speed multiplier

class AudioResponse(BaseModel):
    audio_content: str  # Base64 encoded audio
    cache_key: str
    duration_seconds: Optional[float] = None

# Quiz Models
class QuizQuestion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    word_id: str
    question_type: str = "multiple_choice"  # multiple_choice, audio_recognition
    options: List[str] = []
    correct_answer: str

class QuizSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    questions: List[QuizQuestion]
    answers: List[Dict[str, Any]] = []
    score: int = 0
    total_questions: int
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

class QuizAnswer(BaseModel):
    question_id: str
    selected_answer: str
    is_correct: bool
    time_taken: float  # seconds

# Cultural Sensitivity Models
class CulturalTip(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tier: int
    title: str
    content: str
    tip_type: str  # respect, usage, context
    severity: str  # info, warning, critical

# Tier System Models
class Tier(BaseModel):
    id: int
    name: str
    description: str
    unlock_requirements: Dict[str, Any]
    word_count: int
    cultural_level: str  # basic, intermediate, advanced, sensitive
    color_theme: str

# Statistics Models
class UserStats(BaseModel):
    total_words_learned: int
    words_by_category: Dict[str, int]
    words_by_tier: Dict[str, int]
    average_quiz_score: float
    time_spent_learning: int  # minutes
    pronunciation_attempts: int
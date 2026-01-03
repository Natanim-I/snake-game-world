from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class User(UserBase):
    id: str
    highScore: int = 0
    gamesPlayed: int = 0
    createdAt: datetime

    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    user: Optional[User] = None
    error: Optional[str] = None

class GameScore(BaseModel):
    score: int
    mode: Literal['passthrough', 'walls']

class LeaderboardEntry(BaseModel):
    id: str
    username: str
    score: int
    mode: Literal['passthrough', 'walls']
    date: datetime

class ScoreResponse(BaseModel):
    success: bool
    rank: Optional[int] = None

class ActiveGame(BaseModel):
    id: str
    username: str
    score: int
    mode: Literal['passthrough', 'walls']
    startedAt: datetime

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None

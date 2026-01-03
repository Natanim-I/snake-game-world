from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from ..models import LeaderboardEntry, GameScore, ScoreResponse
from ..database import db
from .auth import security, get_me # Re-use auth dependency

router = APIRouter(
    prefix="/leaderboard",
    tags=["leaderboard"]
)

@router.get("", response_model=List[LeaderboardEntry])
async def get_leaderboard(mode: Optional[str] = Query(None, pattern="^(passthrough|walls)$")):
    return db.get_leaderboard(mode)

@router.post("", response_model=ScoreResponse)
async def submit_score(score: GameScore, user=Depends(get_me)):
    rank = db.submit_score(user.id, score)
    return ScoreResponse(success=True, rank=rank)

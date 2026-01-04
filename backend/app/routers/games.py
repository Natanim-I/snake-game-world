from fastapi import APIRouter, HTTPException
from typing import List
from ..models import ActiveGame
from ..database import db

router = APIRouter(
    prefix="/games",
    tags=["games"]
)

@router.get("/active", response_model=List[ActiveGame])
async def get_active_games():
    return await db.get_active_games()

@router.get("/{game_id}", response_model=ActiveGame)
async def get_game(game_id: str):
    game = await db.get_game(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


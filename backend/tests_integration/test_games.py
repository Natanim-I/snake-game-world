"""Integration tests for game endpoints"""
import pytest
from datetime import datetime, UTC
from app.db.models import ActiveGameModel

@pytest.mark.asyncio
async def test_get_active_games_empty(client):
    """Test getting active games when none exist"""
    response = await client.get("/games/active")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0

@pytest.mark.asyncio
async def test_get_active_games_with_games(client, db_session):
    """Test getting active games"""
    games = [
        ActiveGameModel(
            id="game1",
            username="player1",
            score=50,
            mode="walls",
            started_at=datetime.now(UTC)
        ),
        ActiveGameModel(
            id="game2",
            username="player2",
            score=75,
            mode="passthrough",
            started_at=datetime.now(UTC)
        ),
    ]
    
    for game in games:
        db_session.add(game)
    await db_session.commit()
    
    response = await client.get("/games/active")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["username"] in ["player1", "player2"]
    assert data[1]["username"] in ["player1", "player2"]

@pytest.mark.asyncio
async def test_get_game_by_id(client, db_session):
    """Test getting a specific game by ID"""
    game = ActiveGameModel(
        id="test-game-123",
        username="testplayer",
        score=100,
        mode="walls",
        started_at=datetime.now(UTC)
    )
    db_session.add(game)
    await db_session.commit()
    
    response = await client.get("/games/test-game-123")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "test-game-123"
    assert data["username"] == "testplayer"
    assert data["score"] == 100
    assert data["mode"] == "walls"

@pytest.mark.asyncio
async def test_get_game_not_found(client):
    """Test getting a non-existent game"""
    response = await client.get("/games/nonexistent-game")
    
    assert response.status_code == 404
    assert "Game not found" in response.json()["detail"]

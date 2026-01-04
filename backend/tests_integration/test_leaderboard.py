"""Integration tests for leaderboard endpoints"""
import pytest
from datetime import datetime, UTC
from app.db.models import LeaderboardEntryModel

@pytest.mark.asyncio
async def test_get_leaderboard_empty(client):
    """Test getting leaderboard when empty"""
    response = await client.get("/leaderboard")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0

@pytest.mark.asyncio
async def test_get_leaderboard_with_entries(client, db_session):
    """Test getting leaderboard with entries"""
    # Add some leaderboard entries
    entries = [
        LeaderboardEntryModel(
            id="entry1",
            username="player1",
            score=150,
            mode="walls",
            date=datetime.now(UTC)
        ),
        LeaderboardEntryModel(
            id="entry2",
            username="player2",
            score=200,
            mode="walls",
            date=datetime.now(UTC)
        ),
        LeaderboardEntryModel(
            id="entry3",
            username="player3",
            score=100,
            mode="passthrough",
            date=datetime.now(UTC)
        ),
    ]
    
    for entry in entries:
        db_session.add(entry)
    await db_session.commit()
    
    response = await client.get("/leaderboard")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    # Should be sorted by score descending
    assert data[0]["score"] == 200
    assert data[1]["score"] == 150
    assert data[2]["score"] == 100

@pytest.mark.asyncio
async def test_get_leaderboard_filter_by_mode(client, db_session):
    """Test filtering leaderboard by mode"""
    entries = [
        LeaderboardEntryModel(
            id="entry1",
            username="player1",
            score=150,
            mode="walls",
            date=datetime.now(UTC)
        ),
        LeaderboardEntryModel(
            id="entry2",
            username="player2",
            score=200,
            mode="passthrough",
            date=datetime.now(UTC)
        ),
    ]
    
    for entry in entries:
        db_session.add(entry)
    await db_session.commit()
    
    # Filter by walls mode
    response = await client.get("/leaderboard?mode=walls")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["mode"] == "walls"
    
    # Filter by passthrough mode
    response = await client.get("/leaderboard?mode=passthrough")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["mode"] == "passthrough"

@pytest.mark.asyncio
async def test_submit_score_authenticated(client, auth_token, test_user):
    """Test submitting a score with authentication"""
    response = await client.post(
        "/leaderboard",
        json={
            "score": 250,
            "mode": "walls"
        },
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["rank"] == 1  # First entry

@pytest.mark.asyncio
async def test_submit_score_unauthenticated(client):
    """Test submitting a score without authentication"""
    response = await client.post(
        "/leaderboard",
        json={
            "score": 250,
            "mode": "walls"
        }
    )
    
    assert response.status_code == 401  # HTTPBearer returns 401 when no credentials

@pytest.mark.asyncio
async def test_submit_score_updates_user_stats(client, auth_token, test_user, db_session):
    """Test that submitting a score updates user stats"""
    initial_games_played = test_user.games_played
    initial_high_score = test_user.high_score
    
    # Submit a higher score
    response = await client.post(
        "/leaderboard",
        json={
            "score": 300,
            "mode": "walls"
        },
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    assert response.status_code == 200
    
    # Verify user stats were updated
    await db_session.refresh(test_user)
    assert test_user.games_played == initial_games_played + 1
    assert test_user.high_score == 300

@pytest.mark.asyncio
async def test_submit_score_rank_calculation(client, auth_token, db_session):
    """Test that rank is calculated correctly"""
    # Add existing entries
    entries = [
        LeaderboardEntryModel(
            id="entry1",
            username="player1",
            score=500,
            mode="walls",
            date=datetime.now(UTC)
        ),
        LeaderboardEntryModel(
            id="entry2",
            username="player2",
            score=300,
            mode="walls",
            date=datetime.now(UTC)
        ),
    ]
    
    for entry in entries:
        db_session.add(entry)
    await db_session.commit()
    
    # Submit a score that should rank 2nd
    response = await client.post(
        "/leaderboard",
        json={
            "score": 400,
            "mode": "walls"
        },
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["rank"] == 2

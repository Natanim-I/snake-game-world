import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from unittest.mock import patch
import hashlib

from app.main import app
from app.db.base import Base
from app.db.models import UserModel, LeaderboardEntryModel, ActiveGameModel
from app import database

# Test database URL
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Create test engine
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
)

# Create test session factory
TestSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

@pytest_asyncio.fixture
async def db_session():
    """Create a fresh database for each test"""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with TestSessionLocal() as session:
        yield session
    
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture
async def client(db_session):
    """Create a test client with overridden database dependency"""
    # Patch the DatabaseManager to use test session
    async def mock_get_session(self):
        return TestSessionLocal()
    
    # Patch the _get_session method
    database.DatabaseManager._get_session = mock_get_session
    
    # Also need to patch AsyncSessionLocal in database.py
    with patch('app.database.AsyncSessionLocal', TestSessionLocal):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as ac:
            yield ac

@pytest_asyncio.fixture
async def test_user(db_session):
    """Create a test user"""
    user = UserModel(
        id="test-user-1",
        username="testuser",
        email="test@example.com",
        password_hash=hashlib.sha256("password123".encode()).hexdigest(),
        high_score=100,
        games_played=10,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest_asyncio.fixture
async def leaderboard_data(db_session, test_user):
    """Create test leaderboard entries"""
    # Note: LeaderboardEntryModel doesn't have user_id, it uses username
    entries = [
        LeaderboardEntryModel(
            id="entry-1",
            username=test_user.username,
            score=150,
            mode="walls",
        ),
        LeaderboardEntryModel(
            id="entry-2",
            username=test_user.username,
            score=120,
            mode="passthrough", # "classic" is not in GameMode enum
        ),
    ]
    for entry in entries:
        db_session.add(entry)
    await db_session.commit()
    return entries

@pytest_asyncio.fixture
async def active_game(db_session, test_user):
    """Create an active game"""
    # Note: ActiveGameModel doesn't have user_id and uses score instead of current_score
    game = ActiveGameModel(
        id="game-1",
        username=test_user.username,
        mode="walls",
        score=50,
    )
    db_session.add(game)
    await db_session.commit()
    await db_session.refresh(game)
    return game

@pytest.mark.asyncio
async def test_read_main(client):
    response = await client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Snake Game World API"}

@pytest.mark.asyncio
async def test_login_success(client, test_user):
    response = await client.post(
        "/auth/login",
        json={"email": "test@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "token" in data
    assert data["user"]["email"] == "test@example.com"

@pytest.mark.asyncio
async def test_login_failure(client, test_user):
    response = await client.post(
        "/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_leaderboard(client, leaderboard_data):
    response = await client.get("/leaderboard")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

@pytest.mark.asyncio
async def test_get_leaderboard_filter(client, leaderboard_data):
    response = await client.get("/leaderboard?mode=walls")
    assert response.status_code == 200
    data = response.json()
    assert all(entry["mode"] == "walls" for entry in data)

@pytest.mark.asyncio
async def test_submit_score(client, test_user):
    # First login to get a token
    login_response = await client.post(
        "/auth/login",
        json={"email": "test@example.com", "password": "password123"}
    )
    token = login_response.json()["token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    score_data = {"score": 200, "mode": "walls"}
    
    response = await client.post("/leaderboard", json=score_data, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "rank" in data

@pytest.mark.asyncio
async def test_get_active_games(client, active_game):
    response = await client.get("/games/active")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0

@pytest.mark.asyncio
async def test_get_me_unauthenticated(client):
    response = await client.get("/auth/me")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_me_authenticated(client, test_user):
    # First login to get a token
    login_response = await client.post(
        "/auth/login",
        json={"email": "test@example.com", "password": "password123"}
    )
    token = login_response.json()["token"]
    
    response = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"

import os
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from unittest.mock import AsyncMock, patch

from app.main import app
from app.db.base import Base
from app.db.models import UserModel
from app import database
import hashlib

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
    original_get_session = database.DatabaseManager._get_session
    
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
    
    # Restore original
    database.DatabaseManager._get_session = original_get_session

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
async def auth_token(client, test_user):
    """Get an authentication token for the test user"""
    response = await client.post(
        "/auth/login",
        json={"email": "test@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    return data["token"]


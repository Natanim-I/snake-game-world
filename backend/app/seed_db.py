"""
Seed script to populate the database with initial data.
Run with: uv run python -m app.seed_db
"""
import asyncio
from datetime import datetime, UTC
from app.db.session import AsyncSessionLocal
from app.db.models import UserModel, LeaderboardEntryModel, ActiveGameModel
import hashlib

def hash_password(password: str) -> str:
    """Hash a password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

async def seed_database():
    """Seed the database with initial data"""
    async with AsyncSessionLocal() as session:
        # Check if data already exists
        from sqlalchemy import select
        result = await session.execute(select(UserModel))
        if result.first():
            print("Database already seeded. Skipping...")
            return
        
        print("Seeding database...")
        
        # Sample Users
        users = [
            UserModel(id='1', username='SnakeMaster', email='master@snake.com', password_hash=hash_password('password123'), high_score=156, games_played=42, created_at=datetime(2024, 1, 15)),
            UserModel(id='2', username='NeonViper', email='viper@snake.com', password_hash=hash_password('password123'), high_score=134, games_played=38, created_at=datetime(2024, 2, 20)),
            UserModel(id='3', username='PixelHunter', email='pixel@snake.com', password_hash=hash_password('password123'), high_score=128, games_played=55, created_at=datetime(2024, 1, 8)),
            UserModel(id='4', username='RetroGamer', email='retro@snake.com', password_hash=hash_password('password123'), high_score=210, games_played=89, created_at=datetime(2023, 11, 5)),
            UserModel(id='5', username='SpeedDemon', email='speed@snake.com', password_hash=hash_password('password123'), high_score=88, games_played=15, created_at=datetime(2024, 3, 1)),
            UserModel(id='6', username='GlitchInTheMatrix', email='glitch@snake.com', password_hash=hash_password('password123'), high_score=342, games_played=112, created_at=datetime(2023, 10, 12)),
            UserModel(id='7', username='BitByte', email='bit@snake.com', password_hash=hash_password('password123'), high_score=95, games_played=22, created_at=datetime(2024, 2, 5)),
            UserModel(id='8', username='PythonCharmer', email='python@snake.com', password_hash=hash_password('password123'), high_score=175, games_played=60, created_at=datetime(2024, 1, 30)),
        ]
        
        for user in users:
            session.add(user)
        
        # Sample Leaderboard
        leaderboard = [
            LeaderboardEntryModel(id='1', username='SnakeMaster', score=156, mode='walls', date=datetime(2024, 12, 28)),
            LeaderboardEntryModel(id='2', username='NeonViper', score=134, mode='passthrough', date=datetime(2024, 12, 27)),
            LeaderboardEntryModel(id='3', username='PixelHunter', score=128, mode='walls', date=datetime(2024, 12, 26)),
            LeaderboardEntryModel(id='4', username='CyberSnake', score=115, mode='passthrough', date=datetime(2024, 12, 25)),
            LeaderboardEntryModel(id='5', username='GlowWorm', score=98, mode='walls', date=datetime(2024, 12, 24)),
            LeaderboardEntryModel(id='6', username='RetroGamer', score=210, mode='passthrough', date=datetime(2024, 12, 20)),
            LeaderboardEntryModel(id='7', username='RetroGamer', score=180, mode='walls', date=datetime(2024, 11, 15)),
            LeaderboardEntryModel(id='8', username='GlitchInTheMatrix', score=342, mode='walls', date=datetime(2024, 12, 10)),
            LeaderboardEntryModel(id='9', username='GlitchInTheMatrix', score=280, mode='passthrough', date=datetime(2024, 12, 11)),
            LeaderboardEntryModel(id='10', username='SpeedDemon', score=88, mode='passthrough', date=datetime(2024, 12, 29)),
            LeaderboardEntryModel(id='11', username='PythonCharmer', score=175, mode='walls', date=datetime(2024, 12, 18)),
            LeaderboardEntryModel(id='12', username='BitByte', score=95, mode='passthrough', date=datetime(2024, 12, 22)),
            LeaderboardEntryModel(id='13', username='SnakeMaster', score=140, mode='passthrough', date=datetime(2024, 12, 15)),
            LeaderboardEntryModel(id='14', username='NeonViper', score=130, mode='walls', date=datetime(2024, 12, 14)),
        ]
        
        for entry in leaderboard:
            session.add(entry)
        
        # Sample Active Games
        active_games = [
            ActiveGameModel(id='game1', username='LivePlayer1', score=45, mode='walls', started_at=datetime.now(UTC)),
            ActiveGameModel(id='game2', username='LivePlayer2', score=32, mode='passthrough', started_at=datetime.now(UTC)),
            ActiveGameModel(id='game3', username='RetroGamer', score=120, mode='walls', started_at=datetime.now(UTC)),
            ActiveGameModel(id='game4', username='SpeedDemon', score=10, mode='passthrough', started_at=datetime.now(UTC)),
        ]
        
        for game in active_games:
            session.add(game)
        
        await session.commit()
        print("Database seeded successfully!")
        print(f"Added {len(users)} users")
        print(f"Added {len(leaderboard)} leaderboard entries")
        print(f"Added {len(active_games)} active games")

if __name__ == "__main__":
    asyncio.run(seed_database())

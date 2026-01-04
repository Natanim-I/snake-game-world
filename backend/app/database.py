import uuid
from datetime import datetime, UTC
from typing import List, Optional
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
import hashlib

from .models import User, LeaderboardEntry, ActiveGame, GameScore
from .db.models import UserModel, LeaderboardEntryModel, ActiveGameModel, TokenModel
from .db.session import AsyncSessionLocal

class DatabaseManager:
    """Database manager using SQLAlchemy with async support"""
    
    def __init__(self):
        """Initialize the database manager"""
        pass
    
    async def _get_session(self) -> AsyncSession:
        """Get a new database session"""
        return AsyncSessionLocal()
    
    @staticmethod
    def _hash_password(password: str) -> str:
        """Hash a password using SHA256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    # Token Methods
    async def store_token(self, token: str, user_id: str):
        """Store authentication token"""
        async with AsyncSessionLocal() as session:
            token_model = TokenModel(token=token, user_id=user_id)
            session.add(token_model)
            await session.commit()
    
    async def get_user_by_token(self, token: str) -> Optional[User]:
        """Get user by authentication token"""
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(TokenModel).where(TokenModel.token == token)
            )
            token_model = result.scalar_one_or_none()
            if token_model:
                return await self.get_user_by_id(token_model.user_id)
            return None
    
    # User Methods
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(UserModel).where(UserModel.email == email)
            )
            user_model = result.scalar_one_or_none()
            if user_model:
                return User(
                    id=user_model.id,
                    username=user_model.username,
                    email=user_model.email,
                    highScore=user_model.high_score,
                    gamesPlayed=user_model.games_played,
                    createdAt=user_model.created_at
                )
            return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(UserModel).where(UserModel.id == user_id)
            )
            user_model = result.scalar_one_or_none()
            if user_model:
                return User(
                    id=user_model.id,
                    username=user_model.username,
                    email=user_model.email,
                    highScore=user_model.high_score,
                    gamesPlayed=user_model.games_played,
                    createdAt=user_model.created_at
                )
            return None
    
    async def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(UserModel).where(UserModel.username == username)
            )
            user_model = result.scalar_one_or_none()
            if user_model:
                return User(
                    id=user_model.id,
                    username=user_model.username,
                    email=user_model.email,
                    highScore=user_model.high_score,
                    gamesPlayed=user_model.games_played,
                    createdAt=user_model.created_at
                )
            return None
    
    async def verify_password(self, email: str, password: str) -> bool:
        """Verify user password"""
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(UserModel).where(UserModel.email == email)
            )
            user_model = result.scalar_one_or_none()
            if user_model:
                return user_model.password_hash == self._hash_password(password)
            return False
    
    async def create_user(self, username: str, email: str, password: str) -> User:
        """Create a new user"""
        async with AsyncSessionLocal() as session:
            user_model = UserModel(
                id=str(uuid.uuid4()),
                username=username,
                email=email,
                password_hash=self._hash_password(password),
                high_score=0,
                games_played=0,
                created_at=datetime.now(UTC)
            )
            session.add(user_model)
            await session.commit()
            await session.refresh(user_model)
            
            return User(
                id=user_model.id,
                username=user_model.username,
                email=user_model.email,
                highScore=user_model.high_score,
                gamesPlayed=user_model.games_played,
                createdAt=user_model.created_at
            )
    
    async def update_user(self, user_id: str, updates: dict) -> Optional[User]:
        """Update user information"""
        async with AsyncSessionLocal() as session:
            # Map camelCase to snake_case
            db_updates = {}
            if 'highScore' in updates:
                db_updates['high_score'] = updates['highScore']
            if 'gamesPlayed' in updates:
                db_updates['games_played'] = updates['gamesPlayed']
            if 'username' in updates:
                db_updates['username'] = updates['username']
            if 'email' in updates:
                db_updates['email'] = updates['email']
            
            await session.execute(
                update(UserModel).where(UserModel.id == user_id).values(**db_updates)
            )
            await session.commit()
            
            return await self.get_user_by_id(user_id)
    
    # Leaderboard Methods
    async def get_leaderboard(self, mode: str = None) -> List[LeaderboardEntry]:
        """Get leaderboard entries, optionally filtered by mode"""
        async with AsyncSessionLocal() as session:
            query = select(LeaderboardEntryModel)
            if mode:
                query = query.where(LeaderboardEntryModel.mode == mode)
            query = query.order_by(LeaderboardEntryModel.score.desc())
            
            result = await session.execute(query)
            entries = result.scalars().all()
            
            return [
                LeaderboardEntry(
                    id=entry.id,
                    username=entry.username,
                    score=entry.score,
                    mode=entry.mode,
                    date=entry.date
                )
                for entry in entries
            ]
    
    async def submit_score(self, user_id: str, score_data: GameScore) -> int:
        """Submit a game score and return rank"""
        user = await self.get_user_by_id(user_id)
        if not user:
            return 0
        
        async with AsyncSessionLocal() as session:
            # Update user stats
            user_updates = {'gamesPlayed': user.gamesPlayed + 1}
            if score_data.score > user.highScore:
                user_updates['highScore'] = score_data.score
            
            await self.update_user(user_id, user_updates)
            
            # Add to leaderboard
            entry = LeaderboardEntryModel(
                id=str(uuid.uuid4()),
                username=user.username,
                score=score_data.score,
                mode=score_data.mode,
                date=datetime.now(UTC)
            )
            session.add(entry)
            await session.commit()
            
            # Calculate rank
            result = await session.execute(
                select(LeaderboardEntryModel).order_by(LeaderboardEntryModel.score.desc())
            )
            sorted_board = result.scalars().all()
            
            try:
                rank = next(i for i, e in enumerate(sorted_board) if e.id == entry.id) + 1
            except StopIteration:
                rank = 0
            
            return rank
    
    # Game Methods
    async def get_active_games(self) -> List[ActiveGame]:
        """Get all active games"""
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(ActiveGameModel))
            games = result.scalars().all()
            
            return [
                ActiveGame(
                    id=game.id,
                    username=game.username,
                    score=game.score,
                    mode=game.mode,
                    startedAt=game.started_at
                )
                for game in games
            ]
    
    async def get_game(self, game_id: str) -> Optional[ActiveGame]:
        """Get a specific game by ID"""
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(ActiveGameModel).where(ActiveGameModel.id == game_id)
            )
            game = result.scalar_one_or_none()
            
            if game:
                return ActiveGame(
                    id=game.id,
                    username=game.username,
                    score=game.score,
                    mode=game.mode,
                    startedAt=game.started_at
                )
            return None

# Create singleton instance
db = DatabaseManager()

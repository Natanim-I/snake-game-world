import uuid
from datetime import datetime
from typing import List, Optional
from .models import User, LeaderboardEntry, ActiveGame, GameScore

class MockDatabase:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MockDatabase, cls).__new__(cls)
            cls._instance.users = []
            cls._instance.leaderboard = []
            cls._instance.active_games = []
            cls._instance.tokens = {} # Map token -> user_id
            cls._instance.initialize_mock_data()
        return cls._instance

    def initialize_mock_data(self):
        # Sample Users
        self.users = [
            User(id='1', username='SnakeMaster', email='master@snake.com', highScore=156, gamesPlayed=42, createdAt=datetime(2024, 1, 15)),
            User(id='2', username='NeonViper', email='viper@snake.com', highScore=134, gamesPlayed=38, createdAt=datetime(2024, 2, 20)),
            User(id='3', username='PixelHunter', email='pixel@snake.com', highScore=128, gamesPlayed=55, createdAt=datetime(2024, 1, 8)),
            User(id='4', username='RetroGamer', email='retro@snake.com', highScore=210, gamesPlayed=89, createdAt=datetime(2023, 11, 5)),
            User(id='5', username='SpeedDemon', email='speed@snake.com', highScore=88, gamesPlayed=15, createdAt=datetime(2024, 3, 1)),
            User(id='6', username='GlitchInTheMatrix', email='glitch@snake.com', highScore=342, gamesPlayed=112, createdAt=datetime(2023, 10, 12)),
            User(id='7', username='BitByte', email='bit@snake.com', highScore=95, gamesPlayed=22, createdAt=datetime(2024, 2, 5)),
            User(id='8', username='PythonCharmer', email='python@snake.com', highScore=175, gamesPlayed=60, createdAt=datetime(2024, 1, 30)),
        ]
        # Passwords for mock login
        self.passwords = {
            'master@snake.com': 'password123',
            'viper@snake.com': 'password123',
            'pixel@snake.com': 'password123',
            'retro@snake.com': 'password123',
            'speed@snake.com': 'password123',
            'glitch@snake.com': 'password123',
            'bit@snake.com': 'password123',
            'python@snake.com': 'password123',
        }

        # Sample Leaderboard
        self.leaderboard = [
            LeaderboardEntry(id='1', username='SnakeMaster', score=156, mode='walls', date=datetime(2024, 12, 28)),
            LeaderboardEntry(id='2', username='NeonViper', score=134, mode='passthrough', date=datetime(2024, 12, 27)),
            LeaderboardEntry(id='3', username='PixelHunter', score=128, mode='walls', date=datetime(2024, 12, 26)),
            LeaderboardEntry(id='4', username='CyberSnake', score=115, mode='passthrough', date=datetime(2024, 12, 25)),
            LeaderboardEntry(id='5', username='GlowWorm', score=98, mode='walls', date=datetime(2024, 12, 24)),
            LeaderboardEntry(id='6', username='RetroGamer', score=210, mode='passthrough', date=datetime(2024, 12, 20)),
            LeaderboardEntry(id='7', username='RetroGamer', score=180, mode='walls', date=datetime(2024, 11, 15)),
            LeaderboardEntry(id='8', username='GlitchInTheMatrix', score=342, mode='walls', date=datetime(2024, 12, 10)),
            LeaderboardEntry(id='9', username='GlitchInTheMatrix', score=280, mode='passthrough', date=datetime(2024, 12, 11)),
            LeaderboardEntry(id='10', username='SpeedDemon', score=88, mode='passthrough', date=datetime(2024, 12, 29)),
            LeaderboardEntry(id='11', username='PythonCharmer', score=175, mode='walls', date=datetime(2024, 12, 18)),
            LeaderboardEntry(id='12', username='BitByte', score=95, mode='passthrough', date=datetime(2024, 12, 22)),
            LeaderboardEntry(id='13', username='SnakeMaster', score=140, mode='passthrough', date=datetime(2024, 12, 15)),
            LeaderboardEntry(id='14', username='NeonViper', score=130, mode='walls', date=datetime(2024, 12, 14)),
        ]

        # Sample Active Games
        self.active_games = [
            ActiveGame(id='game1', username='LivePlayer1', score=45, mode='walls', startedAt=datetime.now()),
            ActiveGame(id='game2', username='LivePlayer2', score=32, mode='passthrough', startedAt=datetime.now()),
            ActiveGame(id='game3', username='RetroGamer', score=120, mode='walls', startedAt=datetime.now()),
            ActiveGame(id='game4', username='SpeedDemon', score=10, mode='passthrough', startedAt=datetime.now()),
        ]

        # Sample Tokens (for initial users if needed, though login generates them)
        # self.tokens = {} 

    def store_token(self, token: str, user_id: str):
        self.tokens[token] = user_id

    def get_user_by_token(self, token: str) -> Optional[User]:
        user_id = self.tokens.get(token)
        if user_id:
            return self.get_user_by_id(user_id)
        return None

    # User Methods
    def get_user_by_email(self, email: str) -> Optional[User]:
        return next((u for u in self.users if u.email == email), None)

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        return next((u for u in self.users if u.id == user_id), None)
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        return next((u for u in self.users if u.username == username), None)

    def verify_password(self, email: str, password: str) -> bool:
        return self.passwords.get(email) == password

    def create_user(self, username: str, email: str, password: str) -> User:
        new_user = User(
            id=str(len(self.users) + 1),
            username=username,
            email=email,
            highScore=0,
            gamesPlayed=0,
            createdAt=datetime.now()
        )
        self.users.append(new_user)
        self.passwords[email] = password
        return new_user

    def update_user(self, user_id: str, updates: dict) -> Optional[User]:
        user_idx = next((i for i, u in enumerate(self.users) if u.id == user_id), -1)
        if user_idx >= 0:
            current_data = self.users[user_idx].model_dump()
            current_data.update(updates)
            updated_user = User(**current_data)
            self.users[user_idx] = updated_user
            return updated_user
        return None

    # Leaderboard Methods
    def get_leaderboard(self, mode: str = None) -> List[LeaderboardEntry]:
        entries = self.leaderboard
        if mode:
            entries = [e for e in entries if e.mode == mode]
        return sorted(entries, key=lambda x: x.score, reverse=True)

    def submit_score(self, user_id: str, score_data: GameScore) -> int:
        user = self.get_user_by_id(user_id)
        if not user:
            return 0

        # Update user stats
        user_updates = {'gamesPlayed': user.gamesPlayed + 1}
        if score_data.score > user.highScore:
            user_updates['highScore'] = score_data.score
        
        self.update_user(user_id, user_updates)

        # Add to leaderboard
        entry = LeaderboardEntry(
            id=str(uuid.uuid4()),
            username=user.username,
            score=score_data.score,
            mode=score_data.mode,
            date=datetime.now()
        )
        self.leaderboard.append(entry)
        
        # Calculate rank
        sorted_board = self.get_leaderboard() # Global rank or mode rank? Assuming global/mode specific per frontend
        # mockApi logic sorted everything
        sorted_board = sorted(self.leaderboard, key=lambda x: x.score, reverse=True)
        try:
             rank = next(i for i, e in enumerate(sorted_board) if e.id == entry.id) + 1
        except StopIteration:
             rank = 0
             
        return rank

    # Game Methods
    def get_active_games(self) -> List[ActiveGame]:
        return self.active_games

    def get_game(self, game_id: str) -> Optional[ActiveGame]:
        return next((g for g in self.active_games if g.id == game_id), None)

db = MockDatabase()

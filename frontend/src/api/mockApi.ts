// Centralized mock API layer - all backend calls go through here
// This will be replaced with real API calls when backend is implemented

export interface User {
  id: string;
  username: string;
  email: string;
  highScore: number;
  gamesPlayed: number;
  createdAt: Date;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  mode: 'passthrough' | 'walls';
  date: Date;
}

export interface ActiveGame {
  id: string;
  username: string;
  score: number;
  mode: 'passthrough' | 'walls';
  startedAt: Date;
}

export interface GameScore {
  score: number;
  mode: 'passthrough' | 'walls';
}

// Mock data storage (simulates database)
let mockUsers: User[] = [
  { id: '1', username: 'SnakeMaster', email: 'master@snake.com', highScore: 156, gamesPlayed: 42, createdAt: new Date('2024-01-15') },
  { id: '2', username: 'NeonViper', email: 'viper@snake.com', highScore: 134, gamesPlayed: 38, createdAt: new Date('2024-02-20') },
  { id: '3', username: 'PixelHunter', email: 'pixel@snake.com', highScore: 128, gamesPlayed: 55, createdAt: new Date('2024-01-08') },
];

let mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', username: 'SnakeMaster', score: 156, mode: 'walls', date: new Date('2024-12-28') },
  { id: '2', username: 'NeonViper', score: 134, mode: 'passthrough', date: new Date('2024-12-27') },
  { id: '3', username: 'PixelHunter', score: 128, mode: 'walls', date: new Date('2024-12-26') },
  { id: '4', username: 'CyberSnake', score: 115, mode: 'passthrough', date: new Date('2024-12-25') },
  { id: '5', username: 'GlowWorm', score: 98, mode: 'walls', date: new Date('2024-12-24') },
  { id: '6', username: 'BiteByte', score: 87, mode: 'passthrough', date: new Date('2024-12-23') },
  { id: '7', username: 'RetroRacer', score: 76, mode: 'walls', date: new Date('2024-12-22') },
  { id: '8', username: 'NightCrawler', score: 65, mode: 'passthrough', date: new Date('2024-12-21') },
];

let mockActiveGames: ActiveGame[] = [
  { id: 'game1', username: 'LivePlayer1', score: 45, mode: 'walls', startedAt: new Date() },
  { id: 'game2', username: 'LivePlayer2', score: 32, mode: 'passthrough', startedAt: new Date() },
  { id: 'game3', username: 'LivePlayer3', score: 67, mode: 'walls', startedAt: new Date() },
];

let currentUser: User | null = null;

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Auth API
export const authApi = {
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    await delay(500);
    
    const user = mockUsers.find(u => u.email === email);
    if (user && password.length >= 6) {
      currentUser = user;
      localStorage.setItem('snake_user', JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, error: 'Invalid email or password' };
  },

  async signup(username: string, email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    await delay(500);
    
    if (mockUsers.find(u => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }
    if (mockUsers.find(u => u.username === username)) {
      return { success: false, error: 'Username already taken' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const newUser: User = {
      id: String(mockUsers.length + 1),
      username,
      email,
      highScore: 0,
      gamesPlayed: 0,
      createdAt: new Date(),
    };
    
    mockUsers.push(newUser);
    currentUser = newUser;
    localStorage.setItem('snake_user', JSON.stringify(newUser));
    return { success: true, user: newUser };
  },

  async logout(): Promise<void> {
    await delay(200);
    currentUser = null;
    localStorage.removeItem('snake_user');
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(100);
    
    if (currentUser) return currentUser;
    
    const stored = localStorage.getItem('snake_user');
    if (stored) {
      currentUser = JSON.parse(stored);
      return currentUser;
    }
    return null;
  },
};

// Leaderboard API
export const leaderboardApi = {
  async getLeaderboard(mode?: 'passthrough' | 'walls'): Promise<LeaderboardEntry[]> {
    await delay(300);
    
    let entries = [...mockLeaderboard];
    if (mode) {
      entries = entries.filter(e => e.mode === mode);
    }
    return entries.sort((a, b) => b.score - a.score);
  },

  async submitScore(score: GameScore): Promise<{ success: boolean; rank?: number }> {
    await delay(400);
    
    if (!currentUser) {
      return { success: false };
    }

    const entry: LeaderboardEntry = {
      id: String(Date.now()),
      username: currentUser.username,
      score: score.score,
      mode: score.mode,
      date: new Date(),
    };

    mockLeaderboard.push(entry);
    mockLeaderboard.sort((a, b) => b.score - a.score);

    // Update user stats
    const userIndex = mockUsers.findIndex(u => u.id === currentUser!.id);
    if (userIndex >= 0) {
      mockUsers[userIndex].gamesPlayed++;
      if (score.score > mockUsers[userIndex].highScore) {
        mockUsers[userIndex].highScore = score.score;
      }
      currentUser = mockUsers[userIndex];
      localStorage.setItem('snake_user', JSON.stringify(currentUser));
    }

    const rank = mockLeaderboard.findIndex(e => e.id === entry.id) + 1;
    return { success: true, rank };
  },
};

// Live Games API
export const liveGamesApi = {
  async getActiveGames(): Promise<ActiveGame[]> {
    await delay(200);
    return [...mockActiveGames];
  },

  async getGameStream(gameId: string): Promise<ActiveGame | null> {
    await delay(100);
    return mockActiveGames.find(g => g.id === gameId) || null;
  },

  // Simulate game updates for watching
  simulateGameUpdate(gameId: string): ActiveGame | null {
    const game = mockActiveGames.find(g => g.id === gameId);
    if (game) {
      game.score += Math.floor(Math.random() * 3);
    }
    return game || null;
  },
};

// User API
export const userApi = {
  async getProfile(): Promise<User | null> {
    await delay(200);
    return currentUser;
  },

  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; user?: User }> {
    await delay(300);
    
    if (!currentUser) {
      return { success: false };
    }

    const userIndex = mockUsers.findIndex(u => u.id === currentUser!.id);
    if (userIndex >= 0) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
      currentUser = mockUsers[userIndex];
      localStorage.setItem('snake_user', JSON.stringify(currentUser));
      return { success: true, user: currentUser };
    }
    return { success: false };
  },
};

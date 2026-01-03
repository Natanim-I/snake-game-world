// Centralized API layer connecting to the backend
// Replaces the previous mock implementation

const API_BASE_URL = 'http://localhost:3000';

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

// Helper for authorized requests
const getAuthHeaders = () => {
    const token = localStorage.getItem('snake_token');
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

// Helper to handle response
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.detail || 'API request failed';
        if (typeof errorMessage !== 'string') {
            errorMessage = JSON.stringify(errorMessage);
        }
        throw new Error(errorMessage);
    }
    return response.json();
};

export const authApi = {
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        
        if (!response.ok) {
            const error = await response.json();
            let errorMessage = error.detail || 'Login failed';
            if (typeof errorMessage !== 'string') {
                errorMessage = Array.isArray(errorMessage) 
                    ? errorMessage.map((e: any) => e.msg).join(', ') 
                    : JSON.stringify(errorMessage);
            }
            return { success: false, error: errorMessage };
        }

        const data = await response.json();
        // Backend returns { success: true, token: string, user: User }
        if (data.token) {
            localStorage.setItem('snake_token', data.token);
            // Also store user for simple sync access if needed (optional found in mockApi logic)
            // But main source of truth is /auth/me or API
            // Let's keep storing snake_user for now if app relies on it synchronously on load before check
            localStorage.setItem('snake_user', JSON.stringify(data.user)); 
        }
        return { success: true, user: data.user };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
  },

  async signup(username: string, email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
     try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            let errorMessage = error.detail || 'Signup failed';
            if (typeof errorMessage !== 'string') {
                errorMessage = Array.isArray(errorMessage) 
                    ? errorMessage.map((e: any) => e.msg).join(', ') 
                    : JSON.stringify(errorMessage);
            }
            return { success: false, error: errorMessage };
        }

        const data = await response.json();
        if (data.token) {
            localStorage.setItem('snake_token', data.token);
            localStorage.setItem('snake_user', JSON.stringify(data.user));
        }
        return { success: true, user: data.user };
     } catch (e: any) {
         return { success: false, error: e.message };
     }
  },

  async logout(): Promise<void> {
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
    } catch (e) {
        // Ignore errors on logout
    }
    localStorage.removeItem('snake_token');
    localStorage.removeItem('snake_user');
  },

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('snake_token');
    if (!token) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: getAuthHeaders(),
        });
        if (response.ok) {
            const user = await response.json();
            return user;
        }
        return null;
    } catch {
        return null;
    }
  },
};

export const leaderboardApi = {
  async getLeaderboard(mode?: 'passthrough' | 'walls'): Promise<LeaderboardEntry[]> {
    const query = mode ? `?mode=${mode}` : '';
    const response = await fetch(`${API_BASE_URL}/leaderboard${query}`);
    if (!response.ok) return [];
    return response.json();
  },

  async submitScore(score: GameScore): Promise<{ success: boolean; rank?: number }> {
    try {
        const response = await fetch(`${API_BASE_URL}/leaderboard`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(score),
        });
        if (!response.ok) return { success: false };
        const data = await response.json();
        return { success: true, rank: data.rank };
    } catch {
        return { success: false };
    }
  },
};

export const liveGamesApi = {
  async getActiveGames(): Promise<ActiveGame[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/games/active`);
        if (!response.ok) return [];
        const data = await response.json();
        return data.map((game: any) => ({
            ...game,
            startedAt: new Date(game.startedAt)
        }));
    } catch {
        return [];
    }
  },

  async getGameStream(gameId: string): Promise<ActiveGame | null> {
     try {
        const response = await fetch(`${API_BASE_URL}/games/${gameId}`);
        if (!response.ok) return null;
        const data = await response.json();
        return {
            ...data,
            startedAt: new Date(data.startedAt)
        };
     } catch {
         return null;
     }
  },

  // Simulate game updates for watching (Client-side simulation for now as backend doesn't support streams yet)
  simulateGameUpdate(gameId: string): ActiveGame | null {
    // This part remains client-side simulation as per original mockApi requirements for now
    // Or we could poll, but since we don't have update endpoint, we keep it mocked behavior or return null
    // The previous implementation simulated score increase
    // Let's keep it simple for now or just return null if we want to force real data
    // But since the backend mock DB is static unless modified, simulation helps with "liveness" feel
    return null; 
  },
};

export const userApi = {
  async getProfile(): Promise<User | null> {
    return authApi.getCurrentUser();
  },

  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; user?: User }> {
      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(updates),
        });
        if (!response.ok) return { success: false };
        const data = await response.json();
        // data structure from backend: { success: true, user: User }
        return { success: true, user: data.user };
      } catch {
          return { success: false };
      }
  },
};

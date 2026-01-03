import { render, screen, fireEvent } from '@testing-library/react';
import Index from './Index';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock child components that might render complex stuff or require context
vi.mock('@/components/game/GameBoard', () => ({
  GameBoard: () => <div data-testid="game-board">Game Board</div>
}));

vi.mock('@/components/game/GameControls', () => ({
  GameControls: ({ onStart }: { onStart: () => void }) => (
    <div data-testid="game-controls">
      <button onClick={onStart}>Start Game</button>
    </div>
  )
}));

vi.mock('@/components/Leaderboard', () => ({
    Leaderboard: () => <div data-testid="leaderboard">Leaderboard</div>
}));

vi.mock('@/components/LiveGames', () => ({
    LiveGames: () => <div data-testid="live-games">Live Games</div>
}));

// Mock hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
  })
}));

// Mock useSnakeGame
const mockStartGame = vi.fn();
vi.mock('@/hooks/useSnakeGame', () => ({
  useSnakeGame: () => ({
    gameState: {
      status: 'idle',
      score: 0,
      snake: [],
      food: {},
      mode: 'walls'
    },
    startGame: mockStartGame,
    pauseGame: vi.fn(),
    resetGame: vi.fn(),
    setDirection: vi.fn(),
  }),
  // Export enums or types if needed by runtime (Vitest handles this usually)
}));

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('Index Page', () => {
    
  it('should render game view by default', () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    );

    expect(screen.getByTestId('game-board')).toBeInTheDocument();
    expect(screen.getByTestId('game-controls')).toBeInTheDocument();
    expect(screen.queryByTestId('leaderboard')).not.toBeInTheDocument();
  });

  it('should switch to leaderboard view', () => {
    render(
      <BrowserRouter>
         <Index />
      </BrowserRouter>
    );

    const leaderboardLink = screen.getByText('Leaderboard');
    fireEvent.click(leaderboardLink);

    expect(screen.getByTestId('leaderboard')).toBeInTheDocument();
    expect(screen.queryByTestId('game-board')).not.toBeInTheDocument();
  });

  it('should start game when start button clicked', () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    );

    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);

    expect(mockStartGame).toHaveBeenCalled();
  });
});

import { render, screen } from '@testing-library/react';
import { GameBoard } from './GameBoard';
import { describe, it, expect } from 'vitest';
import { GameState } from '@/hooks/useSnakeGame';

describe('GameBoard', () => {
  const mockGameState: GameState = {
    snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
    food: { x: 15, y: 10 },
    direction: 'RIGHT',
    score: 0,
    status: 'playing',
    mode: 'walls',
    gridSize: 20,
  };

  it('should render the snake and food', () => {
    const { container } = render(<GameBoard gameState={mockGameState} />);
    
    // Check for snake segments (all have transition-all)
    const snakeSegments = container.querySelectorAll('.transition-all');
    expect(snakeSegments.length).toBe(3); // Head + 2 body

    // Check for food
    const food = container.querySelector('[style*="hsl(var(--food))"]');
    expect(food).toBeInTheDocument();
  });

  it('should apply spectating styles when isSpectating is true', () => {
    const { container } = render(<GameBoard gameState={mockGameState} isSpectating={true} />);
    
    // Check for spectating specific class
    const board = container.firstElementChild;
    expect(board).toHaveClass('box-glow-pink');
  });

  it('should show wall indicator in walls mode', () => {
    const { container } = render(<GameBoard gameState={mockGameState} />);
    // Check for wall border div (it's the last one based on code)
    // Checking by style because it doesn't have a unique class or id, but has border-destructive
    const walls = container.querySelector('[style*="hsl(var(--destructive) / 0.5)"]');
    expect(walls).toBeInTheDocument();
  });

  it('should not show wall indicator in passthrough mode', () => {
    const passthroughState = { ...mockGameState, mode: 'passthrough' as const };
    const { container } = render(<GameBoard gameState={passthroughState} />);
    
    const walls = container.querySelector('[style*="hsl(var(--destructive) / 0.5)"]');
    expect(walls).not.toBeInTheDocument();
  });
});

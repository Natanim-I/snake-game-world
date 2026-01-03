import { renderHook, act } from '@testing-library/react';
import { useSnakeGame } from './useSnakeGame';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useSnakeGame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSnakeGame());
    
    expect(result.current.gameState.score).toBe(0);
    expect(result.current.gameState.status).toBe('idle');
    expect(result.current.gameState.snake).toHaveLength(3);
    expect(result.current.gameState.direction).toBe('RIGHT');
  });

  it('should start the game', () => {
    const { result } = renderHook(() => useSnakeGame());
    
    act(() => {
      result.current.startGame();
    });

    expect(result.current.gameState.status).toBe('playing');
  });

  it('should move the snake on tick when playing', () => {
    const { result } = renderHook(() => useSnakeGame());
    
    act(() => {
      result.current.startGame();
    });

    const initialHead = result.current.gameState.snake[0];

    act(() => {
      vi.advanceTimersByTime(200); // 150ms is default speed roughly
    });

    const newHead = result.current.gameState.snake[0];
    // Default direction is RIGHT, so x should increase
    expect(newHead.x).toBe(initialHead.x + 1);
    expect(newHead.y).toBe(initialHead.y);
  });

  it('should change direction', () => {
    const { result } = renderHook(() => useSnakeGame());
    
    act(() => {
        result.current.startGame();
    });

    act(() => {
      result.current.setDirection('DOWN');
    });
    
    // Direction change happens on next tick usually or immediately depending on impl.
    // In this impl, setDirection queues it for the game loop, or updates ref.
    // But checking state might require a tick if it only updates on move.
    // Let's check if the hook exposes direction immediately or if we need to wait for move.
    // Looking at useSnakeGame, setDirection updates refs, but moveSnake updates state.
    // However, the hook returns `gameState` which has `direction`. 
    // `gameState.direction` is updated in `moveSnake`.
    
    act(() => {
        vi.advanceTimersByTime(200);
    });

    expect(result.current.gameState.direction).toBe('DOWN');
  });

  it('should pause and resume game', () => {
    const { result } = renderHook(() => useSnakeGame());
    
    act(() => {
      result.current.startGame();
    });
    expect(result.current.gameState.status).toBe('playing');

    act(() => {
      result.current.pauseGame();
    });
    expect(result.current.gameState.status).toBe('paused');

    act(() => {
      result.current.pauseGame();
    });
    expect(result.current.gameState.status).toBe('playing');
  });

  it('should reset game', () => {
    const { result } = renderHook(() => useSnakeGame());
    
    act(() => {
      result.current.startGame();
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    // Verify it moved
    expect(result.current.gameState.snake[0].x).not.toBe(10); 

    act(() => {
        result.current.resetGame();
    });

    expect(result.current.gameState.status).toBe('idle');
    expect(result.current.gameState.score).toBe(0);
    expect(result.current.gameState.snake[0]).toEqual({ x: 10, y: 10 });
  });

  it('should handle game over on wall collision (walls mode)', () => {
     // Initialize with a snake close to the wall for easier testing
     // But we can't easily inject state. We have to move it.
     // Or we can mock the initial state? useSnakeGame doesn't accept initial state.
     // We will just run it enough times to hit a wall.
     
     const { result } = renderHook(() => useSnakeGame('walls'));
     act(() => {
         result.current.startGame();
     });

     // Move right until hitting wall (grid size 20, start 10)
     act(() => {
         vi.advanceTimersByTime(3000); // Plenty of time to hit wall
     });

     expect(result.current.gameState.status).toBe('gameover');
  });
});

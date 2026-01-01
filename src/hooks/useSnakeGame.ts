import { useState, useCallback, useEffect, useRef } from 'react';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type GameMode = 'passthrough' | 'walls';
export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  score: number;
  status: GameStatus;
  mode: GameMode;
  gridSize: number;
}

const GRID_SIZE = 20;
const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

const getRandomPosition = (gridSize: number, exclude: Position[] = []): Position => {
  let pos: Position;
  do {
    pos = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (exclude.some(p => p.x === pos.x && p.y === pos.y));
  return pos;
};

const getOppositeDirection = (dir: Direction): Direction => {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };
  return opposites[dir];
};

export function useSnakeGame(mode: GameMode = 'walls') {
  const [gameState, setGameState] = useState<GameState>(() => ({
    snake: [...INITIAL_SNAKE],
    food: getRandomPosition(GRID_SIZE, INITIAL_SNAKE),
    direction: 'RIGHT',
    score: 0,
    status: 'idle',
    mode,
    gridSize: GRID_SIZE,
  }));

  const directionRef = useRef<Direction>(gameState.direction);
  const nextDirectionRef = useRef<Direction | null>(null);
  const gameLoopRef = useRef<number | null>(null);

  const resetGame = useCallback(() => {
    const initialSnake = [...INITIAL_SNAKE];
    setGameState({
      snake: initialSnake,
      food: getRandomPosition(GRID_SIZE, initialSnake),
      direction: 'RIGHT',
      score: 0,
      status: 'idle',
      mode,
      gridSize: GRID_SIZE,
    });
    directionRef.current = 'RIGHT';
    nextDirectionRef.current = null;
  }, [mode]);

  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'playing' }));
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      status: prev.status === 'playing' ? 'paused' : 'playing',
    }));
  }, []);

  const setDirection = useCallback((newDirection: Direction) => {
    const currentDir = directionRef.current;
    if (newDirection !== getOppositeDirection(currentDir) && newDirection !== currentDir) {
      nextDirectionRef.current = newDirection;
    }
  }, []);

  const moveSnake = useCallback(() => {
    setGameState(prev => {
      if (prev.status !== 'playing') return prev;

      // Apply queued direction change
      if (nextDirectionRef.current) {
        directionRef.current = nextDirectionRef.current;
        nextDirectionRef.current = null;
      }

      const direction = directionRef.current;
      const head = prev.snake[0];
      let newHead: Position;

      switch (direction) {
        case 'UP':
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case 'DOWN':
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case 'LEFT':
          newHead = { x: head.x - 1, y: head.y };
          break;
        case 'RIGHT':
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      // Handle wall collision based on mode
      if (prev.mode === 'passthrough') {
        // Wrap around
        if (newHead.x < 0) newHead.x = prev.gridSize - 1;
        if (newHead.x >= prev.gridSize) newHead.x = 0;
        if (newHead.y < 0) newHead.y = prev.gridSize - 1;
        if (newHead.y >= prev.gridSize) newHead.y = 0;
      } else {
        // Wall collision = game over
        if (newHead.x < 0 || newHead.x >= prev.gridSize || 
            newHead.y < 0 || newHead.y >= prev.gridSize) {
          return { ...prev, status: 'gameover' as GameStatus, direction };
        }
      }

      // Self collision check
      if (prev.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        return { ...prev, status: 'gameover' as GameStatus, direction };
      }

      const newSnake = [newHead, ...prev.snake];
      let newFood = prev.food;
      let newScore = prev.score;

      // Check food collision
      if (newHead.x === prev.food.x && newHead.y === prev.food.y) {
        newScore += 10;
        newFood = getRandomPosition(prev.gridSize, newSnake);
      } else {
        newSnake.pop();
      }

      return {
        ...prev,
        snake: newSnake,
        food: newFood,
        score: newScore,
        direction,
      };
    });
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState.status === 'playing') {
      const speed = Math.max(50, 150 - Math.floor(gameState.score / 50) * 10);
      gameLoopRef.current = window.setInterval(moveSnake, speed);
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.status, gameState.score, moveSnake]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.status !== 'playing' && gameState.status !== 'paused') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          setDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          setDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          setDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          setDirection('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          pauseGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status, setDirection, pauseGame]);

  return {
    gameState,
    startGame,
    pauseGame,
    resetGame,
    setDirection,
  };
}

// Simulated game for watching others play
export function useSimulatedGame(mode: GameMode = 'walls') {
  const [gameState, setGameState] = useState<GameState>(() => ({
    snake: [...INITIAL_SNAKE],
    food: getRandomPosition(GRID_SIZE, INITIAL_SNAKE),
    direction: 'RIGHT',
    score: 0,
    status: 'playing',
    mode,
    gridSize: GRID_SIZE,
  }));

  const directionRef = useRef<Direction>('RIGHT');

  useEffect(() => {
    const moveSnake = () => {
      setGameState(prev => {
        if (prev.status !== 'playing') return prev;

        const head = prev.snake[0];
        const food = prev.food;
        
        // Simple AI: move towards food with some randomness
        let newDirection = directionRef.current;
        
        if (Math.random() > 0.3) {
          const dx = food.x - head.x;
          const dy = food.y - head.y;
          
          if (Math.abs(dx) > Math.abs(dy)) {
            newDirection = dx > 0 ? 'RIGHT' : 'LEFT';
          } else {
            newDirection = dy > 0 ? 'DOWN' : 'UP';
          }
          
          // Don't reverse
          if (newDirection !== getOppositeDirection(directionRef.current)) {
            directionRef.current = newDirection;
          }
        }

        const direction = directionRef.current;
        let newHead: Position;

        switch (direction) {
          case 'UP':
            newHead = { x: head.x, y: head.y - 1 };
            break;
          case 'DOWN':
            newHead = { x: head.x, y: head.y + 1 };
            break;
          case 'LEFT':
            newHead = { x: head.x - 1, y: head.y };
            break;
          case 'RIGHT':
            newHead = { x: head.x + 1, y: head.y };
            break;
        }

        // Handle boundaries
        if (prev.mode === 'passthrough') {
          if (newHead.x < 0) newHead.x = prev.gridSize - 1;
          if (newHead.x >= prev.gridSize) newHead.x = 0;
          if (newHead.y < 0) newHead.y = prev.gridSize - 1;
          if (newHead.y >= prev.gridSize) newHead.y = 0;
        } else {
          if (newHead.x < 0 || newHead.x >= prev.gridSize || 
              newHead.y < 0 || newHead.y >= prev.gridSize) {
            // Reset instead of game over for simulation
            return {
              ...prev,
              snake: [...INITIAL_SNAKE],
              food: getRandomPosition(prev.gridSize, INITIAL_SNAKE),
              direction: 'RIGHT',
              score: 0,
            };
          }
        }

        // Self collision - reset
        if (prev.snake.slice(0, -1).some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          directionRef.current = 'RIGHT';
          return {
            ...prev,
            snake: [...INITIAL_SNAKE],
            food: getRandomPosition(prev.gridSize, INITIAL_SNAKE),
            direction: 'RIGHT',
            score: 0,
          };
        }

        const newSnake = [newHead, ...prev.snake];
        let newFood = prev.food;
        let newScore = prev.score;

        if (newHead.x === prev.food.x && newHead.y === prev.food.y) {
          newScore += 10;
          newFood = getRandomPosition(prev.gridSize, newSnake);
        } else {
          newSnake.pop();
        }

        return {
          ...prev,
          snake: newSnake,
          food: newFood,
          score: newScore,
          direction,
        };
      });
    };

    const interval = setInterval(moveSnake, 150);
    return () => clearInterval(interval);
  }, [mode]);

  return gameState;
}

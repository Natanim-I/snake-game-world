import React from 'react';
import { GameState } from '@/hooks/useSnakeGame';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  gameState: GameState;
  className?: string;
  isSpectating?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  gameState, 
  className,
  isSpectating = false 
}) => {
  const { snake, food, gridSize } = gameState;
  const cellSize = 100 / gridSize;

  return (
    <div 
      className={cn(
        "relative aspect-square w-full max-w-[500px] rounded-lg border-2 border-primary overflow-hidden",
        "bg-background grid-pattern",
        isSpectating ? "box-glow-pink" : "box-glow",
        className
      )}
      style={{
        boxShadow: isSpectating 
          ? '0 0 30px hsl(var(--neon-pink) / 0.4), inset 0 0 60px hsl(var(--neon-pink) / 0.1)'
          : '0 0 30px hsl(var(--primary) / 0.4), inset 0 0 60px hsl(var(--primary) / 0.1)',
      }}
    >
      {/* Food */}
      <div
        className="absolute rounded-full animate-food-pulse"
        style={{
          left: `${food.x * cellSize}%`,
          top: `${food.y * cellSize}%`,
          width: `${cellSize}%`,
          height: `${cellSize}%`,
          backgroundColor: 'hsl(var(--food))',
          boxShadow: '0 0 15px hsl(var(--food) / 0.8), 0 0 30px hsl(var(--food) / 0.5)',
        }}
      />

      {/* Snake */}
      {snake.map((segment, index) => {
        const isHead = index === 0;
        return (
          <div
            key={`${segment.x}-${segment.y}-${index}`}
            className={cn(
              "absolute rounded-sm transition-all duration-75",
              isHead && "rounded-md"
            )}
            style={{
              left: `${segment.x * cellSize}%`,
              top: `${segment.y * cellSize}%`,
              width: `${cellSize}%`,
              height: `${cellSize}%`,
              backgroundColor: isHead 
                ? 'hsl(var(--snake-head))' 
                : `hsl(160 ${80 - index * 2}% ${45 - index}%)`,
              boxShadow: isHead 
                ? '0 0 10px hsl(var(--snake-head) / 0.8), 0 0 20px hsl(var(--snake-head) / 0.5)'
                : '0 0 5px hsl(var(--snake-body) / 0.5)',
              transform: isHead ? 'scale(1.1)' : 'scale(0.95)',
            }}
          />
        );
      })}

      {/* Walls indicator for walls mode */}
      {gameState.mode === 'walls' && (
        <div 
          className="absolute inset-0 pointer-events-none border-4 rounded-lg"
          style={{
            borderColor: 'hsl(var(--destructive) / 0.5)',
            boxShadow: 'inset 0 0 20px hsl(var(--destructive) / 0.2)',
          }}
        />
      )}
    </div>
  );
};

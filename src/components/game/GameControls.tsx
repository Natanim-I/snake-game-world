import React from 'react';
import { Button } from '@/components/ui/button';
import { GameStatus, Direction } from '@/hooks/useSnakeGame';
import { Play, Pause, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface GameControlsProps {
  status: GameStatus;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onDirection: (dir: Direction) => void;
  score: number;
}

export const GameControls: React.FC<GameControlsProps> = ({
  status,
  onStart,
  onPause,
  onReset,
  onDirection,
  score,
}) => {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Score Display */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground uppercase tracking-wider">Score</p>
        <p className="text-4xl font-display font-bold text-glow">{score}</p>
      </div>

      {/* Game Status Actions */}
      <div className="flex gap-3">
        {status === 'idle' && (
          <Button onClick={onStart} size="lg">
            <Play className="mr-2 h-5 w-5" />
            Start Game
          </Button>
        )}
        
        {status === 'playing' && (
          <Button onClick={onPause} variant="outline" size="lg">
            <Pause className="mr-2 h-5 w-5" />
            Pause
          </Button>
        )}
        
        {status === 'paused' && (
          <Button onClick={onPause} size="lg">
            <Play className="mr-2 h-5 w-5" />
            Resume
          </Button>
        )}
        
        {status === 'gameover' && (
          <Button onClick={onReset} variant="secondary" size="lg">
            <RotateCcw className="mr-2 h-5 w-5" />
            Play Again
          </Button>
        )}
        
        {(status === 'playing' || status === 'paused') && (
          <Button onClick={onReset} variant="ghost" size="lg">
            <RotateCcw className="mr-2 h-5 w-5" />
            Reset
          </Button>
        )}
      </div>

      {/* Mobile Direction Controls */}
      <div className="grid grid-cols-3 gap-2 md:hidden">
        <div />
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDirection('UP')}
          disabled={status !== 'playing'}
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
        <div />
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDirection('LEFT')}
          disabled={status !== 'playing'}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDirection('DOWN')}
          disabled={status !== 'playing'}
        >
          <ArrowDown className="h-6 w-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDirection('RIGHT')}
          disabled={status !== 'playing'}
        >
          <ArrowRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Keyboard Instructions */}
      <div className="hidden md:block text-center text-sm text-muted-foreground">
        <p>Use <kbd className="px-2 py-1 bg-muted rounded text-foreground">Arrow Keys</kbd> or <kbd className="px-2 py-1 bg-muted rounded text-foreground">WASD</kbd> to move</p>
        <p className="mt-1">Press <kbd className="px-2 py-1 bg-muted rounded text-foreground">Space</kbd> to pause</p>
      </div>
    </div>
  );
};

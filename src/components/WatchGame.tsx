import React from 'react';
import { GameBoard } from '@/components/game/GameBoard';
import { useSimulatedGame, GameMode } from '@/hooks/useSnakeGame';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Repeat, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WatchGameProps {
  playerName: string;
  mode: GameMode;
  onBack: () => void;
}

export const WatchGame: React.FC<WatchGameProps> = ({
  playerName,
  mode,
  onBack,
}) => {
  const gameState = useSimulatedGame(mode);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Games
        </Button>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
          </span>
          <span className="text-destructive font-display uppercase tracking-wider text-sm">
            Live
          </span>
        </div>
      </div>

      {/* Player Info */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-display font-bold text-glow-pink">
          Watching {playerName}
        </h2>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          {mode === 'passthrough' ? (
            <>
              <Repeat className="h-4 w-4 text-neon-cyan" />
              <span>Pass-Through Mode</span>
            </>
          ) : (
            <>
              <Square className="h-4 w-4 text-neon-pink" />
              <span>Walls Mode</span>
            </>
          )}
        </div>
      </div>

      {/* Score */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground uppercase tracking-wider">Score</p>
        <p className="text-4xl font-display font-bold text-glow-pink">{gameState.score}</p>
      </div>

      {/* Game Board */}
      <div className="flex justify-center">
        <GameBoard gameState={gameState} isSpectating />
      </div>

      {/* Info */}
      <p className="text-center text-sm text-muted-foreground">
        You're watching a simulated game. In multiplayer mode, this would be a real player.
      </p>
    </div>
  );
};

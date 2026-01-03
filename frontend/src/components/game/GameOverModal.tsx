import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trophy, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameOverModalProps {
  score: number;
  isOpen: boolean;
  onPlayAgain: () => void;
  onGoHome: () => void;
  isHighScore?: boolean;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  isOpen,
  onPlayAgain,
  onGoHome,
  isHighScore = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div 
        className={cn(
          "relative p-8 rounded-xl border-2 bg-card",
          "shadow-[0_0_60px_hsl(var(--destructive)/0.3)]",
          "border-destructive animate-in fade-in zoom-in duration-300"
        )}
      >
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-display font-bold text-destructive">
            Game Over
          </h2>
          
          <div className="space-y-2">
            <p className="text-muted-foreground uppercase tracking-wider text-sm">
              Final Score
            </p>
            <p className="text-5xl font-display font-bold text-glow">
              {score}
            </p>
          </div>

          {isHighScore && (
            <div className="flex items-center justify-center gap-2 text-neon-yellow">
              <Trophy className="h-6 w-6" />
              <span className="font-display uppercase tracking-wider">New High Score!</span>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Button onClick={onPlayAgain} size="lg">
              <RotateCcw className="mr-2 h-5 w-5" />
              Play Again
            </Button>
            <Button onClick={onGoHome} variant="outline" size="lg">
              <Home className="mr-2 h-5 w-5" />
              Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

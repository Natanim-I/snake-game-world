import React from 'react';
import { GameMode } from '@/hooks/useSnakeGame';
import { cn } from '@/lib/utils';
import { Repeat, Square } from 'lucide-react';

interface ModeSelectorProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  disabled?: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  mode,
  onModeChange,
  disabled = false,
}) => {
  return (
    <div className="flex gap-4">
      <button
        onClick={() => onModeChange('passthrough')}
        disabled={disabled}
        className={cn(
          "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200",
          "hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed",
          mode === 'passthrough'
            ? "border-neon-cyan bg-neon-cyan/10 shadow-[0_0_20px_hsl(var(--neon-cyan)/0.4)]"
            : "border-border bg-card hover:border-neon-cyan/50"
        )}
      >
        <Repeat className={cn(
          "h-8 w-8",
          mode === 'passthrough' ? "text-neon-cyan" : "text-muted-foreground"
        )} />
        <span className={cn(
          "font-display text-sm uppercase tracking-wider",
          mode === 'passthrough' ? "text-neon-cyan" : "text-muted-foreground"
        )}>
          Pass-Through
        </span>
        <span className="text-xs text-muted-foreground text-center">
          Go through walls
        </span>
      </button>

      <button
        onClick={() => onModeChange('walls')}
        disabled={disabled}
        className={cn(
          "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200",
          "hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed",
          mode === 'walls'
            ? "border-neon-pink bg-neon-pink/10 shadow-[0_0_20px_hsl(var(--neon-pink)/0.4)]"
            : "border-border bg-card hover:border-neon-pink/50"
        )}
      >
        <Square className={cn(
          "h-8 w-8",
          mode === 'walls' ? "text-neon-pink" : "text-muted-foreground"
        )} />
        <span className={cn(
          "font-display text-sm uppercase tracking-wider",
          mode === 'walls' ? "text-neon-pink" : "text-muted-foreground"
        )}>
          Walls
        </span>
        <span className="text-xs text-muted-foreground text-center">
          Hit wall = game over
        </span>
      </button>
    </div>
  );
};

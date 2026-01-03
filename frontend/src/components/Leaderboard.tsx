import React, { useEffect, useState } from 'react';
import { LeaderboardEntry, leaderboardApi } from '@/api/mockApi';
import { GameMode } from '@/hooks/useSnakeGame';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Award, Repeat, Square } from 'lucide-react';

interface LeaderboardProps {
  filterMode?: GameMode;
  limit?: number;
  className?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  filterMode,
  limit = 10,
  className,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<GameMode | undefined>(filterMode);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const data = await leaderboardApi.getLeaderboard(selectedMode);
      setEntries(data.slice(0, limit));
      setLoading(false);
    };
    fetchLeaderboard();
  }, [selectedMode, limit]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-neon-yellow" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground w-5 text-center">{rank}</span>;
    }
  };

  const getModeIcon = (mode: GameMode) => {
    return mode === 'passthrough' 
      ? <Repeat className="h-4 w-4 text-neon-cyan" />
      : <Square className="h-4 w-4 text-neon-pink" />;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Mode Filter */}
      {!filterMode && (
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedMode(undefined)}
            className={cn(
              "px-4 py-2 rounded-lg border-2 font-display text-sm uppercase tracking-wider transition-all",
              !selectedMode 
                ? "border-primary bg-primary/10 text-primary" 
                : "border-border text-muted-foreground hover:border-primary/50"
            )}
          >
            All
          </button>
          <button
            onClick={() => setSelectedMode('passthrough')}
            className={cn(
              "px-4 py-2 rounded-lg border-2 font-display text-sm uppercase tracking-wider transition-all flex items-center gap-2",
              selectedMode === 'passthrough'
                ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                : "border-border text-muted-foreground hover:border-neon-cyan/50"
            )}
          >
            <Repeat className="h-4 w-4" />
            Pass-Through
          </button>
          <button
            onClick={() => setSelectedMode('walls')}
            className={cn(
              "px-4 py-2 rounded-lg border-2 font-display text-sm uppercase tracking-wider transition-all flex items-center gap-2",
              selectedMode === 'walls'
                ? "border-neon-pink bg-neon-pink/10 text-neon-pink"
                : "border-border text-muted-foreground hover:border-neon-pink/50"
            )}
          >
            <Square className="h-4 w-4" />
            Walls
          </button>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="rounded-lg border-2 border-border overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 bg-muted/50 border-b border-border font-display text-sm uppercase tracking-wider text-muted-foreground">
          <span>Rank</span>
          <span>Player</span>
          <span>Mode</span>
          <span>Score</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No scores yet. Be the first!
          </div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={cn(
                  "grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 items-center transition-colors hover:bg-muted/30",
                  index < 3 && "bg-muted/20"
                )}
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(index + 1)}
                </div>
                <span className={cn(
                  "font-medium truncate",
                  index < 3 && "text-glow"
                )}>
                  {entry.username}
                </span>
                <div className="flex items-center">
                  {getModeIcon(entry.mode)}
                </div>
                <span className={cn(
                  "font-display font-bold tabular-nums",
                  index === 0 && "text-neon-yellow",
                  index === 1 && "text-gray-400",
                  index === 2 && "text-amber-600"
                )}>
                  {entry.score}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

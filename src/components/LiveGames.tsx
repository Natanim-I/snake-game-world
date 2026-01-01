import React, { useEffect, useState } from 'react';
import { ActiveGame, liveGamesApi } from '@/api/mockApi';
import { cn } from '@/lib/utils';
import { Eye, Users, Repeat, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LiveGamesProps {
  onWatchGame: (gameId: string) => void;
  className?: string;
}

export const LiveGames: React.FC<LiveGamesProps> = ({
  onWatchGame,
  className,
}) => {
  const [games, setGames] = useState<ActiveGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      const data = await liveGamesApi.getActiveGames();
      setGames(data);
      setLoading(false);
    };
    fetchGames();

    // Simulate live updates
    const interval = setInterval(() => {
      setGames(prev => prev.map(game => ({
        ...game,
        score: game.score + Math.floor(Math.random() * 5),
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getModeIcon = (mode: 'passthrough' | 'walls') => {
    return mode === 'passthrough' 
      ? <Repeat className="h-4 w-4 text-neon-cyan" />
      : <Square className="h-4 w-4 text-neon-pink" />;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Users className="h-5 w-5" />
        <span className="font-display uppercase tracking-wider text-sm">
          {games.length} Players Online
        </span>
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
        </span>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-8">
          Loading live games...
        </div>
      ) : games.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No games currently being played
        </div>
      ) : (
        <div className="grid gap-4">
          {games.map((game) => (
            <div
              key={game.id}
              className="p-4 rounded-lg border-2 border-border bg-card hover:border-primary/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {game.username}
                    </span>
                    {getModeIcon(game.mode)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-display tabular-nums">
                      Score: <span className="text-foreground">{game.score}</span>
                    </span>
                    <span>
                      {Math.floor((Date.now() - game.startedAt.getTime()) / 60000)}m ago
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onWatchGame(game.id)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Watch
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

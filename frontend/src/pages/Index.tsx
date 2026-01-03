import React, { useState, useCallback, useEffect } from 'react';
import { Header } from '@/components/Header';
import { GameBoard } from '@/components/game/GameBoard';
import { GameControls } from '@/components/game/GameControls';
import { ModeSelector } from '@/components/game/ModeSelector';
import { GameOverModal } from '@/components/game/GameOverModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { Leaderboard } from '@/components/Leaderboard';
import { LiveGames } from '@/components/LiveGames';
import { WatchGame } from '@/components/WatchGame';
import { useAuth } from '@/hooks/useAuth';
import { useSnakeGame, GameMode } from '@/hooks/useSnakeGame';
import { leaderboardApi } from '@/api/mockApi';
import { useToast } from '@/hooks/use-toast';

type View = 'game' | 'leaderboard' | 'watch';

interface WatchingState {
  gameId: string;
  playerName: string;
  mode: GameMode;
}

const Index = () => {
  const { user, login, signup, logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>('game');
  const [gameMode, setGameMode] = useState<GameMode>('walls');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [watching, setWatching] = useState<WatchingState | null>(null);
  const { toast } = useToast();
  
  const { gameState, startGame, pauseGame, resetGame, setDirection } = useSnakeGame(gameMode);

  // Reset game when mode changes
  useEffect(() => {
    resetGame();
  }, [gameMode, resetGame]);

  // Submit score when game ends
  useEffect(() => {
    if (gameState.status === 'gameover' && gameState.score > 0) {
      if (user) {
        leaderboardApi.submitScore({
          score: gameState.score,
          mode: gameState.mode,
        }).then(result => {
          if (result.success && result.rank && result.rank <= 10) {
            toast({
              title: "🏆 Top 10!",
              description: `You ranked #${result.rank} on the leaderboard!`,
            });
          }
        });
      }
    }
  }, [gameState.status, gameState.score, gameState.mode, user, toast]);

  const handleModeChange = useCallback((mode: GameMode) => {
    if (gameState.status === 'idle' || gameState.status === 'gameover') {
      setGameMode(mode);
    }
  }, [gameState.status]);

  const handleGoHome = useCallback(() => {
    resetGame();
    setCurrentView('game');
  }, [resetGame]);

  const handleWatchGame = useCallback((gameId: string) => {
    // Mock data for watching
    const mockPlayers: Record<string, { name: string; mode: GameMode }> = {
      'game1': { name: 'LivePlayer1', mode: 'walls' },
      'game2': { name: 'LivePlayer2', mode: 'passthrough' },
      'game3': { name: 'LivePlayer3', mode: 'walls' },
    };
    
    const player = mockPlayers[gameId];
    if (player) {
      setWatching({
        gameId,
        playerName: player.name,
        mode: player.mode,
      });
    }
  }, []);

  const handleBackFromWatch = useCallback(() => {
    setWatching(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          setWatching(null);
        }}
        onLoginClick={() => setShowAuthModal(true)}
        onLogout={logout}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Game View */}
        {currentView === 'game' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-display uppercase tracking-wider text-muted-foreground mb-4">
                Select Mode
              </h2>
              <div className="flex justify-center">
                <ModeSelector
                  mode={gameMode}
                  onModeChange={handleModeChange}
                  disabled={gameState.status === 'playing' || gameState.status === 'paused'}
                />
              </div>
            </div>

            <div className="flex justify-center">
              <GameBoard gameState={gameState} />
            </div>

            <GameControls
              status={gameState.status}
              score={gameState.score}
              onStart={startGame}
              onPause={pauseGame}
              onReset={resetGame}
              onDirection={setDirection}
            />

            {!user && (
              <p className="text-center text-sm text-muted-foreground">
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>
                {' '}to save your scores and compete on the leaderboard
              </p>
            )}
          </div>
        )}

        {/* Leaderboard View */}
        {currentView === 'leaderboard' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-glow text-center mb-8">
              Leaderboard
            </h2>
            <Leaderboard />
          </div>
        )}

        {/* Watch View */}
        {currentView === 'watch' && (
          <div className="max-w-2xl mx-auto">
            {watching ? (
              <WatchGame
                playerName={watching.playerName}
                mode={watching.mode}
                onBack={handleBackFromWatch}
              />
            ) : (
              <>
                <h2 className="text-3xl font-display font-bold text-glow text-center mb-8">
                  Live Games
                </h2>
                <LiveGames onWatchGame={handleWatchGame} />
              </>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={login}
        onSignup={signup}
      />

      <GameOverModal
        score={gameState.score}
        isOpen={gameState.status === 'gameover'}
        onPlayAgain={resetGame}
        onGoHome={handleGoHome}
        isHighScore={user ? gameState.score > (user.highScore || 0) : false}
      />
    </div>
  );
};

export default Index;

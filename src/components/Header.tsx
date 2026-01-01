import React from 'react';
import { Button } from '@/components/ui/button';
import { User } from '@/api/mockApi';
import { LogIn, LogOut, Trophy, Eye, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  user: User | null;
  currentView: 'game' | 'leaderboard' | 'watch';
  onViewChange: (view: 'game' | 'leaderboard' | 'watch') => void;
  onLoginClick: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currentView,
  onViewChange,
  onLoginClick,
  onLogout,
}) => {
  return (
    <header className="border-b-2 border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <h1 
            className="text-2xl font-display font-bold text-glow cursor-pointer"
            onClick={() => onViewChange('game')}
          >
            NEON SNAKE
          </h1>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Button
              variant={currentView === 'game' ? 'default' : 'ghost'}
              onClick={() => onViewChange('game')}
            >
              <Gamepad2 className="mr-2 h-4 w-4" />
              Play
            </Button>
            <Button
              variant={currentView === 'leaderboard' ? 'default' : 'ghost'}
              onClick={() => onViewChange('leaderboard')}
            >
              <Trophy className="mr-2 h-4 w-4" />
              Leaderboard
            </Button>
            <Button
              variant={currentView === 'watch' ? 'default' : 'ghost'}
              onClick={() => onViewChange('watch')}
            >
              <Eye className="mr-2 h-4 w-4" />
              Watch
            </Button>
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="font-medium text-foreground">{user.username}</p>
                  <p className="text-xs text-muted-foreground">
                    High Score: {user.highScore}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={onLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={onLoginClick}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center justify-center gap-2 mt-4">
          <Button
            variant={currentView === 'game' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('game')}
          >
            <Gamepad2 className="h-4 w-4" />
          </Button>
          <Button
            variant={currentView === 'leaderboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('leaderboard')}
          >
            <Trophy className="h-4 w-4" />
          </Button>
          <Button
            variant={currentView === 'watch' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('watch')}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </nav>
      </div>
    </header>
  );
};

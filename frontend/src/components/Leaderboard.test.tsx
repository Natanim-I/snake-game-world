import { render, screen, waitFor } from '@testing-library/react';
import { Leaderboard } from './Leaderboard';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { leaderboardApi } from '@/api/mockApi';

// Mock the leaderboardApi
vi.mock('@/api/mockApi', () => ({
  leaderboardApi: {
    getLeaderboard: vi.fn(),
  },
}));

describe('Leaderboard', () => {
  const mockEntries = [
    { id: '1', username: 'Player1', score: 100, mode: 'walls', date: '2023-01-01' },
    { id: '2', username: 'Player2', score: 80, mode: 'passthrough', date: '2023-01-01' },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should render loading state initially', async () => {
    (leaderboardApi.getLeaderboard as any).mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<Leaderboard />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render leaderboard entries', async () => {
    (leaderboardApi.getLeaderboard as any).mockResolvedValue(mockEntries);
    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Player1')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Player2')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
  });

  it('should render empty state when no scores', async () => {
    (leaderboardApi.getLeaderboard as any).mockResolvedValue([]);
    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText('No scores yet. Be the first!')).toBeInTheDocument();
    });
  });
});

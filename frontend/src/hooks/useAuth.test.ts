import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi } from '@/api/mockApi';

// Mock the authApi
vi.mock('@/api/mockApi', () => ({
  authApi: {
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should check auth on mount', async () => {
    const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
    (authApi.getCurrentUser as any).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();

    await waitFor(() => {
        expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle login success', async () => {
    (authApi.getCurrentUser as any).mockResolvedValue(null); // Initially not logged in
    const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
    (authApi.login as any).mockResolvedValue({ success: true, user: mockUser });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
        expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.login('test@example.com', 'password');
    });
    
    // Login sets loading to true immediately
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
        expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle login failure', async () => {
     (authApi.getCurrentUser as any).mockResolvedValue(null);
     (authApi.login as any).mockResolvedValue({ success: false, error: 'Invalid credentials' });

     const { result } = renderHook(() => useAuth());
     await waitFor(() => expect(result.current.loading).toBe(false));

     await act(async () => {
        await result.current.login('test@example.com', 'wrongpassword');
     });

     expect(result.current.user).toBeNull();
     expect(result.current.error).toBe('Invalid credentials');
  });

  it('should handle logout', async () => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
      (authApi.getCurrentUser as any).mockResolvedValue(mockUser);
      (authApi.logout as any).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useAuth());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.isAuthenticated).toBe(true);

      await act(async () => {
          await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
  });
});

import { useState, useEffect, useCallback } from 'react';
import { authApi, User } from '@/api/mockApi';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    const result = await authApi.login(email, password);
    
    if (result.success && result.user) {
      setUser(result.user);
    } else {
      setError(result.error || 'Login failed');
    }
    
    setLoading(false);
    return result;
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    const result = await authApi.signup(username, email, password);
    
    if (result.success && result.user) {
      setUser(result.user);
    } else {
      setError(result.error || 'Signup failed');
    }
    
    setLoading(false);
    return result;
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    await authApi.logout();
    setUser(null);
    setLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    clearError,
    isAuthenticated: !!user,
  };
}

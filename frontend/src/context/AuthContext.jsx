import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setAccessToken, setOnAuthFailure, refreshAccessToken } from '../api/apiClient';

const AuthContext = createContext(null);

// 'loading' -- restoring session from the refresh cookie on app load
// 'authenticated' | 'unauthenticated' -- settled states
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  useEffect(() => {
    setOnAuthFailure(clearSession);
  }, [clearSession]);

  useEffect(() => {
    (async () => {
      try {
        await refreshAccessToken();
        const me = await api.get('/auth/me');
        setUser(me);
        setStatus('authenticated');
      } catch {
        clearSession();
      }
    })();
  }, [clearSession]);

  const login = useCallback(async (email, password) => {
    const { accessToken } = await api.post('/auth/login', { email, password });
    setAccessToken(accessToken);
    const me = await api.get('/auth/me');
    setUser(me);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearSession();
    }
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ user, status, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

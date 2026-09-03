import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken } from '../lib/api';
import type { User } from '../lib/types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; confirmPassword?: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  setAuthUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [loading, setLoading] = useState<boolean>(!!getToken());

  const hydrate = useCallback(async () => {
    const tok = getToken();
    if (!tok) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.me();
      setUser(data.user as User);
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login({ email, password });
    setToken(data.token);
    setTokenState(data.token);
    setUser(data.user as User);
  }, []);

  const register = useCallback(async (fields: { name: string; email: string; password: string; confirmPassword?: string; phone?: string }) => {
    const data = await api.register(fields);
    setToken(data.token);
    setTokenState(data.token);
    setUser(data.user as User);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // ignore network errors on logout
    }
    setToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  const setAuthUser = useCallback((u: User) => setUser(u), []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, setAuthUser }),
    [user, token, loading, login, register, logout, setAuthUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

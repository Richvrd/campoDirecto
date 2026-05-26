import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import client from '../api/client';
import type { User, ApiResponse, AuthResponse } from '../types';
import * as storage from '../utils/storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'agricultor' | 'comprador';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const storedToken = await storage.getToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);

      const response = await client.get<ApiResponse<User>>('/auth/me');
      setUser(response.data.data);
    } catch {
      await storage.removeToken();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    const response = await client.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });

    const { user, token: newToken } = response.data.data;

    await storage.setToken(newToken);
    setToken(newToken);
    setUser(user);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const response = await client.post<ApiResponse<AuthResponse>>('/auth/register', data);

    const { user, token: newToken } = response.data.data;

    await storage.setToken(newToken);
    setToken(newToken);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await client.post('/auth/logout');
    } catch {
      // Proceed even if server request fails
    }

    await storage.removeToken();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

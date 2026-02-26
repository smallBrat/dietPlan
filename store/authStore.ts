import { create } from 'zustand';
import axios from 'axios';
import { api } from '../src/lib/api';
import { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCheckingAuth: boolean;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

type LoginResponse = {
  success: boolean;
  token?: string;
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
};

type MeResponse = {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
};

const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
  checkAuth: async () => {
    set({ isCheckingAuth: true });
    const token = getStoredToken();
    if (!token) {
      set({ user: null, isAuthenticated: false, isCheckingAuth: false });
      return;
    }

    try {
      const response = await api.get<MeResponse>('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: () => true,
      });

      if (response.status !== 200 || !response.data?.user) {
        try {
          localStorage.removeItem('auth_token');
        } catch {
          console.warn('Unable to remove auth token from localStorage');
        }
        set({ user: null, isAuthenticated: false, isCheckingAuth: false });
        return;
      }

      const backendUser = response.data.user;
      set({
        user: {
          id: backendUser.id,
          name: backendUser.name,
          email: backendUser.email,
          role: UserRole.PATIENT,
        },
        isAuthenticated: true,
        isCheckingAuth: false,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Auth check failed:', error.message);
      } else if (error instanceof Error) {
        console.warn('Auth check failed:', error.message);
      } else {
        console.warn('Auth check failed with unknown error');
      }

      try {
        localStorage.removeItem('auth_token');
      } catch {
        console.warn('Unable to remove auth token from localStorage');
      }
      set({ user: null, isAuthenticated: false, isCheckingAuth: false });
    }
  },
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post<LoginResponse>(
        '/api/auth/login',
        { email, password },
        { validateStatus: () => true }
      );

      if (response.status !== 200) {
        console.warn('Login failed with status:', response.status, response.data?.message);
        throw new Error(response.data?.message || 'Invalid email or password');
      }

      if (!response.data?.token) {
        console.warn('Login failed: missing token in response');
        throw new Error('Authentication failed. Please try again.');
      }

      try {
        localStorage.setItem('auth_token', response.data.token);
      } catch {
        console.warn('Unable to persist auth token to localStorage');
      }

      const backendUser = response.data.user;
      set({
        user: backendUser
          ? {
              id: backendUser.id,
              name: backendUser.name,
              email: backendUser.email,
              role: UserRole.PATIENT,
            }
          : null,
        isAuthenticated: true,
        isLoading: false,
        isCheckingAuth: false,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('Login request failed:', error.message);
      } else if (error instanceof Error) {
        console.warn('Login failed:', error.message);
      } else {
        console.warn('Login failed with unknown error');
      }
      set({ isLoading: false, isAuthenticated: false, isCheckingAuth: false });
      throw error;
    }
  },
  logout: () => {
    try {
      localStorage.removeItem('auth_token');
    } catch {
      console.warn('Unable to remove auth token from localStorage');
    }
    set({ user: null, isAuthenticated: false, isCheckingAuth: false });
  },
}));

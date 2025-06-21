import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Role, User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      login: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
        isAdmin: user.role === Role.ADMIN,
      }),
      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        isAdmin: false,
      }),
      updateUser: (updatedUser) => set((state) => ({
        user: state.user ? { ...state.user, ...updatedUser } : null,
        isAdmin: updatedUser.role ? updatedUser.role === Role.ADMIN : state.isAdmin,
      })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
);
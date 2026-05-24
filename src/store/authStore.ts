/**
 * 🔐 LEGENDS: Auth Store
 * Estado global de autenticación compartido entre todos los componentes
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  emailVerified: boolean;
  characterGender?: string;
  needsCharacterSetup?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  sessionChecked: boolean;

  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setSessionChecked: (checked: boolean) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      isLoading: false,
      sessionChecked: false,

      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      setSessionChecked: (sessionChecked) => set({ sessionChecked }),
      clearUser: () => set({ user: null }),
    }),
    { name: 'AuthStore' }
  )
);

import { create } from 'zustand'

interface AuthState {
  isAuthenticated: boolean
  user: null | { id: string; name: string; email: string; role: string }
  login: (userData: { id: string; name: string; email: string; role: string }) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: (userData) => set({ isAuthenticated: true, user: userData }),
  logout: () => set({ isAuthenticated: false, user: null }),
}))

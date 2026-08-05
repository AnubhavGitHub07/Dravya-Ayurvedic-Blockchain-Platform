import { create } from 'zustand'

interface ThemeState {
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}))

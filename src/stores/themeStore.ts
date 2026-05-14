import { create } from 'zustand'

// TODO(P1-UX): Use zustand/middleware persist to save theme preference to localStorage.
// TODO(P1-UX): Initialize mode from window.matchMedia('(prefers-color-scheme: dark)') on first load.

interface ThemeState {
  mode: 'dark' | 'light'
  toggle: () => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'dark',
  toggle: () => set((state) => ({ mode: state.mode === 'dark' ? 'light' : 'dark' })),
}))

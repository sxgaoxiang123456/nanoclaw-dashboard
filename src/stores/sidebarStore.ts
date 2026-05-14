import { create } from 'zustand'

// TODO(P1-UX): Use zustand/middleware persist to save sidebar state to localStorage.

interface SidebarState {
  collapsed: boolean
  toggle: () => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: false,
  toggle: () => set((state) => ({ collapsed: !state.collapsed })),
}))

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Theme } from '@/types/canvas'

interface ThemeStore {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme',
    }
  )
)

// Apply theme to document on store changes
useThemeStore.subscribe((state) => {
  const root = window.document.documentElement
  if (state.theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
})

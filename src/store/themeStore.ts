import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  themeMode: 'system' | 'dark' | 'light'; // New state for theme mode
  toggleThemeMode: () => void; // Toggle between modes
  setThemeMode: (mode: 'system' | 'dark' | 'light') => void; // Explicitly set the mode
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      toggleThemeMode: () =>
        set((state) => {
          const modes = ['system', 'dark', 'light'] as const;
          const currentIndex = modes.indexOf(state.themeMode);
          const nextMode = modes[(currentIndex + 1) % modes.length];
          applyTheme(nextMode); // Apply the new theme
          return { themeMode: nextMode };
        }),
      setThemeMode: (mode) => {
        applyTheme(mode);
        set({ themeMode: mode });
      },
    }),
    { name: 'theme-storage' }
  )
);

function applyTheme(mode: 'system' | 'dark' | 'light') {
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (mode === 'system') {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(prefersDarkScheme ? 'dark' : 'light');
  } else {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(mode);
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: localStorage.getItem('theme-storage') 
        ? JSON.parse(localStorage.getItem('theme-storage') as string).state.theme
        : 'dark',
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.classList.remove('light', 'dark'); 
        document.documentElement.classList.add(newTheme);
        return { theme: newTheme };
      }),
      setTheme: (theme) => {
        document.documentElement.classList.remove('light', 'dark'); 
        document.documentElement.classList.add(theme);
        set({ theme });
      },
    }),
    { name: 'theme-storage' }
  )
);

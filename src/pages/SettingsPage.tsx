import React, { useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

      <div className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Appearance</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white">Theme</span>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`p-2 rounded-md flex items-center gap-2 transition-all ${
                  theme === 'light'
                    ? 'bg-green-500 text-black'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Sun size={18} />
                <span>Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-md flex items-center gap-2 transition-all ${
                  theme === 'dark'
                    ? 'bg-green-500 text-black'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Moon size={18} />
                <span>Dark</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

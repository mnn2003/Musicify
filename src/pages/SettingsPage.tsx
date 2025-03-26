import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

const SettingsPage: React.FC = () => {
  const { themeMode, setThemeMode } = useThemeStore();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

      <div className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Appearance</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white">Theme</span>
            <div className="flex gap-2">
              {/* System Theme Button */}
              <button
                onClick={() => setThemeMode('system')}
                aria-pressed={themeMode === 'system'}
                className={`p-2 rounded-md flex items-center gap-2 transition-all ${
                  themeMode === 'system'
                    ? 'bg-green-500 text-black'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Laptop size={18} />
                <span>System</span>
              </button>

              {/* Light Theme Button */}
              <button
                onClick={() => setThemeMode('light')}
                aria-pressed={themeMode === 'light'}
                className={`p-2 rounded-md flex items-center gap-2 transition-all ${
                  themeMode === 'light'
                    ? 'bg-green-500 text-black'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Sun size={18} />
                <span>Light</span>
              </button>

              {/* Dark Theme Button */}
              <button
                onClick={() => setThemeMode('dark')}
                aria-pressed={themeMode === 'dark'}
                className={`p-2 rounded-md flex items-center gap-2 transition-all ${
                  themeMode === 'dark'
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

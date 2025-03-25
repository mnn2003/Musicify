import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Player from '../components/Player';
import { Menu, X, Music2} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const MainLayout: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-24 lg:pb-24 md:pl-0 mt-0 mb-5 transition-all duration-300"
  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900/90 backdrop-blur-sm p-4 flex items-center justify-between border-b border-gray-300 dark:border-gray-800 transition-all">
          {/* App Logo */}
          <div className="flex items-center gap-2">
            <Music2 size={32} className="text-green-500" />
            <span className="text-xl font-bold">Musicify</span>
          </div>
          
          {/* Menu and User Profile Icons */}
          <div className="flex items-center gap-4">
           
            {/* User Profile Icon */}
            {isAuthenticated && user && (
              <div className="flex items-center gap-2">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
            )}
            
             {/* Menu Icon */}
            <button onClick={toggleSidebar} className="p-2">
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
          </div>
        </div>

        {/* Page Content */}
        <div className="pt-16 md:pt-0">
          <Outlet />
        </div>
      </main>

      {/* Player */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 z-50 bg-gray-900 border-t border-gray-800">
        <Player />
      </div>
    </div>
  );
};

export default MainLayout;

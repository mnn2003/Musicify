import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Player from '../components/Player';

const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 md:pl-64 transition-all duration-300">
        <Outlet />
      </main>

      {/* Player */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 z-50">
        <Player />
      </div>
    </div>
  );
};

export default MainLayout;

"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Home,
  Search,
  Library,
  Heart,
  Clock,
  PlusCircle,
  Music2,
  LogIn,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { usePlaylistStore } from "../store/playlistStore"
import { useAuthStore } from "../store/authStore"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation()
  const { playlists, createPlaylist } = usePlaylistStore()
  const { user, isAuthenticated, logout } = useAuthStore()
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const isActive = (path: string) => location.pathname === path

  const handleCreatePlaylist = () => {
    if (!isAuthenticated) {
      if (window.confirm("You need to be logged in to create playlists. Would you like to log in now?")) {
        onClose()
      }
      return
    }

    const name = prompt("Enter playlist name:")
    if (name && name.trim()) {
      createPlaylist(name.trim())
    }
  }

  return (
    <>
      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          fixed md:sticky top-0 left-0 h-full bg-black text-white w-[85%] max-w-[280px] md:w-64 
          transform transition-all duration-300 ease-in-out z-50 flex flex-col
          ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"} 
        `}
        style={{ height: "100dvh" }}
        aria-hidden={!isOpen && window.innerWidth < 768}
      >
        {/* Close button - mobile only */}
        <button
          onClick={onClose}
          className="md:hidden absolute right-2 top-6 p-1 rounded-full hover:bg-gray-800 transition-colors"
          aria-label="Close sidebar"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="p-6 pb-2">
          <div className="flex items-center gap-2 mb-6">
            <Music2 size={28} className="text-green-500" />
            <span className="text-xl font-bold">Musicify</span>
          </div>

          <nav className="space-y-5">
            {/* Main Navigation Links */}
            <div className="space-y-1">
              <Link
                to="/"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  isActive("/") ? "bg-gray-800 font-medium" : "hover:bg-gray-800/70"
                }`}
                onClick={onClose}
              >
                <Home size={20} />
                <span>Home</span>
              </Link>

              <Link
                to="/search"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  isActive("/search") ? "bg-gray-800 font-medium" : "hover:bg-gray-800/70"
                }`}
                onClick={onClose}
              >
                <Search size={20} />
                <span>Search</span>
              </Link>

              <Link
                to="/library"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  isActive("/library") ? "bg-gray-800 font-medium" : "hover:bg-gray-800/70"
                }`}
                onClick={onClose}
              >
                <Library size={20} />
                <span>Your Library</span>
              </Link>
            </div>

            {/* Secondary Navigation Links */}
            <div className="space-y-1">
              <Link
                to="/liked-songs"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  isActive("/liked-songs") ? "bg-gray-800 font-medium" : "hover:bg-gray-800/70"
                }`}
                onClick={onClose}
              >
                <Heart size={20} className="text-pink-500" />
                <span>Liked Songs</span>
              </Link>

              <Link
                to="/recently-played"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  isActive("/recently-played") ? "bg-gray-800 font-medium" : "hover:bg-gray-800/70"
                }`}
                onClick={onClose}
              >
                <Clock size={20} />
                <span>Recently Played</span>
              </Link>

              <button
                className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-md transition-colors hover:bg-gray-800/70 group"
                onClick={handleCreatePlaylist}
              >
                <div className="bg-white bg-opacity-10 p-1 rounded group-hover:bg-opacity-20 transition-colors">
                  <PlusCircle size={18} />
                </div>
                <span>Create Playlist</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Playlists Section - Scrollable */}
        <div className="px-3 py-2 flex-1 overflow-y-auto scrollbar-thin">
          <div className="px-3 py-2 text-xs text-gray-400 font-medium tracking-wider">YOUR PLAYLISTS</div>
          <div className="space-y-0.5">
            {isAuthenticated ? (
              playlists.length > 0 ? (
                playlists.map((playlist) => (
                  <Link
                    key={playlist.id}
                    to={`/playlist/${playlist.id}`}
                    className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                      isActive(`/playlist/${playlist.id}`) ? "bg-gray-800" : "hover:bg-gray-800/70"
                    }`}
                    onClick={onClose}
                  >
                    {playlist.name}
                  </Link>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">No playlists yet</div>
              )
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">Log in to view your playlists</div>
            )}
          </div>
        </div>

        {/* Settings Link */}
        <div className="px-3 py-1 border-t border-gray-800/50">
          <Link
            to="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 my-1 rounded-md transition-colors ${
              isActive("/settings") ? "bg-gray-800 font-medium" : "hover:bg-gray-800/70"
            }`}
            onClick={onClose}
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </div>

        {/* User Section */}
        <div className="px-3 py-3 border-t border-gray-800/50">
          {isAuthenticated && user ? (
            <div className="flex items-center justify-between px-2 py-1.5">
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium truncate max-w-[140px]">{user.name}</span>
              </div>
              <button
                onClick={() => {
                  logout()
                  onClose()
                }}
                className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-gray-800/70 transition-colors"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black rounded-full hover:bg-opacity-90 transition-colors w-full font-medium"
              onClick={onClose}
            >
              <LogIn size={18} />
              <span>Log in</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Collapsed sidebar toggle button - for desktop */}
      <button
        onClick={() => onClose()}
        className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 ml-[260px] z-40 items-center justify-center h-8 w-8 bg-black rounded-full shadow-md hover:scale-110 transition-transform"
        style={{ opacity: isOpen ? 0 : 1, pointerEvents: isOpen ? "none" : "auto" }}
        aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        <ChevronRight size={16} />
      </button>
    </>
  )
}

export default Sidebar

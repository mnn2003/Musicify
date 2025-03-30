"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Play, Heart, MoreHorizontal, Plus, Check, Clock, ListMusic, X } from "lucide-react"
import type { Track } from "../types"
import { usePlayerStore } from "../store/playerStore"
import { usePlaylistStore } from "../store/playlistStore"
import { useAuthStore } from "../store/authStore"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

interface TrackListProps {
  tracks: Track[]
  showHeader?: boolean
  showArtist?: boolean
  showAlbum?: boolean
  onTrackClick?: (track: Track) => void
}

const TrackList: React.FC<TrackListProps> = ({
  tracks,
  showHeader = true,
  showArtist = true,
  showAlbum = false,
  onTrackClick,
}) => {
  const { setCurrentTrack, currentTrack, isPlaying, togglePlay, addToQueue } = usePlayerStore()
  const { toggleLike, likedSongs, playlists, addToPlaylist } = usePlaylistStore()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [showPlaylistMenu, setShowPlaylistMenu] = useState<string | null>(null)
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const modalContentRef = useRef<HTMLDivElement>(null)

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showPlaylistMenu) {
        setShowPlaylistMenu(null)
      }
    }

    if (showPlaylistMenu) {
      document.addEventListener("keydown", handleEscKey)
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [showPlaylistMenu])

  // Handle click outside to close modal
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      // Only close if clicking on the overlay (modalRef) but not on the content (modalContentRef)
      if (
        modalRef.current &&
        modalRef.current === event.target &&
        !modalContentRef.current?.contains(event.target as Node)
      ) {
        setShowPlaylistMenu(null)
      }
    }

    if (showPlaylistMenu) {
      // Use mousedown instead of click for better mobile support
      document.addEventListener("mousedown", handleOutsideClick)
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [showPlaylistMenu])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handleTrackClick = (track: Track) => {
    if (onTrackClick) {
      onTrackClick(track)
    } else {
      if (currentTrack?.id === track.id) {
        togglePlay()
      } else {
        setCurrentTrack(track)
        const trackIndex = tracks.findIndex((t) => t.id === track.id)
        const remainingTracks = tracks.slice(trackIndex)
        usePlayerStore.getState().clearQueue()
        remainingTracks.forEach((t) => addToQueue(t))
      }
    }
  }

  const handleAddToQueue = (track: Track, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToQueue(track)
    toast.success("Added to queue")
    // Only close the menu after the action is complete
    setTimeout(() => setShowPlaylistMenu(null), 500)
  }

  const handleAddToPlaylist = async (track: Track, playlistId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      if (window.confirm("You need to be logged in to add songs to playlists. Would you like to log in now?")) {
        navigate("/login")
      }
      return
    }
    setAddingToPlaylist(playlistId)
    try {
      await addToPlaylist(playlistId, track)
      toast.success("Added to playlist")
      // Only close the menu after the action is complete
      setTimeout(() => setShowPlaylistMenu(null), 500)
    } catch (error) {
      toast.error("Failed to add to playlist")
      console.error("Error adding to playlist:", error)
    } finally {
      setAddingToPlaylist(null)
    }
  }

  const handleLikeClick = async (track: Track, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      if (window.confirm("You need to be logged in to like songs. Would you like to log in now?")) {
        navigate("/login")
      }
      return
    }
    try {
      await toggleLike(track)
      toast.success(isTrackLiked(track) ? "Removed from liked songs" : "Added to liked songs")
      // Only close the menu after the action is complete
      setTimeout(() => setShowPlaylistMenu(null), 500)
    } catch (error) {
      toast.error("Failed to update liked songs")
    }
  }

  const handleCloseMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowPlaylistMenu(null)
  }

  const isTrackPlaying = (track: Track) => {
    return currentTrack?.id === track.id && isPlaying
  }

  const isTrackLiked = (track: Track) => {
    return likedSongs.some((t) => t.id === track.id)
  }

  const isTrackInPlaylist = (track: Track, playlistId: string) => {
    return playlists.find((playlist) => playlist.id === playlistId)?.tracks.some((t) => t.id === track.id)
  }

  // Find the current track for the menu
  const currentMenuTrack = showPlaylistMenu ? tracks.find((track) => track.id === showPlaylistMenu) : null

  return (
    <div className="w-full">
      {showHeader && (
        <div className="grid grid-cols-8 md:grid-cols-12 gap-4 px-4 py-2 border-b border-gray-800 text-gray-400 text-sm">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5 md:col-span-5">TITLE</div>
          {showArtist && <div className="hidden md:block md:col-span-3">ARTIST</div>}
          {showAlbum && <div className="hidden md:block md:col-span-2">ALBUM</div>}
          <div className="col-span-1 flex justify-end">
            <Clock size={16} />
          </div>
          <div className="col-span-1"></div>
        </div>
      )}
      <div className="divide-y divide-gray-800">
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className="grid grid-cols-8 md:grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-800 transition-colors group cursor-pointer"
            onClick={() => handleTrackClick(track)}
          >
            <div className="col-span-1 flex items-center justify-center">
              <div className="group-hover:hidden">{index + 1}</div>
              <button className="hidden group-hover:block text-white">
                {isTrackPlaying(track) ? (
                  <div className="w-4 h-4 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1 h-3 bg-green-500 mx-px animate-sound-wave"></div>
                      <div className="w-1 h-2 bg-green-500 mx-px animate-sound-wave animation-delay-200"></div>
                      <div className="w-1 h-4 bg-green-500 mx-px animate-sound-wave animation-delay-400"></div>
                    </div>
                  </div>
                ) : (
                  <Play size={16} fill="currentColor" />
                )}
              </button>
            </div>
            <div className="col-span-5 md:col-span-5 flex items-center min-w-0">
              <img
                src={track.thumbnail || "/placeholder.svg"}
                alt={track.title}
                className="w-10 h-10 object-cover mr-3 flex-shrink-0"
              />
              <div className="truncate">
                <div className={`truncate font-medium ${isTrackPlaying(track) ? "text-green-500" : "text-white"}`}>
                  {track.title}
                </div>
                <div className="md:hidden text-sm text-gray-400 truncate">{track.artist}</div>
              </div>
            </div>
            {showArtist && (
              <div className="hidden md:flex md:col-span-3 items-center text-gray-400 truncate">{track.artist}</div>
            )}
            {showAlbum && (
              <div className="hidden md:flex md:col-span-2 items-center text-gray-400 truncate">
                {/* Album would go here */}
              </div>
            )}
            <div className="col-span-1 flex items-center justify-end text-gray-400">
              {formatDuration(track.duration)}
            </div>
            <div className="col-span-1 flex items-center justify-end space-x-2">
              <button
                className="text-gray-400 hover:text-white focus:outline-none transform rotate-90"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  setShowPlaylistMenu(track.id)
                }}
              >
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Full-screen modal menu */}
      {showPlaylistMenu && currentMenuTrack && (
        <div
          ref={modalRef}
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          // No onClick handler here - we'll handle clicks in the useEffect
        >
          <div ref={modalContentRef} className="bg-gray-900 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <img
                  src={currentMenuTrack.thumbnail || "/placeholder.svg"}
                  alt={currentMenuTrack.title}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="truncate">
                  <div className="font-medium text-white truncate">
                    {currentMenuTrack.title.length > 25
                      ? `${currentMenuTrack.title.slice(0, 25)}...`
                      : currentMenuTrack.title}
                  </div>
                  <div className="text-sm text-gray-400 truncate">
                    {currentMenuTrack.artist}
                  </div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-white" onClick={handleCloseMenu}>
                <X size={20} />
              </button>
            </div>

            <div className="p-2">
              <button
                className="w-full px-4 py-3 text-left text-white hover:bg-gray-800 rounded-md flex items-center gap-3 transition-colors"
                onClick={(e) => handleAddToQueue(currentMenuTrack, e)}
              >
                <ListMusic size={18} />
                <span>Add to Queue</span>
              </button>

              <button
                className={`w-full px-4 py-3 text-left hover:bg-gray-800 rounded-md flex items-center gap-3 transition-colors ${
                  isTrackLiked(currentMenuTrack) ? "text-green-500" : "text-white"
                }`}
                onClick={(e) => handleLikeClick(currentMenuTrack, e)}
              >
                <Heart size={18} fill={isTrackLiked(currentMenuTrack) ? "currentColor" : "none"} />
                <span>{isTrackLiked(currentMenuTrack) ? "Remove from Liked Songs" : "Add to Liked Songs"}</span>
              </button>

              <div className="px-4 py-2 mt-2 text-sm font-medium text-gray-400 border-t border-gray-800">
                Add to playlist
              </div>

              <div className="max-h-60 overflow-y-auto">
                {playlists.length > 0 ? (
                  playlists.map((playlist) => (
                    <button
                      key={playlist.id}
                      className="w-full px-4 py-3 text-left text-white hover:bg-gray-800 rounded-md flex items-center justify-between transition-colors"
                      onClick={(e) => handleAddToPlaylist(currentMenuTrack, playlist.id, e)}
                      disabled={isTrackInPlaylist(currentMenuTrack, playlist.id) || addingToPlaylist === playlist.id}
                    >
                      <span className="truncate">{playlist.name}</span>
                      {addingToPlaylist === playlist.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-500 border-t-transparent" />
                      ) : isTrackInPlaylist(currentMenuTrack, playlist.id) ? (
                        <Check size={18} className="text-green-500" />
                      ) : (
                        <Plus size={18} />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-400">No playlists available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TrackList

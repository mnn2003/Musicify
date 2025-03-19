"use client"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Repeat,
  Shuffle,
  ListMusic,
  Minimize2,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import YouTubePlayer from "youtube-player"
import { usePlayerStore } from "../store/playerStore"
import { usePlaylistStore } from "../store/playlistStore"
import { useAuthStore } from "../store/authStore"
import { useNavigate } from "react-router-dom"

const Player: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    progress,
    duration,
    queue,
    togglePlay,
    setVolume,
    setProgress,
    setDuration,
    playNext,
    playPrevious,
  } = usePlayerStore()

  const { toggleLike, likedSongs, addToRecentlyPlayed } = usePlaylistStore()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const [isExpanded, setIsExpanded] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [prevVolume, setPrevVolume] = useState(volume)
  const [showMiniControls, setShowMiniControls] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isShuffleOn, setIsShuffleOn] = useState(false)
  const [repeatMode, setRepeatMode] = useState(0) // 0: no repeat, 1: repeat all, 2: repeat one

  const playerRef = useRef<any>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize YouTube Player
  useEffect(() => {
    if (!playerRef.current) {
      const container = document.createElement("div")
      container.style.position = "absolute"
      container.style.visibility = "hidden"
      container.style.pointerEvents = "none"
      container.style.width = "1px"
      container.style.height = "1px"
      container.id = "youtube-player"
      document.body.appendChild(container)

      playerRef.current = YouTubePlayer("youtube-player", {
        height: "1",
        width: "1",
        playerVars: {
          autoplay: 1,
          controls: 0,
                    className="w-10 h-10 object-cover mr-3 rounded"
                  />
                  <div className="truncate flex-1">
                    <div className="text-white text-sm truncate">{track.title}</div>
                    <div className="text-gray-400 text-xs truncate">{track.artist}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-4">Queue is empty</div>
            )}
          </div>
        </div>
      )}
      {/* Full Screen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex flex-col overflow-y-auto">
          <div className="flex justify-end p-4">
            <button
              onClick={closeModal}
              className="text-white hover:text-gray-300 p-2 rounded-full bg-gray-800 bg-opacity-50"
              aria-label="Close modal"
            >
              <Minimize2 size={24} />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
            {currentTrack && (
              <>
                <img
                  src={currentTrack.thumbnail || "/placeholder.svg"}
                  alt={currentTrack.title}
                  className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-cover rounded-lg shadow-2xl mb-8"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />
                <h2 className="text-white text-xl md:text-2xl font-bold mb-2 text-center px-4">{currentTrack.title}</h2>
                <p className="text-gray-400 mb-8 text-center">{currentTrack.artist}</p>
              </>
            )}

            {/* Progress Bar */}
            <div className="w-full max-w-xl flex items-center gap-2 mb-8 px-4">
              <span className="text-xs md:text-sm text-gray-400 w-12 text-right">{formatTime(progress)}</span>
              <div
                className="flex-1 h-2 md:h-3 bg-gray-700 rounded-full cursor-pointer"
                onClick={handleProgressBarClick}
              >
                <div
                  className="h-full bg-green-500 rounded-full relative group"
                  style={{ width: `${(progress / duration) * 100 || 0}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100" />
                </div>
              </div>
              <span className="text-xs md:text-sm text-gray-400 w-12">{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6 md:gap-10 mb-8">
              <button
                className={`text-gray-400 hover:text-white ${isShuffleOn ? "text-green-500" : ""}`}
                onClick={toggleShuffle}
                aria-label={isShuffleOn ? "Shuffle on" : "Shuffle off"}
              >
                <Shuffle size={20} className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button className="text-gray-400 hover:text-white" onClick={playPrevious} aria-label="Previous track">
                <SkipBack size={24} className="w-6 h-6 md:w-8 md:h-8" />
              </button>
              <button
                className="bg-white rounded-full p-4 md:p-5 text-black hover:scale-105 transition"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause size={24} className="w-6 h-6 md:w-8 md:h-8" />
                ) : (
                  <Play size={24} className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" />
                )}
              </button>
              <button className="text-gray-400 hover:text-white" onClick={playNext} aria-label="Next track">
                <SkipForward size={24} className="w-6 h-6 md:w-8 md:h-8" />
              </button>
              <button
                className={`text-gray-400 hover:text-white ${repeatMode > 0 ? "text-green-500" : ""}`}
                onClick={toggleRepeat}
                aria-label={repeatMode === 0 ? "Repeat off" : repeatMode === 1 ? "Repeat all" : "Repeat one"}
              >
                <Repeat size={20} className="w-5 h-5 md:w-6 md:h-6" />
                {repeatMode === 2 && <span className="absolute text-[10px] font-bold">1</span>}
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3 px-4 w-full max-w-md">
              <button
                className="text-gray-400 hover:text-white"
                onClick={toggleMute}
                aria-label={volume === 0 ? "Unmute" : "Mute"}
              >
                {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <div
                className="w-full h-2 bg-gray-700 rounded-full cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const clickPosition = (e.clientX - rect.left) / rect.width
                  setVolume(Math.max(0, Math.min(1, clickPosition)))
                  setIsMuted(false)
                }}
              >
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${volume * 100}%` }} />
              </div>
            </div>

            {/* Like Button */}
            <button
              className={`mt-8 flex items-center gap-2 px-6 py-2 rounded-full border ${
                isLiked ? "text-green-500 border-green-500" : "text-white border-gray-600"
              }`}
              onClick={handleLikeClick}
              aria-label={isLiked ? "Remove from liked songs" : "Add to liked songs"}
            >
              <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
              <span className="text-sm md:text-base">{isLiked ? "Liked" : "Like"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Player

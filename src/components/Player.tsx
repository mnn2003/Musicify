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
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          playsinline: 1,
        },
      })

      playerRef.current.on("stateChange", (event: any) => {
	  if (event.data === 0) {
		// Video ended
		if (repeatMode === 2) {
		  // Repeat one: restart the current track
		  playerRef.current.seekTo(0);
		  playerRef.current.playVideo();
		} else if (repeatMode === 1) {
		  // Repeat all: play next track (or loop back to first)
		  playNext();
		} else {
		  // No repeat: play next track if available
		  playNext();
		}
	  }
	});

      playerRef.current.on("ready", () => {
        playerRef.current.setVolume(volume * 100)
      })
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.pauseVideo()
        const container = document.getElementById("youtube-player")
        if (container) {
          document.body.removeChild(container)
        }
      }
    }
  }, [])

  // Initialize audio player for local tracks
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio()
      audio.addEventListener("timeupdate", () => {
        setProgress(audio.currentTime)
      })
      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration)
      })
      audio.addEventListener("ended", () => {
        if (repeatMode === 2) {
          // Repeat one: restart the current track
          audio.currentTime = 0
          audio.play()
        } else if (repeatMode === 1) {
          // Repeat all: play next track (or loop back to first)
          playNext()
        } else {
          // No repeat: play next track if available
          playNext()
        }
      })
      audioRef.current = audio
    }
	
	audioRef.current.addEventListener("ended", () => {
  if (repeatMode === 2) {
    // Repeat one: restart the current track
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  } else if (repeatMode === 1) {
    // Repeat all: play next track (or loop back to first)
    playNext();
  } else {
    // No repeat: play next track if available
    playNext();
  }
});

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Handle track change
  useEffect(() => {
    if (currentTrack) {
      if (currentTrack.isLocal && currentTrack.audioUrl) {
        // Handle local audio file
        if (playerRef.current) {
          playerRef.current.pauseVideo()
        }
        if (audioRef.current) {
          audioRef.current.src = currentTrack.audioUrl
          audioRef.current.load()
          if (isPlaying) {
            audioRef.current.play()
          }
        }
      } else if (currentTrack.videoId) {
        // Handle YouTube video
        if (audioRef.current) {
          audioRef.current.pause()
        }
        playerRef.current?.loadVideoById(currentTrack.videoId)
        if (isPlaying) {
          playerRef.current?.playVideo()
        } else {
          playerRef.current?.pauseVideo()
        }
      }
      addToRecentlyPlayed(currentTrack)
      setDuration(currentTrack.duration)
    }
  }, [currentTrack, addToRecentlyPlayed, setDuration])

  // Handle play/pause
  useEffect(() => {
    if (currentTrack) {
      if (currentTrack.isLocal && audioRef.current) {
        if (isPlaying) {
          audioRef.current.play()
        } else {
          audioRef.current.pause()
        }
      } else if (playerRef.current) {
        if (isPlaying) {
          playerRef.current.playVideo()
        } else {
          playerRef.current.pauseVideo()
        }
      }
    }
  }, [isPlaying, currentTrack])

  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
    if (playerRef.current) {
      playerRef.current.setVolume(volume * 100)
    }
  }, [volume])

  // Update progress
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && currentTrack) {
      interval = setInterval(async () => {
        if (currentTrack.isLocal && audioRef.current) {
          setProgress(audioRef.current.currentTime)
        } else if (playerRef.current) {
          const currentTime = await playerRef.current.getCurrentTime()
          setProgress(currentTime)
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentTrack, setProgress])

  // Handle visibility change to ensure background playback
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (playerRef.current && currentTrack) {
        if (document.hidden) {
          playerRef.current.playVideo()
        } else {
          if (isPlaying) {
            playerRef.current.playVideo()
          } else {
            playerRef.current.pauseVideo()
          }
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isPlaying, currentTrack])

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (playerRef.current) {
        playerRef.current.pauseVideo()
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  // Touch swipe functionality
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const swipeThreshold = 50 // minimum distance to be considered a swipe

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null) // reset touchEnd
    setTouchStart(e.targetTouches[0].clientX)
  }

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  // Handle touch end
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > swipeThreshold
    const isRightSwipe = distance < -swipeThreshold

    if (isLeftSwipe) {
      // Swipe left: next track
      playNext()
    }

    if (isRightSwipe) {
      // Swipe right: previous track
      playPrevious()
    }

    // Reset values
    setTouchStart(null)
    setTouchEnd(null)
  }

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Handle progress bar click
  const handleProgressBarClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (currentTrack) {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickPosition = (e.clientX - rect.left) / rect.width
      const newTime = clickPosition * duration

      if (currentTrack.isLocal && audioRef.current) {
        audioRef.current.currentTime = newTime
      } else if (playerRef.current) {
        await playerRef.current.seekTo(newTime, true)
      }
      setProgress(newTime)
    }
  }

  // Handle volume toggle
  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume)
    } else {
      setPrevVolume(volume)
      setVolume(0)
    }
    setIsMuted(!isMuted)
  }

  // Handle shuffle toggle
  const toggleShuffle = () => {
    setIsShuffleOn(!isShuffleOn)
  }

  // Handle repeat toggle (cycles through: no repeat -> repeat all -> repeat one)
  const toggleRepeat = () => {
    setRepeatMode((prevMode) => (prevMode + 1) % 3)
  }

  // Get the next track considering shuffle mode
	const getNextTrack = () => {
	  if (isShuffleOn && queue.length > 1) {
		// Get a random track that's not the current one
		const currentIndex = queue.findIndex((track) => currentTrack && track.id === currentTrack.id);
		let randomIndex;
		do {
		  randomIndex = Math.floor(Math.random() * queue.length);
		} while (randomIndex === currentIndex && queue.length > 1);
		return queue[randomIndex];
	  } else {
		// Normal next track logic
		return playNext();
	  }
	};
	
	// Handle next track click
	const handleNextTrack = () => {
	  if (repeatMode === 2) {
		// Repeat one: restart the current track
		if (currentTrack?.isLocal && audioRef.current) {
		  audioRef.current.currentTime = 0;
		  audioRef.current.play();
		} else if (playerRef.current) {
		  playerRef.current.seekTo(0);
		  playerRef.current.playVideo();
		}
	  } else {
		// Use shuffle logic for next track
		getNextTrack();
	  }
	};

  // Get the previous track
  const getPreviousTrack = () => {
    playPrevious()
  }

  const handleLikeClick = () => {
    if (!isAuthenticated) {
      if (window.confirm("You need to be logged in to like songs. Would you like to log in now?")) {
        navigate("/login")
      }
      return
    }

    if (currentTrack) {
      toggleLike(currentTrack)
    }
  }

  // Check if track is liked
  const isLiked = currentTrack ? likedSongs.some((track) => track.id === currentTrack.id) : false

  // Toggle mini controls for mobile
  const toggleMiniControls = () => {
    setShowMiniControls(!showMiniControls)
  }

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div
      ref={playerContainerRef}
      className={`
    fixed transition-all duration-300 ease-in-out z-50
    ${
      isExpanded
        ? "inset-0 bg-gradient-to-b from-gray-900 to-black"
        : "bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800"
    }
  `}
      style={{ maxHeight: isExpanded ? "100vh" : "auto" }}
    >
      {/* Mobile Expanded View */}
      {isExpanded && (
        <div className="h-full p-4 flex flex-col">
          <button onClick={() => setIsExpanded(false)} className="self-end p-2" aria-label="Minimize player">
            <Minimize2 size={24} className="text-white" />
          </button>

          <div className="flex-1 flex flex-col items-center justify-center">
            {currentTrack && (
              <>
                <img
                  src={currentTrack.thumbnail || "/placeholder.svg"}
                  alt={currentTrack.title}
                  className="w-64 h-64 object-cover rounded-lg shadow-2xl mb-8"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />
                <h2 className="text-white text-xl font-bold mb-2 text-center px-4">{currentTrack.title}</h2>
                <p className="text-gray-400 mb-8 text-center">{currentTrack.artist}</p>
              </>
            )}

            {/* Progress Bar */}
            
			<div className="w-full max-w-md flex items-center gap-2 mb-8 px-4">
			  {/* Current Time */}
			  <span className="text-xs text-gray-400 w-10 text-right">{formatTime(progress)}</span>

			  {/* Progress Bar Using <input type="range" /> */}
			  <input
				type="range"
				min={0}
				max={duration}
				value={progress}
				onChange={(e) => {
				  const newTime = parseFloat(e.target.value);
				  setProgress(newTime);

				  // Update the playback position in the audio or YouTube player
				  if (currentTrack?.isLocal && audioRef.current) {
					audioRef.current.currentTime = newTime;
				  } else if (playerRef.current) {
					playerRef.current.seekTo(newTime, true);
				  }
				}}
				className="flex-1 h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
				style={{
				  background: `linear-gradient(to right, green ${((progress / duration) * 100 || 0)}%, gray 0%)`,
				}}
			  />

			  {/* Total Duration */}
			  <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
			</div>

            {/* Controls */}
            <div className="flex items-center gap-8 mb-6">
              <button
                className={`text-gray-400 hover:text-white ${isShuffleOn ? "text-green-500" : ""}`}
                onClick={toggleShuffle}
                aria-label={isShuffleOn ? "Shuffle on" : "Shuffle off"}
              >
                <Shuffle size={20} />
              </button>
              <button className="text-gray-400 hover:text-white" onClick={playPrevious} aria-label="Previous track">
                <SkipBack size={24} />
              </button>
              <button
                className="bg-white rounded-full p-4 text-black hover:scale-105 transition"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
              </button>
              <button
		className="text-gray-400 hover:text-white"
		onClick={handleNextTrack} // Updated function
		aria-label="Next track"
		>
		<SkipForward size={24} />
		</button>
              <button
                className={`text-gray-400 hover:text-white ${repeatMode > 0 ? "text-green-500" : ""}`}
                onClick={toggleRepeat}
                aria-label={repeatMode === 0 ? "Repeat off" : repeatMode === 1 ? "Repeat all" : "Repeat one"}
              >
                <Repeat size={20} />
                {repeatMode === 2 && <span className="absolute text-[10px] font-bold">1</span>}
              </button>
            </div>

            {/* Volume Control in Expanded View */}
            <div className="flex items-center gap-3 px-4 w-full max-w-md">
		{/* Mute/Unmute Button */}
		<button
		  className="text-gray-400 hover:text-white"
		  onClick={toggleMute}
		  aria-label={volume === 0 ? "Unmute" : "Mute"}
		  >
		  {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
		</button>

	    {/* Volume Slider Using <input type="range" /> */}
		<input
		        type="range"
			min={0}
			max={1}
			step={0.01}
			alue={volume}
			onChange={(e) => {
			const newVolume = parseFloat(e.target.value);
			setVolume(newVolume);
			setIsMuted(false);
				
		    // Update the volume in the audio or YouTube player
			if (audioRef.current) {
			audioRef.current.volume = newVolume;
			}
			if (playerRef.current) {
			playerRef.current.setVolume(newVolume * 100);
			}
			}}
			className="flex-1 h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
			style={{
			 background: `linear-gradient(to right, green ${volume * 100}%, gray 0%)`,
			}}
			/>
	</div>

            {/* Like Button in Expanded View */}
            <button
              className={`mt-6 flex items-center gap-2 px-4 py-2 rounded-full border ${
                isLiked ? "text-green-500 border-green-500" : "text-white border-gray-600"
              }`}
              onClick={handleLikeClick}
              aria-label={isLiked ? "Remove from liked songs" : "Add to liked songs"}
            >
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
              <span>{isLiked ? "Liked" : "Like"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Regular Player View */}
      <div className={`p-2 sm:p-4 ${isExpanded ? "hidden" : "block"}`}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Track Info */}
          <div className="flex items-center flex-1 min-w-0 mr-2">
            {currentTrack ? (
              <>
                <div className="flex items-center cursor-pointer flex-1 min-w-0" onClick={openModal}>
                  <img
                    src={currentTrack.thumbnail || "/placeholder.svg"}
                    alt={currentTrack.title}
                    className="w-12 h-12 sm:w-14 sm:h-14 object-cover mr-2 sm:mr-3 rounded"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-sm sm:text-base truncate">{currentTrack.title}</div>
                    <div className="text-gray-400 text-xs sm:text-sm truncate">{currentTrack.artist}</div>
                  </div>
                </div>
                <button
                  className={`ml-2 focus:outline-none ${isLiked ? "text-green-500" : "text-gray-400 hover:text-white"}`}
                  onClick={handleLikeClick}
                  aria-label={isLiked ? "Remove from liked songs" : "Add to liked songs"}
                >
                  <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                </button>
              </>
            ) : (
              <div className="text-gray-400 text-sm">No track selected</div>
            )}
          </div>

          {/* Mobile Mini Controls Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={togglePlay}
              className="mr-2 bg-white rounded-full p-1.5 text-black hover:scale-105 transition"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
            </button>
            <button
              onClick={toggleMiniControls}
              className="text-white p-1"
              aria-label={showMiniControls ? "Hide controls" : "Show controls"}
            >
              {showMiniControls ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>
          </div>

          {/* Player Controls - Desktop */}
          <div className="hidden md:flex flex-col items-center w-2/4">
            <div className="flex items-center gap-4 mb-2">
              <button
                className={`text-gray-400 hover:text-white ${isShuffleOn ? "text-green-500" : ""}`}
                onClick={toggleShuffle}
                aria-label={isShuffleOn ? "Shuffle on" : "Shuffle off"}
              >
                <Shuffle size={18} />
              </button>
              <button className="text-gray-400 hover:text-white" onClick={playPrevious} aria-label="Previous track">
                <SkipBack size={24} />
              </button>
              <button
                className="bg-white rounded-full p-2 text-black hover:scale-105 transition"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
              </button>
              <button
				  className="text-gray-400 hover:text-white"
				  onClick={handleNextTrack} // Updated function
				  aria-label="Next track"
				>
				  <SkipForward size={24} />
				</button>
              <button
                className={`text-gray-400 hover:text-white ${repeatMode > 0 ? "text-green-500" : ""}`}
                onClick={toggleRepeat}
                aria-label={repeatMode === 0 ? "Repeat off" : repeatMode === 1 ? "Repeat all" : "Repeat one"}
              >
                <Repeat size={18} />
                {repeatMode === 2 && <span className="absolute text-[8px] font-bold">1</span>}
              </button>
            </div>

			<div className="flex items-center w-full gap-2">
			  {/* Current Time */}
			  <span className="text-xs text-gray-400 w-10 text-right">{formatTime(progress)}</span>

			  {/* Progress Bar Using <input type="range" /> */}
			  <input
				type="range"
				min={0}
				max={duration}
				value={progress}
				onChange={(e) => {
				  const newTime = parseFloat(e.target.value);
				  setProgress(newTime);

				  // Update the playback position in the audio or YouTube player
				  if (currentTrack?.isLocal && audioRef.current) {
					audioRef.current.currentTime = newTime;
				  } else if (playerRef.current) {
					playerRef.current.seekTo(newTime, true);
				  }
				}}
				className="flex-1 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
				style={{
				  background: `linear-gradient(to right, green ${((progress / duration) * 100 || 0)}%, gray 0%)`,
				}}
			  />

			  {/* Total Duration */}
			  <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
			</div>
          </div>

          {/* Volume Controls - Desktop */}
		  
		  <div className="hidden md:flex items-center justify-end w-1/4 gap-3">
		  {/* Show/Hide Queue Button */}
		  <button
			className="text-gray-400 hover:text-white"
			onClick={() => setShowQueue(!showQueue)}
			aria-label={showQueue ? "Hide queue" : "Show queue"}
		  >
			<ListMusic size={20} />
		  </button>

		  {/* Mute/Unmute Button */}
		  <button
			className="text-gray-400 hover:text-white"
			onClick={toggleMute}
			aria-label={volume === 0 ? "Unmute" : "Mute"}
		  >
			{volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
		  </button>

		  {/* Volume Slider Using <input type="range" /> */}
		  <input
			type="range"
			min={0}
			max={1}
			step={0.01}
			value={volume}
			onChange={(e) => {
			  const newVolume = parseFloat(e.target.value);
			  setVolume(newVolume);
			  setIsMuted(false);

			  // Update the volume in the audio or YouTube player
			  if (audioRef.current) {
				audioRef.current.volume = newVolume;
			  }
			  if (playerRef.current) {
				playerRef.current.setVolume(newVolume * 100);
			  }
			}}
			className="w-24 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
			style={{
			  background: `linear-gradient(to right, green ${volume * 100}%, gray 0%)`,
			}}
		  />
		</div>
        </div>

        {/* Mobile Mini Controls */}
        {showMiniControls && (
          <div className="md:hidden mt-2 px-2 pb-2">
            {/* Progress Bar */}
			
			<div className="flex items-center gap-2 mb-2">
			  {/* Current Time */}
			  <span className="text-xs text-gray-400 w-8 text-right">{formatTime(progress)}</span>

			  {/* Progress Bar Using <input type="range" /> */}
			  <input
				type="range"
				min={0}
				max={duration}
				value={progress}
				onChange={(e) => {
				  const newTime = parseFloat(e.target.value);
				  setProgress(newTime);

				  // Update the playback position in the audio or YouTube player
				  if (currentTrack?.isLocal && audioRef.current) {
					audioRef.current.currentTime = newTime;
				  } else if (playerRef.current) {
					playerRef.current.seekTo(newTime, true);
				  }
				}}
				className="flex-1 h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer"
				style={{
				  background: `linear-gradient(to right, green ${((progress / duration) * 100 || 0)}%, gray 0%)`,
				}}
			  />

			  {/* Total Duration */}
			  <span className="text-xs text-gray-400 w-8">{formatTime(duration)}</span>
			</div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  className={`text-gray-400 p-2 ${isShuffleOn ? "text-green-500" : ""}`}
                  onClick={toggleShuffle}
                  aria-label={isShuffleOn ? "Shuffle on" : "Shuffle off"}
                >
                  <Shuffle size={18} />
                </button>
                <button className="text-gray-400 p-2" onClick={playPrevious} aria-label="Previous track">
                  <SkipBack size={20} />
                </button>
                <button className="text-gray-400 p-2" onClick={playNext} aria-label="Next track">
                  <SkipForward size={20} />
                </button>
                <button
                  className={`text-gray-400 p-2 ${repeatMode > 0 ? "text-green-500" : ""}`}
                  onClick={toggleRepeat}
                  aria-label={repeatMode === 0 ? "Repeat off" : repeatMode === 1 ? "Repeat all" : "Repeat one"}
                >
                  <Repeat size={18} />
                  {repeatMode === 2 && <span className="absolute text-[8px] font-bold">1</span>}
                </button>
              </div>

              <div className="flex items-center gap-4">
                <button
                  className="text-gray-400 p-2"
                  onClick={toggleMute}
                  aria-label={volume === 0 ? "Unmute" : "Mute"}
                >
                  {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <button
                  className="text-gray-400 p-2"
                  onClick={() => setShowQueue(!showQueue)}
                  aria-label={showQueue ? "Hide queue" : "Show queue"}
                >
                  <ListMusic size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Queue Panel */}
      {showQueue && (
        <div className="absolute bottom-full right-0 w-full sm:w-80 max-h-96 overflow-y-auto bg-gray-900 border border-gray-800 rounded-t-lg shadow-lg">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-white font-bold">Queue</h3>
            <button
              className="text-gray-400 hover:text-white"
              onClick={() => setShowQueue(false)}
              aria-label="Close queue"
            >
              <ChevronDown size={20} />
            </button>
          </div>
          <div className="p-2">
            {queue.length > 0 ? (
              queue.map((track, index) => (
                <div key={`${track.id}-${index}`} className="flex items-center p-2 hover:bg-gray-800 rounded-md">
                  <img
                    src={track.thumbnail || "/placeholder.svg"}
                    alt={track.title}
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
			
			<div className="w-full max-w-md flex items-center gap-2 mb-8 px-4">
			  {/* Current Time */}
			  <span className="text-xs text-gray-400 w-10 text-right">{formatTime(progress)}</span>

			  {/* Progress Bar Using <input type="range" /> */}
			  <input
				type="range"
				min={0}
				max={duration}
				value={progress}
				onChange={(e) => {
				  const newTime = parseFloat(e.target.value);
				  setProgress(newTime);

				  // Update the playback position in the audio or YouTube player
				  if (currentTrack?.isLocal && audioRef.current) {
					audioRef.current.currentTime = newTime;
				  } else if (playerRef.current) {
					playerRef.current.seekTo(newTime, true);
				  }
				}}
				className="flex-1 h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
				style={{
				  background: `linear-gradient(to right, green ${((progress / duration) * 100 || 0)}%, gray 0%)`,
				}}
			  />

			  {/* Total Duration */}
			  <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
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

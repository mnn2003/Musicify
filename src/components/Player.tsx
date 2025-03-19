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
import PlayerControls from './Player/PlayerControls';
import ProgressBar from './/Player/ProgressBar';
import VolumeControl from './/Player/VolumeControl';
import QueuePanel from './/Player/QueuePanel';

const Player: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    setProgress,
    setDuration,
    playNext,
  } = usePlayerStore();

  const { toggleLike, likedSongs, addToRecentlyPlayed } = usePlaylistStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [showFullScreen, setShowFullScreen] = React.useState(false);
  const [showQueue, setShowQueue] = React.useState(false);

  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize YouTube Player
  useEffect(() => {
    if (!playerRef.current) {
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.visibility = "hidden";
      container.style.pointerEvents = "none";
      container.style.width = "1px";
      container.style.height = "1px";
      container.id = "youtube-player";
      document.body.appendChild(container);

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
      });

      playerRef.current.on("stateChange", (event: any) => {
        if (event.data === 0) {
          playNext();
        }
      });

      playerRef.current.on("ready", () => {
        playerRef.current.setVolume(volume * 100);
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.pauseVideo();
        const container = document.getElementById("youtube-player");
        if (container) {
          document.body.removeChild(container);
        }
      }
    };
  }, []);

  // Initialize audio player for local tracks
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.addEventListener('timeupdate', () => {
        setProgress(audio.currentTime);
      });
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });
      audio.addEventListener('ended', () => {
        playNext();
      });
      audioRef.current = audio;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle track change
  useEffect(() => {
    if (currentTrack) {
      if (currentTrack.isLocal && currentTrack.audioUrl) {
        if (playerRef.current) {
          playerRef.current.pauseVideo();
        }
        if (audioRef.current) {
          audioRef.current.src = currentTrack.audioUrl;
          audioRef.current.load();
          if (isPlaying) {
            audioRef.current.play();
          }
        }
      } else if (currentTrack.videoId) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        playerRef.current?.loadVideoById(currentTrack.videoId);
        if (isPlaying) {
          playerRef.current?.playVideo();
        } else {
          playerRef.current?.pauseVideo();
        }
      }
      addToRecentlyPlayed(currentTrack);
      setDuration(currentTrack.duration);
    }
  }, [currentTrack, isPlaying, addToRecentlyPlayed, setDuration]);

  // Handle play/pause
  useEffect(() => {
    if (currentTrack) {
      if (currentTrack.isLocal && audioRef.current) {
        if (isPlaying) {
          audioRef.current.play();
        } else {
          audioRef.current.pause();
        }
      } else if (playerRef.current) {
        if (isPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
      }
    }
  }, [isPlaying, currentTrack]);

  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    if (playerRef.current) {
      playerRef.current.setVolume(volume * 100);
    }
  }, [volume]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (playerRef.current && currentTrack) {
        if (document.hidden) {
          playerRef.current.playVideo();
        } else {
          if (isPlaying) {
            playerRef.current.playVideo();
          } else {
            playerRef.current.pauseVideo();
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPlaying, currentTrack]);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (playerRef.current) {
        playerRef.current.pauseVideo();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Handle like click
  const handleLikeClick = () => {
    if (!isAuthenticated) {
      if (window.confirm("You need to be logged in to like songs. Would you like to log in now?")) {
        navigate("/login");
      }
      return;
    }

    if (currentTrack) {
      toggleLike(currentTrack);
    }
  };

  // Check if track is liked
  const isLiked = currentTrack ? likedSongs.some((track) => track.id === currentTrack.id) : false;

  // Handle ESC key for closing full screen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowFullScreen(false);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Prevent body scroll when full screen is open
  useEffect(() => {
    if (showFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showFullScreen]);

  if (!currentTrack) {
    return null;
  }

  return (
    <>
      {/* Full Screen Modal */}
      {showFullScreen && (
        <div className="fixed inset-0 bg-black z-50 overflow-hidden">
          <div className="h-full flex flex-col p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <button
                onClick={() => setShowFullScreen(false)}
                className="text-gray-400 hover:text-white p-2"
                aria-label="Close full screen"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className="w-full max-w-lg aspect-square object-cover rounded-lg shadow-2xl mb-12"
              />

              <div className="w-full text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-3">{currentTrack.title}</h2>
                <p className="text-xl text-gray-400">{currentTrack.artist}</p>
              </div>

              <div className="w-full max-w-2xl mb-12">
                <ProgressBar size="large" />
              </div>

              <div className="flex flex-col items-center gap-8">
                <PlayerControls size="large" />
                
                <div className="flex items-center gap-8">
                  <VolumeControl size="large" />
                  <button
                    className={`p-3 rounded-full border-2 ${
                      isLiked ? 'border-green-500 text-green-500' : 'border-white text-white'
                    }`}
                    onClick={handleLikeClick}
                  >
                    <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mini Player */}
      <div
        ref={playerContainerRef}
        className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4"
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Track Info */}
          <div className="flex items-center flex-1 min-w-0 mr-4">
            <div 
              className="relative cursor-pointer group"
              onClick={() => setShowFullScreen(true)}
            >
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className="w-14 h-14 object-cover rounded"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                  Expand
                </span>
              </div>
            </div>
            
            <div className="min-w-0 ml-3">
              <div className="text-white font-medium truncate">{currentTrack.title}</div>
              <div className="text-gray-400 text-sm truncate">{currentTrack.artist}</div>
            </div>

            <button
              className={`ml-4 focus:outline-none ${isLiked ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
              onClick={handleLikeClick}
            >
              <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center flex-1">
            <PlayerControls />
            <div className="w-full max-w-md mt-2">
              <ProgressBar />
            </div>
          </div>

          {/* Volume & Queue */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            <button
              className="text-gray-400 hover:text-white p-2"
              onClick={() => setShowQueue(!showQueue)}
            >
              <ListMusic size={20} />
            </button>
            <VolumeControl />
          </div>

          {/* Queue Panel */}
          {showQueue && (
            <QueuePanel onClose={() => setShowQueue(false)} />
          )}
        </div>
      </div>
    </>
  );
};

export default Player;

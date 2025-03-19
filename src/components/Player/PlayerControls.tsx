import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, Shuffle } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';

interface PlayerControlsProps {
  size?: 'small' | 'medium' | 'large';
}

const PlayerControls: React.FC<PlayerControlsProps> = ({ size = 'medium' }) => {
  const {
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
    isShuffled,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    currentTrack
  } = usePlayerStore();

  const sizes = {
    small: {
      button: 'p-1.5',
      mainButton: 'p-1.5',
      icon: 16,
      mainIcon: 16
    },
    medium: {
      button: 'p-2',
      mainButton: 'p-2',
      icon: 20,
      mainIcon: 24
    },
    large: {
      button: 'p-3',
      mainButton: 'p-4',
      icon: 24,
      mainIcon: 32
    }
  };

  const currentSize = sizes[size];

  return (
    <div className="flex items-center gap-4">
      <button
        className={`text-gray-400 hover:text-white ${isShuffled ? 'text-green-500' : ''}`}
        onClick={toggleShuffle}
        aria-label="Shuffle"
      >
        <Shuffle size={currentSize.icon} />
      </button>
      
      <button
        className="text-gray-400 hover:text-white"
        onClick={playPrevious}
        disabled={!currentTrack}
        aria-label="Previous track"
      >
        <SkipBack size={currentSize.icon} />
      </button>
      
      <button
        className={`${currentSize.mainButton} bg-white rounded-full text-black hover:scale-105 transition`}
        onClick={togglePlay}
        disabled={!currentTrack}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause size={currentSize.mainIcon} />
        ) : (
          <Play size={currentSize.mainIcon} fill="currentColor" />
        )}
      </button>
      
      <button
        className="text-gray-400 hover:text-white"
        onClick={playNext}
        disabled={!currentTrack}
        aria-label="Next track"
      >
        <SkipForward size={currentSize.icon} />
      </button>
      
      <button
        className={`text-gray-400 hover:text-white ${repeatMode !== 'none' ? 'text-green-500' : ''}`}
        onClick={toggleRepeat}
        aria-label="Repeat"
      >
        {repeatMode === 'one' ? (
          <Repeat1 size={currentSize.icon} />
        ) : (
          <Repeat size={currentSize.icon} />
        )}
      </button>
    </div>
  );
};

export default PlayerControls;

import React from 'react';
import { usePlayerStore } from '../../store/playerStore';

interface ProgressBarProps {
  size?: 'small' | 'medium' | 'large';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ size = 'medium' }) => {
  const { progress, duration, setProgress, currentTrack } = usePlayerStore();

  // Format time in MM:SS format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Handle changes to the range input
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress); // Update the playback position
  };

  // Define sizes for the progress bar
  const sizes = {
    small: 'h-1',
    medium: 'h-1.5',
    large: 'h-2'
  };

  return (
    <div className="flex items-center w-full gap-2">
      {/* Current Time */}
      <span className="text-xs text-gray-400 w-10 text-right">
        {formatTime(progress)}
      </span>

      {/* Progress Bar */}
      <div className="flex-1 relative">
        <input
          type="range"
          min="0"
          max={duration || 1} // Avoid division by zero if duration is 0
          step="1" // Adjust step size as needed
          value={progress}
          onChange={handleRangeChange}
          className={`w-full ${sizes[size]} appearance-none bg-gray-700 rounded-full cursor-pointer`}
          style={{
            background: `linear-gradient(to right, #10b981 ${
              (progress / duration) * 100 || 0
            }%, #d1d5db ${(progress / duration) * 100 || 0}%)`
          }}
        />
      </div>

      {/* Total Duration */}
      <span className="text-xs text-gray-400 w-10">
        {formatTime(duration)}
      </span>
    </div>
  );
};

export default ProgressBar;

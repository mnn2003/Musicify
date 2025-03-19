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

  // Handle progress bar click to set the new time
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentTrack) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;
    setProgress(newTime);
  };

  // Handle hover to show the preview time
  const [hoverPosition, setHoverPosition] = React.useState<number | null>(null);

  const handleProgressBarHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentTrack) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const hoverPercentage = hoverX / rect.width;
    const hoverTime = hoverPercentage * duration;

    setHoverPosition(hoverTime);
  };

  const sizes = {
    small: 'h-1',
    medium: 'h-1.5',
    large: 'h-2'
  };

  return (
    <div className="flex items-center w-full gap-2 relative">
      {/* Current Time */}
      <span className="text-xs text-gray-400 w-10 text-right">
        {formatTime(progress)}
      </span>

      {/* Progress Bar */}
      <div
        className={`flex-1 ${sizes[size]} bg-gray-700 rounded-full cursor-pointer relative`}
        onClick={handleProgressBarClick}
        onMouseMove={handleProgressBarHover}
        onMouseLeave={() => setHoverPosition(null)} // Reset hover position when leaving
      >
        {/* Filled Progress */}
        <div
          className="h-full bg-green-500 rounded-full"
          style={{ width: `${(progress / duration) * 100 || 0}%` }}
        />

        {/* Hover Indicator */}
        {hoverPosition !== null && (
          <div
            className="absolute top-1/2 transform -translate-y-1/2 w-1 h-3 bg-white rounded-full"
            style={{
              left: `${(hoverPosition / duration) * 100}%`,
              pointerEvents: 'none' // Ensure it doesn't interfere with clicks
            }}
          />
        )}

        {/* Hover Time Tooltip */}
        {hoverPosition !== null && (
          <div
            className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded-md"
            style={{
              left: `${(hoverPosition / duration) * 100}%`
            }}
          >
            {formatTime(hoverPosition)}
          </div>
        )}
      </div>

      {/* Total Duration */}
      <span className="text-xs text-gray-400 w-10">
        {formatTime(duration)}
      </span>
    </div>
  );
};

export default ProgressBar;

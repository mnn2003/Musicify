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

  // State for tracking drag interactions
  const [isDragging, setIsDragging] = React.useState(false);

  // Handle drag start
  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Handle drag move
  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging || !currentTrack) return;

    const progressBar = document.getElementById('progress-bar');
    if (!progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickPosition = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)); // Clamp between 0 and 1
    const newTime = clickPosition * duration;
    setProgress(newTime);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Attach and detach event listeners for drag
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging]);

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
      <div
        id="progress-bar"
        className={`flex-1 ${sizes[size]} bg-gray-700 rounded-full cursor-pointer relative`}
        onMouseDown={handleDragStart} // Start dragging when clicking the progress bar
      >
        {/* Filled Progress */}
        <div
          className="h-full bg-green-500 rounded-full"
          style={{ width: `${(progress / duration) * 100 || 0}%` }}
        />

        {/* Progress Circle */}
        <div
          className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md cursor-pointer"
          style={{
            left: `${(progress / duration) * 100}%`
          }}
          onMouseDown={(e) => {
            e.stopPropagation(); // Prevent triggering the parent's onMouseDown
            handleDragStart();
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

import React from 'react';
import { usePlayerStore } from '../../store/playerStore';

interface ProgressBarProps {
  size?: 'small' | 'medium' | 'large';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ size = 'medium' }) => {
  const { progress, duration, setProgress, currentTrack } = usePlayerStore();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentTrack) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;
    setProgress(newTime);
  };

  const sizes = {
    small: 'h-1',
    medium: 'h-1.5',
    large: 'h-2'
  };

  return (
    <div className="flex items-center w-full gap-2">
      <span className="text-xs text-gray-400 w-10 text-right">
        {formatTime(progress)}
      </span>
      
      <div
        className={`flex-1 ${sizes[size]} bg-gray-700 rounded-full cursor-pointer`}
        onClick={handleProgressBarClick}
      >
        <div
          className="h-full bg-green-500 rounded-full relative group"
          style={{ width: `${(progress / duration) * 100 || 0}%` }}
        >
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100" />
        </div>
      </div>
      
      <span className="text-xs text-gray-400 w-10">
        {formatTime(duration)}
      </span>
    </div>
  );
};

export default ProgressBar;

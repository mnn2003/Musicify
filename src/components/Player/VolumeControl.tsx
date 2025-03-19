import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';

interface VolumeControlProps {
  size?: 'small' | 'medium' | 'large';
}

const VolumeControl: React.FC<VolumeControlProps> = ({ size = 'medium' }) => {
  const { volume, setVolume } = usePlayerStore();
  const [isMuted, setIsMuted] = React.useState(false);
  const [prevVolume, setPrevVolume] = React.useState(volume);

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume);
    } else {
      setPrevVolume(volume);
      setVolume(0);
    }
    setIsMuted(!isMuted);
  };

  const sizes = {
    small: 'h-1 w-20',
    medium: 'h-1.5 w-24',
    large: 'h-2 w-32'
  };

  return (
    <div className="flex items-center gap-3">
      <button
        className="text-gray-400 hover:text-white"
        onClick={toggleMute}
        aria-label={volume === 0 ? "Unmute" : "Mute"}
      >
        {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
      
      <div
        className={`${sizes[size]} bg-gray-700 rounded-full cursor-pointer`}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickPosition = (e.clientX - rect.left) / rect.width;
          setVolume(Math.max(0, Math.min(1, clickPosition)));
          setIsMuted(false);
        }}
      >
        <div
          className="h-full bg-green-500 rounded-full"
          style={{ width: `${volume * 100}%` }}
        />
      </div>
    </div>
  );
};

export default VolumeControl;

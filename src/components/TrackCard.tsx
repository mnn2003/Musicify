import React from 'react';
import { Play, Pause } from 'lucide-react';
import { Track } from '../types';
import { usePlayerStore } from '../store/playerStore';

interface TrackCardProps {
  track: Track;
  tracks?: Track[]; // Optional array of all tracks in the section
}

const TrackCard: React.FC<TrackCardProps> = ({ track, tracks = [] }) => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    setCurrentTrack, 
    addToQueue,
    clearQueue 
  } = usePlayerStore();
  
  const isCurrentTrack = currentTrack?.id === track.id;
  
  const handlePlay = () => {
    if (isCurrentTrack) {
      togglePlay();
    } else {
      // Find the index of the current track in the tracks array
      const trackIndex = tracks.findIndex(t => t.id === track.id);
      
      // Get all tracks after the current one (including it)
      const remainingTracks = tracks.slice(trackIndex);
      
      // Set the current track and update the queue
      setCurrentTrack(track);
      clearQueue();
      remainingTracks.forEach(t => addToQueue(t));
    }
  };
  
  return (
    <div className="bg-gray-800 rounded-md p-4 hover:bg-gray-700 transition-colors group">
      <div className="relative mb-4">
        <img 
          src={track.thumbnail} 
          alt={track.title}
          className="w-full aspect-square object-cover rounded-md"
          loading="lazy"
        />
        <button
          className="absolute bottom-2 right-2 bg-green-500 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-105 transform transition-transform"
          onClick={handlePlay}
          aria-label={isCurrentTrack && isPlaying ? 'Pause' : 'Play'}
        >
          {isCurrentTrack && isPlaying ? (
            <Pause size={20} />
          ) : (
            <Play size={20} fill="black" />
          )}
        </button>
      </div>
      <h3 className="text-white font-medium truncate">{track.title}</h3>
      <p className="text-gray-400 text-sm truncate">{track.artist}</p>
    </div>
  );
};

export default TrackCard;

import React, { useState } from 'react';
import { Play, Pause, Heart, MoreHorizontal, Plus, Check, Clock, ListMusic } from 'lucide-react';
import { Track } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { usePlaylistStore } from '../store/playlistStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface TrackCardProps {
  track: Track;
}

const TrackCard: React.FC<TrackCardProps> = ({ track }) => {
  const { currentTrack, isPlaying, togglePlay, setCurrentTrack, addToQueue } = usePlayerStore();
  const { toggleLike, likedSongs, playlists, addToPlaylist } = usePlaylistStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null);

  const isCurrentTrack = currentTrack?.id === track.id;

  const handlePlay = () => {
    if (isCurrentTrack) {
      togglePlay();
    } else {
      setCurrentTrack(track);
      addToQueue(track);
    }
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(track);
    toast.success('Added to queue');
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      if (window.confirm('You need to be logged in to like songs. Would you like to log in now?')) {
        navigate('/login');
      }
      return;
    }
    try {
      await toggleLike(track);
      toast.success(isTrackLiked(track) ? 'Removed from liked songs' : 'Added to liked songs');
    } catch (error) {
      toast.error('Failed to update liked songs');
    }
  };

  const handleAddToPlaylist = async (playlistId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      if (window.confirm('You need to be logged in to add songs to playlists. Would you like to log in now?')) {
        navigate('/login');
      }
      return;
    }
    setAddingToPlaylist(playlistId);
    try {
      await addToPlaylist(playlistId, track);
      toast.success('Added to playlist');
    } catch (error) {
      toast.error('Failed to add to playlist');
    } finally {
      setAddingToPlaylist(null);
    }
  };

  const isTrackLiked = () => {
    return likedSongs.some((t) => t.id === track.id);
  };

  const isTrackInPlaylist = (playlistId: string) => {
    return playlists.find((playlist) => playlist.id === playlistId)?.tracks.some((t) => t.id === track.id);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-gray-800 rounded-md p-4 hover:bg-gray-700 transition-colors group relative">
      {/* Thumbnail */}
      <div className="relative mb-4">
        <img
          src={track.thumbnail}
          alt={track.title}
          className="w-full aspect-square object-cover rounded-md"
        />
        <button
          className="absolute bottom-2 right-2 bg-green-500 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-105 transform transition-transform"
          onClick={handlePlay}
        >
          {isCurrentTrack && isPlaying ? <Pause size={20} /> : <Play size={20} fill="black" />}
        </button>
      </div>

      {/* Title and Artist */}
      <h3 className="text-white font-medium truncate">{track.title}</h3>
      <p className="text-gray-400 text-sm truncate">{track.artist}</p>

      {/* Duration */}
      <div className="absolute top-2 right-2 text-gray-400 text-xs">
        <Clock size={12} className="inline-block mr-1" />
        {formatDuration(track.duration)}
      </div>

      {/* Actions Menu */}
      <div className="absolute top-2 left-2">
        <button
          className="text-gray-400 hover:text-white focus:outline-none"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        >
          <MoreHorizontal size={16} />
        </button>
        {showMenu && (
          <div
            className="absolute z-50 left-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              <button
                className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
                onClick={(e) => handleAddToQueue(e)}
              >
                <ListMusic size={16} />
                <span>Add to Queue</span>
              </button>
              <button
                className={`w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center justify-between ${
                  isTrackLiked() ? 'text-green-500' : ''
                }`}
                onClick={(e) => handleLikeClick(e)}
              >
                <span>{isTrackLiked() ? 'Unlike' : 'Like'}</span>
                <Heart size={16} fill={isTrackLiked() ? 'currentColor' : 'none'} />
              </button>
              <div className="px-4 py-2 text-sm text-gray-400">Add to playlist</div>
              {playlists.length > 0 ? (
                playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center justify-between"
                    onClick={(e) => handleAddToPlaylist(playlist.id, e)}
                    disabled={isTrackInPlaylist(playlist.id) || addingToPlaylist === playlist.id}
                  >
                    <span className="truncate">{playlist.name}</span>
                    {addingToPlaylist === playlist.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent" />
                    ) : isTrackInPlaylist(playlist.id) ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <Plus size={16} />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-400">No playlists available</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackCard;

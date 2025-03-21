import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Heart, MoreHorizontal, Plus, Check, Clock, ListMusic } from 'lucide-react';
import { Track } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { usePlaylistStore } from '../store/playlistStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface TrackListHomeProps {
  tracks: Track[];
  showHeader?: boolean;
  showArtist?: boolean;
}

const TrackListHome: React.FC<TrackListHomeProps> = ({ tracks, showHeader = true, showArtist = true }) => {
  const { setCurrentTrack, currentTrack, isPlaying, togglePlay, addToQueue } = usePlayerStore();
  const { toggleLike, likedSongs, playlists, addToPlaylist } = usePlaylistStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null);

  const handleTrackClick = (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      setCurrentTrack(track);
      const trackIndex = tracks.findIndex((t) => t.id === track.id);
      const remainingTracks = tracks.slice(trackIndex);
      usePlayerStore.getState().clearQueue();
      remainingTracks.forEach((t) => addToQueue(t));
    }
  };

  const handleAddToQueue = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(track);
    toast.success('Added to queue');
  };

  const handleAddToPlaylist = async (track: Track, playlistId: string, e: React.MouseEvent) => {
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
      console.error('Error adding to playlist:', error);
    } finally {
      setAddingToPlaylist(null);
    }
  };

  const handleLikeClick = async (track: Track, e: React.MouseEvent) => {
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

  const isTrackPlaying = (track: Track) => {
    return currentTrack?.id === track.id && isPlaying;
  };

  const isTrackLiked = (track: Track) => {
    return likedSongs.some((t) => t.id === track.id);
  };

  const isTrackInPlaylist = (track: Track, playlistId: string) => {
    return playlists.find((playlist) => playlist.id === playlistId)?.tracks.some((t) => t.id === track.id);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full">
      {showHeader && (
        <div className="grid grid-cols-8 md:grid-cols-12 gap-4 px-4 py-2 border-b border-gray-800 text-gray-400 text-sm">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5 md:col-span-5">TITLE</div>
          {showArtist && <div className="hidden md:block md:col-span-3">ARTIST</div>}
          <div className="col-span-1 flex justify-end">
            <Clock size={16} />
          </div>
          <div className="col-span-1"></div>
        </div>
      )}
      <div className="divide-y divide-gray-800">
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className="group relative bg-gray-800 rounded-md p-4 hover:bg-gray-700 transition-colors cursor-pointer"
            onClick={() => handleTrackClick(track)}
          >
            {/* Thumbnail */}
            <div className="relative mb-4">
              <img
                src={track.thumbnail}
                alt={track.title}
                className="w-full aspect-square object-cover rounded-md"
              />
              <button
                className="absolute bottom-2 right-2 bg-green-500 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-105 transform transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTrackClick(track);
                }}
              >
                {isTrackPlaying(track) ? <Pause size={20} /> : <Play size={20} fill="black" />}
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
                  setShowMenu(showMenu === track.id ? null : track.id);
                }}
              >
                <MoreHorizontal size={16} />
              </button>
              {showMenu === track.id && (
                <div
                  className="absolute z-50 left-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg overflow-hidden"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="py-1">
                    <button
                      className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
                      onClick={(e) => handleAddToQueue(track, e)}
                    >
                      <ListMusic size={16} />
                      <span>Add to Queue</span>
                    </button>
                    <button
                      className={`w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center justify-between ${
                        isTrackLiked(track) ? 'text-green-500' : ''
                      }`}
                      onClick={(e) => handleLikeClick(track, e)}
                    >
                      <span>{isTrackLiked(track) ? 'Unlike' : 'Like'}</span>
                      <Heart size={16} fill={isTrackLiked(track) ? 'currentColor' : 'none'} />
                    </button>
                    <div className="px-4 py-2 text-sm text-gray-400">Add to playlist</div>
                    {playlists.length > 0 ? (
                      playlists.map((playlist) => (
                        <button
                          key={playlist.id}
                          className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center justify-between"
                          onClick={(e) => handleAddToPlaylist(track, playlist.id, e)}
                          disabled={isTrackInPlaylist(track, playlist.id) || addingToPlaylist === playlist.id}
                        >
                          <span className="truncate">{playlist.name}</span>
                          {addingToPlaylist === playlist.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent" />
                          ) : isTrackInPlaylist(track, playlist.id) ? (
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
        ))}
      </div>
    </div>
  );
};

export default TrackListHome;

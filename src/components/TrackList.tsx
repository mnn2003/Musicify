import React, { useState } from 'react';
import { Play, Heart, MoreHorizontal, Plus, Check } from 'lucide-react';
import { Track } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { usePlaylistStore } from '../store/playlistStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

interface TrackListProps {
  tracks: Track[];
  showHeader?: boolean;
  showArtist?: boolean;
  showAlbum?: boolean;
  onTrackClick?: (track: Track) => void;
}

const TrackList: React.FC<TrackListProps> = ({
  tracks,
  showHeader = true,
  showArtist = true,
  showAlbum = false,
  onTrackClick
}) => {
  const { setCurrentTrack, currentTrack, isPlaying, togglePlay, addToQueue } = usePlayerStore();
  const { toggleLike, likedSongs, playlists, addToPlaylist } = usePlaylistStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  const [showPlaylistMenu, setShowPlaylistMenu] = useState<string | null>(null);
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null);

  const handleTrackClick = (track: Track) => {
    if (onTrackClick) {
      onTrackClick(track);
    } else {
      if (currentTrack?.id === track.id) {
        togglePlay();
      } else {
        setCurrentTrack(track);
        // Add the clicked track and all subsequent tracks to the queue
        const trackIndex = tracks.findIndex(t => t.id === track.id);
        const remainingTracks = tracks.slice(trackIndex);
        
        // Clear queue and add all tracks
        usePlayerStore.getState().clearQueue();
        remainingTracks.forEach(t => addToQueue(t));
      }
    }
  };

  const handleLikeClick = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      if (window.confirm('You need to be logged in to like songs. Would you like to log in now?')) {
        navigate('/login');
      }
      return;
    }
    
    toggleLike(track);
  };

  const handleAddToPlaylist = async (track: Track, playlistId: string) => {
    if (!isAuthenticated) {
      if (window.confirm('You need to be logged in to add songs to playlists. Would you like to log in now?')) {
        navigate('/login');
      }
      return;
    }

    setAddingToPlaylist(playlistId);
    try {
      await addToPlaylist(playlistId, track);
    } catch (error) {
      console.error('Error adding to playlist:', error);
    } finally {
      setAddingToPlaylist(null);
      setShowPlaylistMenu(null);
    }
  };

  const isTrackPlaying = (track: Track) => {
    return currentTrack?.id === track.id && isPlaying;
  };

  const isTrackLiked = (track: Track) => {
    return likedSongs.some(t => t.id === track.id);
  };

  return (
    <div className="w-full">
      {showHeader && (
        <div className="grid grid-cols-8 md:grid-cols-12 gap-4 px-4 py-2 border-b border-gray-800 text-gray-400 text-sm">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5 md:col-span-5">TITLE</div>
          {showArtist && <div className="hidden md:block md:col-span-3">ARTIST</div>}
          {showAlbum && <div className="hidden md:block md:col-span-2">ALBUM</div>}
          <div className="col-span-1"></div>
        </div>
      )}

      <div className="divide-y divide-gray-800">
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className="grid grid-cols-8 md:grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-800 transition-colors group cursor-pointer"
            onClick={() => handleTrackClick(track)}
          >
            <div className="col-span-1 flex items-center justify-center">
              <div className="group-hover:hidden">{index + 1}</div>
              <button
                className="hidden group-hover:block text-white"
              >
                {isTrackPlaying(track) ? (
                  <div className="w-4 h-4 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1 h-3 bg-green-500 mx-px animate-sound-wave"></div>
                      <div className="w-1 h-2 bg-green-500 mx-px animate-sound-wave animation-delay-200"></div>
                      <div className="w-1 h-4 bg-green-500 mx-px animate-sound-wave animation-delay-400"></div>
                    </div>
                  </div>
                ) : (
                  <Play size={16} fill="currentColor" />
                )}
              </button>
            </div>

            <div className="col-span-5 md:col-span-5 flex items-center min-w-0">
              <img
                src={track.thumbnail}
                alt={track.title}
                className="w-10 h-10 object-cover mr-3 flex-shrink-0"
              />
              <div className="truncate">
                <div className={`truncate font-medium ${isTrackPlaying(track) ? 'text-green-500' : 'text-white'}`}>
                  {track.title}
                </div>
                <div className="md:hidden text-sm text-gray-400 truncate">{track.artist}</div>
              </div>
            </div>

            {showArtist && (
              <div className="hidden md:flex md:col-span-3 items-center text-gray-400 truncate">
                {track.artist}
              </div>
            )}

            {showAlbum && (
              <div className="hidden md:flex md:col-span-2 items-center text-gray-400 truncate">
                {/* Album would go here */}
              </div>
            )}

            <div className="col-span-1 flex items-center justify-end space-x-2 relative">
              <button
                className={`opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity ${
                  isTrackLiked(track) ? 'text-green-500' : 'text-gray-400 hover:text-white'
                }`}
                onClick={(e) => handleLikeClick(track, e)}
              >
                <Heart size={16} fill={isTrackLiked(track) ? 'currentColor' : 'none'} />
              </button>
              
              <div className="relative">
                <button 
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-gray-400 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPlaylistMenu(showPlaylistMenu === track.id ? null : track.id);
                  }}
                >
                  <MoreHorizontal size={16} />
                </button>

                {showPlaylistMenu === track.id && (
                  <div 
                    className="absolute z-50 right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-400">Add to playlist</div>
                      {playlists.length > 0 ? (
                        playlists.map(playlist => (
                          <button
                            key={playlist.id}
                            className="w-full px-4 py-2 text-sm text-left text-white hover:bg-gray-700 flex items-center justify-between"
                            onClick={() => handleAddToPlaylist(track, playlist.id)}
                            disabled={addingToPlaylist === playlist.id}
                          >
                            <span className="truncate">{playlist.name}</span>
                            {addingToPlaylist === playlist.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent" />
                            ) : playlist.tracks.some(t => t.id === track.id) ? (
                              <Check size={16} className="text-green-500" />
                            ) : (
                              <Plus size={16} />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-400">
                          No playlists available
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackList;

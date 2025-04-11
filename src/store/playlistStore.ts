import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Playlist, Track, User } from '../types';
import { supabase } from '../lib/supabase';

interface PlaylistState {
  playlists: Playlist[];
  likedSongs: Track[];
  recentlyPlayed: Track[];
  publicPlaylists: Playlist[];
  following: User[];
  followers: User[];
  createPlaylist: (name: string, description?: string) => Promise<void>;
  addToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  toggleLike: (track: Track) => Promise<void>;
  addToRecentlyPlayed: (track: Track) => void;
  fetchUserData: () => Promise<void>;
  togglePlaylistVisibility: (playlistId: string) => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  searchPublicPlaylists: (query: string) => Promise<Playlist[]>;
  fetchFollowData: () => Promise<void>;
}

export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set, get) => ({
      playlists: [],
      likedSongs: [],
      recentlyPlayed: [],
      publicPlaylists: [],
      following: [],
      followers: [],

      fetchUserData: async () => {
        try {
          // Fetch liked songs
          const { data: likedSongs } = await supabase
            .from('liked_songs')
            .select('song_data')
            .order('created_at', { ascending: false });

          // Fetch playlists and their songs
          const { data: playlists } = await supabase
            .from('playlists')
            .select(`
              id,
              name,
              description,
              created_at,
              playlist_songs (
                song_data,
                position
              ),
              public_playlists (
                is_public
              )
            `)
            .order('created_at', { ascending: false });

          set({
            likedSongs: likedSongs?.map(item => item.song_data as Track) || [],
            playlists: playlists?.map(playlist => ({
              id: playlist.id,
              name: playlist.name,
              description: playlist.description,
              tracks: (playlist.playlist_songs || [])
                .sort((a, b) => a.position - b.position)
                .map(song => song.song_data as Track),
              createdBy: playlist.user_id,
              thumbnail: playlist.playlist_songs?.[0]?.song_data?.thumbnail,
              isPublic: playlist.public_playlists?.[0]?.is_public || false
            })) || []
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      },

      createPlaylist: async (name, description) => {
        try {
          const { data: playlist } = await supabase
            .from('playlists')
            .insert({ name, description })
            .select()
            .single();

          if (playlist) {
            const newPlaylist: Playlist = {
              id: playlist.id,
              name: playlist.name,
              description: playlist.description,
              tracks: [],
              createdBy: playlist.user_id,
              isPublic: false
            };

            set(state => ({
              playlists: [newPlaylist, ...state.playlists]
            }));
          }
        } catch (error) {
          console.error('Error creating playlist:', error);
          throw error;
        }
      },

      addToPlaylist: async (playlistId, track) => {
        try {
          const { data: existingTracks } = await supabase
            .from('playlist_songs')
            .select('position')
            .eq('playlist_id', playlistId)
            .order('position', { ascending: false })
            .limit(1);

          const nextPosition = (existingTracks?.[0]?.position || 0) + 1;

          await supabase
            .from('playlist_songs')
            .insert({
              playlist_id: playlistId,
              song_data: track,
              position: nextPosition
            });

          set(state => ({
            playlists: state.playlists.map(playlist => {
              if (playlist.id === playlistId) {
                return {
                  ...playlist,
                  tracks: [...playlist.tracks, track],
                  thumbnail: playlist.tracks.length === 0 ? track.thumbnail : playlist.thumbnail
                };
              }
              return playlist;
            })
          }));
        } catch (error) {
          console.error('Error adding to playlist:', error);
          throw error;
        }
      },

      removeFromPlaylist: async (playlistId, trackId) => {
        try {
          await supabase
            .from('playlist_songs')
            .delete()
            .eq('playlist_id', playlistId)
            .eq('song_data->id', trackId);

          set(state => ({
            playlists: state.playlists.map(playlist => {
              if (playlist.id === playlistId) {
                const updatedTracks = playlist.tracks.filter(track => track.id !== trackId);
                return {
                  ...playlist,
                  tracks: updatedTracks,
                  thumbnail: updatedTracks.length > 0 ? updatedTracks[0].thumbnail : undefined
                };
              }
              return playlist;
            })
          }));
        } catch (error) {
          console.error('Error removing from playlist:', error);
          throw error;
        }
      },

      deletePlaylist: async (playlistId) => {
        try {
          await supabase
            .from('playlists')
            .delete()
            .eq('id', playlistId);

          set(state => ({
            playlists: state.playlists.filter(playlist => playlist.id !== playlistId)
          }));
        } catch (error) {
          console.error('Error deleting playlist:', error);
          throw error;
        }
      },

      toggleLike: async (track) => {
        try {
          const { likedSongs } = get();
          const isLiked = likedSongs.some(t => t.id === track.id);

          if (isLiked) {
            await supabase
              .from('liked_songs')
              .delete()
              .eq('song_data->id', track.id);

            set(state => ({
              likedSongs: state.likedSongs.filter(t => t.id !== track.id)
            }));
          } else {
            await supabase
              .from('liked_songs')
              .insert({ song_data: track });

            set(state => ({
              likedSongs: [track, ...state.likedSongs]
            }));
          }
        } catch (error) {
          console.error('Error toggling like:', error);
          throw error;
        }
      },

      addToRecentlyPlayed: (track) => {
        if (!track) return;
        
        const { recentlyPlayed } = get();
        
        // Remove duplicates and add new track to the beginning
        const updatedTracks = [
          track,
          ...recentlyPlayed.filter(t => t.id !== track.id)
        ].slice(0, 50); // Keep only last 50 tracks
        
        set({ recentlyPlayed: updatedTracks });
      },

      togglePlaylistVisibility: async (playlistId) => {
        try {
          const playlist = get().playlists.find(p => p.id === playlistId);
          if (!playlist) return;

          const { data: user } = await supabase.auth.getUser();
          if (!user.user) throw new Error('User not authenticated');

          const { data: existingPublic } = await supabase
            .from('public_playlists')
            .select('*')
            .eq('playlist_id', playlistId)
            .maybeSingle();

          if (existingPublic) {
            // Update existing public playlist
            await supabase
              .from('public_playlists')
              .update({ is_public: !existingPublic.is_public })
              .eq('playlist_id', playlistId);
          } else {
            // Create new public playlist entry
            await supabase
              .from('public_playlists')
              .insert({
                playlist_id: playlistId,
                user_id: user.user.id,
                is_public: true
              });
          }

          // Update local state
          set(state => ({
            playlists: state.playlists.map(p => {
              if (p.id === playlistId) {
                return { ...p, isPublic: !p.isPublic };
              }
              return p;
            })
          }));
        } catch (error) {
          console.error('Error toggling playlist visibility:', error);
          throw error;
        }
      },

      followUser: async (userId) => {
        try {
          await supabase
            .from('follows')
            .insert({ following_id: userId });

          await get().fetchFollowData();
        } catch (error) {
          console.error('Error following user:', error);
          throw error;
        }
      },

      unfollowUser: async (userId) => {
        try {
          await supabase
            .from('follows')
            .delete()
            .eq('following_id', userId);

          await get().fetchFollowData();
        } catch (error) {
          console.error('Error unfollowing user:', error);
          throw error;
        }
      },

      searchPublicPlaylists: async (query: string) => {
        try {
          const { data: publicPlaylists } = await supabase
            .from('public_playlists')
            .select(`
              playlist_id,
              playlists (
                id,
                name,
                description,
                user_id,
                playlist_songs (
                  song_data,
                  position
                )
              ),
              profiles!public_playlists_user_id_fkey (
                name,
                avatar_url
              )
            `)
            .eq('is_public', true)
            .ilike('playlists.name', `%${query}%`);

          return publicPlaylists?.map(item => ({
            id: item.playlists.id,
            name: item.playlists.name,
            description: item.playlists.description,
            tracks: (item.playlists.playlist_songs || [])
              .sort((a, b) => a.position - b.position)
              .map(song => song.song_data as Track),
            createdBy: item.playlists.user_id,
            thumbnail: item.playlists.playlist_songs?.[0]?.song_data?.thumbnail,
            isPublic: true,
            creator: {
              name: item.profiles.name,
              avatar: item.profiles.avatar_url
            }
          })) || [];
        } catch (error) {
          console.error('Error searching public playlists:', error);
          return [];
        }
      },

      fetchFollowData: async () => {
        try {
          // Fetch users I'm following
          const { data: following } = await supabase
            .from('follows')
            .select(`
              following_id,
              profiles!follows_following_id_fkey (
                id,
                name,
                avatar_url
              )
            `)
            .eq('follower_id', (await supabase.auth.getUser()).data.user?.id);

          // Fetch my followers
          const { data: followers } = await supabase
            .from('follows')
            .select(`
              follower_id,
              profiles!follows_follower_id_fkey (
                id,
                name,
                avatar_url
              )
            `)
            .eq('following_id', (await supabase.auth.getUser()).data.user?.id);

          set({
            following: following?.map(f => ({
              id: f.profiles.id,
              name: f.profiles.name,
              avatar: f.profiles.avatar_url
            })) || [],
            followers: followers?.map(f => ({
              id: f.profiles.id,
              name: f.profiles.name,
              avatar: f.profiles.avatar_url
            })) || []
          });
        } catch (error) {
          console.error('Error fetching follow data:', error);
        }
      }
    }),
    {
      name: 'playlist-storage',
      partialize: (state) => ({
        recentlyPlayed: state.recentlyPlayed
      })
    }
  )
);

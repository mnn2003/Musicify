import React, { useEffect, useState } from 'react';
import { getPopularMusicVideos, getVideoDetails } from '../api/youtube';
import { Track } from '../types';
import TrackCard from '../components/TrackCard';
import CategoryCard from '../components/CategoryCard';
import { useAuthStore } from '../store/authStore';
import { localTracks, convertToTrack } from '../lib/localMusic';
import TrackList from '../components/TrackList';
import SkeletonLoader from '../components/SkeletonLoader';

const HomePage: React.FC = () => {
  const [popularTracks, setPopularTracks] = useState<Track[]>([]);
  const [localMusic, setLocalMusic] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocalMusicLoading, setIsLocalMusicLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const categories = [
    { id: 'pop', name: 'Pop', color: '#1DB954', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
    { id: 'rock', name: 'Rock', color: '#E91E63', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
    { id: 'hiphop', name: 'Hip Hop', color: '#FF9800', image: 'https://images.unsplash.com/photo-1547355253-ff0740f6e8c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
    { id: 'electronic', name: 'Electronic', color: '#9C27B0', image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
    { id: 'jazz', name: 'Jazz', color: '#3F51B5', image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
    { id: 'classical', name: 'Classical', color: '#795548', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
  ];

  // Fetch popular tracks from YouTube API
  useEffect(() => {
    const fetchPopularTracks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const results = await getPopularMusicVideos(10);
        const trackPromises = results.map(result => getVideoDetails(result.videoId));
        const tracks = await Promise.all(trackPromises);
        setPopularTracks(tracks);
      } catch (error) {
        console.error('Error fetching popular tracks:', error);
        setError('Failed to load popular tracks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularTracks();
  }, []);

// Fetch and calculate duration for local music tracks
useEffect(() => {
  const fetchLocalMusic = async () => {
    setIsLocalMusicLoading(true);
    try {
      const tracks = await Promise.all(
        localTracks.map(async (localTrack) => {
          return new Promise<Track>((resolve) => {
            const audio = new Audio(localTrack.audioUrl);
            audio.addEventListener("loadedmetadata", () => {
              resolve({
                ...convertToTrack(localTrack),
                duration: audio.duration, // Set actual duration
              });
            });
          });
        })
      );
      setLocalMusic(tracks);
    } catch (error) {
      console.error("Error loading local music:", error);
    } finally {
      setIsLocalMusicLoading(false);
    }
  };

  fetchLocalMusic();
}, []);


  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  return (
    <div className="p-4 sm:p-8">
      {/* Greeting Section */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Good {getTimeOfDay()}, {user?.name || 'Guest'}
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Discover new music and enjoy your favorites
        </p>
      </div>

      {/* Popular Tracks Section */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Popular Right Now</h2>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonLoader key={index} className="h-48 sm:h-56" />
            ))}
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {popularTracks.map(track => (
              <TrackCard key={track.id} track={track} aria-label={`Play ${track.title} by ${track.artist}`} />
            ))}
          </div>
        )}
      </section>

      {/* Local Music Section */}
      {isLocalMusicLoading ? (
        <p className="text-gray-400">Loading local music...</p>
      ) : localMusic.length > 0 ? (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Local Music</h2>
          <div className="bg-gray-900/50 rounded-lg overflow-hidden">
            <TrackList 
              tracks={localMusic}
              showHeader={true}
              showArtist={true}
              showDuration={true}
            />
          </div>
        </section>
      ) : (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Local Music</h2>
          <p className="text-gray-400">No local music found. Add some to your library!</p>
        </section>
      )}

      {/* Browse Categories Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Browse Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map(category => (
            <CategoryCard
              key={category.id}
              id={category.id}
              name={category.name}
              color={category.color}
              image={category.image}
              onClick={() => navigate(`/category/${category.id}`)} // Example navigation
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;

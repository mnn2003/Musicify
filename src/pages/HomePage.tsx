import React, { useEffect, useState } from 'react';
import { getPopularMusicVideos, getVideoDetails } from '../api/youtube';
import { Track } from '../types';
import TrackCard from '../components/TrackCard';
import CategoryCard from '../components/CategoryCard';
import { useAuthStore } from '../store/authStore';
import { localTracks, convertToTrack } from '../lib/localMusic';
import SkeletonLoader from '../components/SkeletonLoader'; // Reusable skeleton loader component

const HomePage: React.FC = () => {
  const [popularTracks, setPopularTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const localMusic = localTracks.map(convertToTrack);

  const categories = [
    { id: 'pop', name: 'Pop', color: '#1DB954', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
    { id: 'rock', name: 'Rock', color: '#E91E63', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
    { id: 'hiphop', name: 'Hip Hop', color: '#FF9800', image: 'https://images.unsplash.com/photo-1547355253-ff0740f6e8c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
    { id: 'electronic', name: 'Electronic', color: '#9C27B0', image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
    { id: 'jazz', name: 'Jazz', color: '#3F51B5', image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
    { id: 'classical', name: 'Classical', color: '#795548', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80' },
  ];

  useEffect(() => {
    const fetchPopularTracks = async () => {
      setIsLoading(true);
      try {
        const results = await getPopularMusicVideos(10);
        const trackPromises = results.map(result => getVideoDetails(result.videoId));
        const tracks = await Promise.all(trackPromises);
        setPopularTracks(tracks);
      } catch (error) {
        console.error('Error fetching popular tracks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularTracks();
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
              <SkeletonLoader key={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {popularTracks.map(track => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        )}
      </section>

      {/* Local Music Section */}
      {localMusic.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Local Music</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonLoader key={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {localMusic.map(track => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Categories Section */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Browse Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map(category => (
            <CategoryCard
              key={category.id}
              id={category.id}
              name={category.name}
              color={category.color}
              image={category.image}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;

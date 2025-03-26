import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getPopularMusicVideos,
  searchVideos,
  searchChannels,
} from '../api/youtube';
import { Track } from '../types';
import TrackCard from '../components/TrackCard';
import SkeletonLoader from '../components/SkeletonLoader';
import TrackList from '../components/TrackList';

interface Artist {
  id: string;
  name: string;
  image: string;
}

const HomePage: React.FC = () => {
  const [popularTracks, setPopularTracks] = useState<Track[]>([]);
  const [trendingBollywood, setTrendingBollywood] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMusicAndArtists = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch popular tracks
        const popularResults = await getPopularMusicVideos(10);
        const popularTrackPromises = popularResults.map((result) =>
          getVideoDetails(result.videoId)
        );
        const popularTracksData = await Promise.all(popularTrackPromises);
        setPopularTracks(popularTracksData);

        // Fetch trending Bollywood songs
        const bollywoodResults = await searchVideos('latest bollywood songs 2024', 10);
        const bollywoodTrackPromises = bollywoodResults.map((result) =>
          getVideoDetails(result.videoId)
        );
        const bollywoodTracksData = await Promise.all(bollywoodTrackPromises);
        setTrendingBollywood(bollywoodTracksData);

        // Fetch popular artists
        const artistKeywords = ['music artist', 'singer', 'bollywood singer'];
        const artistResults = await Promise.all(
          artistKeywords.map((keyword) => searchChannels(keyword, 5))
        );

        const fetchedArtists = artistResults.flat().map((channel) => ({
          id: channel.id,
          name: channel.name,
          image: channel.image || 'https://via.placeholder.com/300x300?text=No+Image',
        }));

        setArtists(fetchedArtists);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMusicAndArtists();
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
          Good {getTimeOfDay()}, Guest
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Discover new music and enjoy your favorites
        </p>
      </div>

      {/* Popular Artists Section */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Popular Artists</h2>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <SkeletonLoader key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-900 text-red-200 p-4 rounded-md">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {artists.map((artist) => (
              <Link
                key={artist.id}
                to={`/artist/${artist.id}`}
                aria-label={`View ${artist.name}'s profile`}
                className="group relative overflow-hidden aspect-square rounded-lg transition-transform hover:scale-105 shadow-md"
              >
                {/* Artist Image */}
                <img
                  src={artist.image}
                  alt={`${artist.name} profile`}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x300?text=No+Image';
                  }}
                  loading="lazy"
                />

                {/* Overlay with Artist Name */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-lg font-bold">{artist.name}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Trending Bollywood Section */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Trending Bollywood</h2>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonLoader key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-900 text-red-200 p-4 rounded-md">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {trendingBollywood.length > 0 ? (
              trendingBollywood.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  tracks={trendingBollywood}
                />
              ))
            ) : (
              <p className="text-gray-400">No trending Bollywood songs found.</p>
            )}
          </div>
        )}
      </section>

      {/* Popular Tracks Section */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Popular Right Now</h2>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonLoader key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-900 text-red-200 p-4 rounded-md">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {popularTracks.length > 0 ? (
              popularTracks.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  tracks={popularTracks}
                />
              ))
            ) : (
              <p className="text-gray-400">No popular tracks found.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;

import React, { useEffect, useState } from 'react';
import { getPopularMusicVideos, getVideoDetails, searchVideos } from '../api/youtube';
import { Track } from '../types';
import TrackCard from '../components/TrackCard';
import CategoryCard from '../components/CategoryCard';
import { useAuthStore } from '../store/authStore';
import { localTracks, convertToTrack } from '../lib/localMusic';
import SkeletonLoader from '../components/SkeletonLoader';
import { Link } from 'react-router-dom';
import TrackList from '../components/TrackList';

interface Artist {
  id: string;
  name: string;
  image: string;
}

const popularArtists: Artist[] = [
  { id: 'arijit-singh', name: 'Arijit Singh', image: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Arijit_Singh_%28cropped%29.jpg' },
  { id: 'neha-kakkar', name: 'Neha Kakkar', image: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Neha_Kakkar_at_Lakme_Fashion_Week_2020_%28cropped%29.jpg' },
  { id: 'atif-aslam', name: 'Atif Aslam', image: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Atif_Aslam_%282019%29.jpg' },
  { id: 'shreya-ghoshal', name: 'Shreya Ghoshal', image: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Shreya_Ghoshal_at_Mirchi_Music_Awards_2020_%28cropped%29.jpg' },
  { id: 'jubin-nautiyal', name: 'Jubin Nautiyal', image: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Jubin_Nautiyal_at_Mirchi_Music_Awards_2020.jpg' },
  { id: 'a-r-rahman', name: 'A. R. Rahman', image: 'https://upload.wikimedia.org/wikipedia/commons/0/09/A_R_Rahman_2019.jpg' },
  { id: 'kumar-sanu', name: 'Kumar Sanu', image: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Kumar_Sanu_%28cropped%29.jpg' },
  { id: 'sonu-nigam', name: 'Sonu Nigam', image: 'https://upload.wikimedia.org/wikipedia/commons/7/71/Sonu_Nigam_at_RBN_Concert.jpg' },
  { id: 'darshan-raval', name: 'Darshan Raval', image: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Darshan_Raval_at_a_concert_in_2019_%28cropped%29.jpg' },
  { id: 'armaan-malik', name: 'Armaan Malik', image: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Armaan_Malik_at_Femina_Beauty_Awards_%28cropped%29.jpg' },
  { id: 'shankar-mahadevan', name: 'Shankar Mahadevan', image: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Shankar_Mahadevan.jpg' },
  { id: 'krishnakumar-kunnath', name: 'Krishnakumar Kunnath (KK)', image: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/KK_Indian_singer.jpg' }
];

const HomePage: React.FC = () => {
  const [popularTracks, setPopularTracks] = useState<Track[]>([]);
  const [trendingBollywood, setTrendingBollywood] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const localMusic = localTracks.map(convertToTrack);

  const categories = [
    { id: 'pop', name: 'Pop', color: '#1DB954', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80' },
    { id: 'rock', name: 'Rock', color: '#E91E63', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=200&q=80' },
    { id: 'hiphop', name: 'Hip Hop', color: '#FF9800', image: 'https://images.unsplash.com/photo-1547355253-ff0740f6e8c1?w=200&q=80' },
    { id: 'electronic', name: 'Electronic', color: '#9C27B0', image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=200&q=80' },
    { id: 'jazz', name: 'Jazz', color: '#3F51B5', image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=200&q=80' },
    { id: 'classical', name: 'Classical', color: '#795548', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=200&q=80' },
  ];

  useEffect(() => {
    const fetchMusic = async () => {
      setIsLoading(true);
      try {
        // Fetch popular tracks
        const results = await getPopularMusicVideos(10);
        const trackPromises = results.map(result => getVideoDetails(result.videoId));
        const tracks = await Promise.all(trackPromises);
        setPopularTracks(tracks);

        // Fetch trending Bollywood songs
        const bollywoodResults = await searchVideos('latest bollywood songs 2024', 10);
        const bollywoodTrackPromises = bollywoodResults.map(result => getVideoDetails(result.videoId));
        const bollywoodTracks = await Promise.all(bollywoodTrackPromises);
        setTrendingBollywood(bollywoodTracks);
      } catch (error) {
        console.error('Error fetching music:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMusic();
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

      {/* Popular Artists Section */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Popular Artists</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {popularArtists.map(artist => (
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
                loading="lazy"
              />
      
              {/* Overlay with Artist Name */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-white text-lg font-bold">{artist.name}</span>
              </div>
            </Link>
          ))}
        </div>
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
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {trendingBollywood.map(track => (
              <TrackCard 
                key={track.id} 
                track={track} 
                tracks={trendingBollywood}
              />
            ))}
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
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {popularTracks.map(track => (
              <TrackCard 
                key={track.id} 
                track={track}
                tracks={popularTracks}
              />
            ))}
          </div>
        )}
      </section>

      {/* Local Music Section */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Local Music</h2>
        <div className="bg-gray-900/50 rounded-lg overflow-hidden">
          <TrackList 
            tracks={localMusic}
            showHeader={true}
            showArtist={true}
          />
        </div>
      </section>

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

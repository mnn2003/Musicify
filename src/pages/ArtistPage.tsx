import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { searchVideos, getVideoDetails } from '../api/youtube';
import { Track } from '../types';
import TrackList from '../components/TrackList';
import LoadingSpinner from '../components/LoadingSpinner';

const ArtistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch artist information dynamically or fallback to hardcoded data
  const getArtistInfo = (artistId: string) => {
    const artists: Record<string, { name: string; image: string; description: string }> = {
      'arijit-singh': {
        name: 'Arijit Singh',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
        description: 'One of India\'s most versatile singers, known for his soulful voice and emotional depth.',
      },
      'neha-kakkar': {
        name: 'Neha Kakkar',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
        description: 'A vibrant performer who has risen to become one of Bollywood\'s leading female playback singers.',
      },
      'atif-aslam': {
        name: 'Atif Aslam',
        image: 'https://images.unsplash.com/photo-1549213783-8284d0336c4f?w=800&q=80',
        description: 'A renowned Pakistani singer whose voice has captured hearts across borders.',
      },
      'shreya-ghoshal': {
        name: 'Shreya Ghoshal',
        image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&q=80',
        description: 'A classically trained vocalist known for her pure and melodious voice.',
      },
      'jubin-nautiyal': {
        name: 'Jubin Nautiyal',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
        description: 'A rising star in the Indian music industry with a unique voice and style.',
      },
    };

    return artists[artistId] || null;
  };

  const artistInfo = useMemo(() => id ? getArtistInfo(id) : null, [id]);

  useEffect(() => {
    const fetchArtistTracks = async () => {
      if (!artistInfo) return;

      setIsLoading(true);
      setError(null);

      try {
        // Search for videos by the artist's name
        const results = await searchVideos(`${artistInfo.name} songs`, 20);

        // Fetch detailed track information for each video
        const trackPromises = results.map((result) => getVideoDetails(result.videoId));
        const tracks = await Promise.all(trackPromises);

        // Filter out any invalid or missing tracks
        const validTracks = tracks.filter((track) => track !== null);
        setTracks(validTracks);
      } catch (error) {
        console.error('Error fetching artist tracks:', error);
        setError('Failed to load artist\'s songs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistTracks();
  }, [artistInfo]); // Only re-run if artistInfo changes

  if (!artistInfo) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl text-white mb-4">Artist not found</h1>
        <p className="text-gray-400">The artist you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Artist Header */}
      <div className="relative mb-8">
        <div className="h-64 md:h-96 overflow-hidden rounded-lg">
          <img
            src={artistInfo.image}
            alt={`${artistInfo.name} profile`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Artist+Image+Unavailable';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black"></div>
        </div>
        <div className="absolute bottom-0 left-0 p-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{artistInfo.name}</h1>
          <p className="text-gray-300 max-w-2xl">{artistInfo.description}</p>
        </div>
      </div>

      {/* Tracks Section */}
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="bg-red-900/20 border border-red-900 text-red-200 p-4 rounded-md">
          {error}
        </div>
      ) : tracks.length > 0 ? (
        <div className="bg-gray-900/50 rounded-lg overflow-hidden">
          <TrackList tracks={tracks} />
        </div>
      ) : (
        <div className="bg-gray-900/50 rounded-lg p-4">
          <p className="text-gray-400">No tracks found for this artist.</p>
        </div>
      )}
    </div>
  );
};

export default ArtistPage;

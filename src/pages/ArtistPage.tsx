import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { searchChannels, searchVideos, getVideoDetails } from '../api/youtube';
import { Track } from '../types';
import TrackList from '../components/TrackList';
import LoadingSpinner from '../components/LoadingSpinner';

const ArtistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artistInfo, setArtistInfo] = useState<{ name: string; image: string; description: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtistData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch artist information using their channel ID
        const artistResults = await searchChannels(id, 1); // Search for the artist by their ID
        if (!artistResults.length) {
          throw new Error('Artist not found');
        }

        const artist = artistResults[0];
        setArtistInfo({
          name: artist.name,
          image: artist.image || 'https://via.placeholder.com/800x400?text=Artist+Image+Unavailable',
          description: artist.description || 'No description available.',
        });

        // Fetch tracks for the artist
        const results = await searchVideos(`${artist.name} top songs`, 20);
        const trackPromises = results.map((result) => getVideoDetails(result.videoId));
        const tracks = await Promise.all(trackPromises);

        const validTracks = tracks.filter((track) => track !== null);
        if (validTracks.length === 0) {
          throw new Error('No tracks found');
        }

        setTracks(validTracks);
      } catch (error) {
        console.error('Error fetching artist data:', error);
        setError('Failed to load artist data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistData();
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl text-white mb-4">Error</h1>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

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
      {tracks.length > 0 ? (
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

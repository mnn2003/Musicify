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

  const getArtistInfo = (artistId: string) => {
    const artists: Record<string, { name: string, image: string, description: string }> = {
      'arijit-singh': {
        name: 'Arijit Singh',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
        description: 'One of India\'s most versatile singers, known for his soulful voice and emotional depth.'
      },
      'neha-kakkar': {
        name: 'Neha Kakkar',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
        description: 'A vibrant performer who has risen to become one of Bollywood\'s leading female playback singers.'
      },
      'atif-aslam': {
        name: 'Atif Aslam',
        image: 'https://images.unsplash.com/photo-1549213783-8284d0336c4f?w=800&q=80',
        description: 'A renowned Pakistani singer whose voice has captured hearts across borders.'
      },
      'a-r-rahman': {
        name: 'A. R. Rahman',
        image: 'https://images.unsplash.com/photo-1520289146752-a94979ca143e?w=800&q=80',
        description: 'An Academy Award-winning composer known for blending classical Indian music with electronic sounds.'
      },
      'kumar-sanu': {
        name: 'Kumar Sanu',
        image: 'https://images.unsplash.com/photo-1580136579312-94651c9f61b8?w=800&q=80',
        description: 'The voice of the 90s Bollywood era, known for his melodious and romantic songs.'
      },
      'sonu-nigam': {
        name: 'Sonu Nigam',
        image: 'https://images.unsplash.com/photo-1615937659915-06ce99f9b730?w=800&q=80',
        description: 'One of India\'s most versatile playback singers with a career spanning decades.'
      },
      'darshan-raval': {
        name: 'Darshan Raval',
        image: 'https://images.unsplash.com/photo-1604563164051-43fc8f236e4d?w=800&q=80',
        description: 'A popular singer-songwriter known for his soulful and romantic songs.'
      },
      'armaan-malik': {
        name: 'Armaan Malik',
        image: 'https://images.unsplash.com/photo-1620145594807-67a6bfb85716?w=800&q=80',
        description: 'A young sensation in Indian music, delivering pop and Bollywood hits.'
      },
      'shankar-mahadevan': {
        name: 'Shankar Mahadevan',
        image: 'https://images.unsplash.com/photo-1518457997722-76f27fbf9b91?w=800&q=80',
        description: 'A legendary singer-composer known for his energetic voice and classical roots.'
      },
      'krishnakumar-kunnath': {
        name: 'Krishnakumar Kunnath (KK)',
        image: 'https://images.unsplash.com/photo-1554449543-3e46d9d19d37?w=800&q=80',
        description: 'A voice that defined an era, known for his deep emotional connection with music.'
      }
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
        const results = await searchVideos(`${artistInfo.name} songs`, 20);
        const trackPromises = results.map(result => getVideoDetails(result.videoId));
        const tracks = await Promise.all(trackPromises);
        setTracks(tracks);
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
        <div className="h-64 md:h-96 overflow-hidden">
          <img
            src={artistInfo.image}
            alt={artistInfo.name}
            className="w-full h-full object-cover"
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
      ) : (
        <div className="bg-gray-900/50 rounded-lg overflow-hidden">
          <TrackList tracks={tracks} />
        </div>
      )}
    </div>
  );
};

export default ArtistPage;

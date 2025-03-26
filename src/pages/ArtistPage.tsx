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
        image: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Arijit_Singh_%28cropped%29.jpg',
        description: 'One of India\'s most versatile singers, known for his soulful voice and emotional depth.'
      },
      'neha-kakkar': {
        name: 'Neha Kakkar',
        image: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Neha_Kakkar_at_Lakme_Fashion_Week_2020_%28cropped%29.jpg',
        description: 'A vibrant performer who has risen to become one of Bollywood\'s leading female playback singers.'
      },
      'atif-aslam': {
        name: 'Atif Aslam',
        image: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Atif_Aslam_%282019%29.jpg',
        description: 'A renowned Pakistani singer whose voice has captured hearts across borders.'
      },
      'a-r-rahman': {
        name: 'A. R. Rahman',
        image: 'https://upload.wikimedia.org/wikipedia/commons/0/09/A_R_Rahman_2019.jpg',
        description: 'An Academy Award-winning composer known for blending classical Indian music with electronic sounds.'
      },
      'kumar-sanu': {
        name: 'Kumar Sanu',
        image: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Kumar_Sanu_%28cropped%29.jpg',
        description: 'The voice of the 90s Bollywood era, known for his melodious and romantic songs.'
      },
      'sonu-nigam': {
        name: 'Sonu Nigam',
        image: 'https://upload.wikimedia.org/wikipedia/commons/7/71/Sonu_Nigam_at_RBN_Concert.jpg',
        description: 'One of India\'s most versatile playback singers with a career spanning decades.'
      },
      'darshan-raval': {
        name: 'Darshan Raval',
        image: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Darshan_Raval_at_a_concert_in_2019_%28cropped%29.jpg',
        description: 'A popular singer-songwriter known for his soulful and romantic songs.'
      },
      'armaan-malik': {
        name: 'Armaan Malik',
        image: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Armaan_Malik_at_Femina_Beauty_Awards_%28cropped%29.jpg',
        description: 'A young sensation in Indian music, delivering pop and Bollywood hits.'
      },
      'shankar-mahadevan': {
        name: 'Shankar Mahadevan',
        image: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Shankar_Mahadevan.jpg',
        description: 'A legendary singer-composer known for his energetic voice and classical roots.'
      },
      'krishnakumar-kunnath': {
        name: 'Krishnakumar Kunnath (KK)',
        image: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/KK_Indian_singer.jpg',
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

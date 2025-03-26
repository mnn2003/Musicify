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
        image: 'https://staticimg.amarujala.com/assets/images/2018/02/17/arijit-singh_1518864927.jpeg',
        description: "One of India's most versatile singers, known for his soulful voice and emotional depth."
      },
      'neha-kakkar': {
        name: 'Neha Kakkar',
        image: 'https://starsunfolded.com/wp-content/uploads/2016/02/Neha-Kakkar.jpg',
        description: "A vibrant performer who has risen to become one of Bollywood's leading female playback singers."
      },
      'atif-aslam': {
        name: 'Atif Aslam',
        image: 'https://artistbookingcompany.com/wp-content/uploads/2024/03/atif-aslam-680x680.jpg',
        description: "A renowned Pakistani singer whose voice has captured hearts across borders."
      },
      'shreya-ghoshal': {
        name: 'Shreya Ghoshal',
        image: 'https://shreyaghoshal.com/assest/images/shreya-image.png',
        description: "A classically trained singer known for her melodious and soulful Bollywood songs."
      },
      'jubin-nautiyal': {
        name: 'Jubin Nautiyal',
        image: 'https://d3lzcn6mbbadaf.cloudfront.net/media/details/ANI-20230613151101.jpg',
        description: "A rising playback singer known for his smooth voice and hit Bollywood songs."
      },
      'a-r-rahman': {
        name: 'A. R. Rahman',
        image: 'https://bsmedia.business-standard.com/_media/bs/img/article/2024-10/10/full/1728535850-9674.jpg',
        description: "An Academy Award-winning composer known for blending classical Indian music with electronic sounds."
      },
      'kumar-sanu': {
        name: 'Kumar Sanu',
        image: 'https://images.bhaskarassets.com/web2images/521/2021/09/23/kumar_1632382608.jpg',
        description: "The voice of the 90s Bollywood era, known for his melodious and romantic songs."
      },
      'sonu-nigam': {
        name: 'Sonu Nigam',
        image: 'https://img.etimg.com/thumb/msid-99440296,width-900,height-620,imgsize-33580,resizemode-75/sonu-nigam-crew-allegedly-manhandled-at-chembur-concert-police-looking-at-local-mla-sons-involvement.jpg',
        description: "One of India's most versatile playback singers with a career spanning decades."
      },
      'darshan-raval': {
        name: 'Darshan Raval',
        image: 'https://blackhattalent.com/wp-content/uploads/2023/08/Darshan-Raval5.jpg',
        description: "A popular singer-songwriter known for his soulful and romantic songs."
      },
      'armaan-malik': {
        name: 'Armaan Malik',
        image: 'https://www.koimoi.com/wp-content/new-galleries/2022/01/armaan-malik-i-look-for-longevity-of-my-songs-not-instant-gratification-001.jpg',
        description: "A young sensation in Indian music, delivering pop and Bollywood hits."
      },
      'shankar-mahadevan': {
        name: 'Shankar Mahadevan',
        image: 'https://resize.indiatvnews.com/en/resize/oldbucket/1200_-/entertainmentbollywood/IndiaTv675c46_shankar.jpg',
        description: "A legendary singer-composer known for his energetic voice and classical roots."
      },
      'krishnakumar-kunnath': {
        name: 'Krishnakumar Kunnath (KK)',
        image: 'https://images.mid-day.com/images/images/2024/oct/Krishnakumar-Kunnath_d_d.jpg',
        description: "A voice that defined an era, known for his deep emotional connection with music."
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

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { searchVideos, getVideoDetails } from '../api/youtube';
import { SearchResult, Track } from '../types';
import TrackList from '../components/TrackList';
import SearchBar from '../components/SearchBar';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';
  
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const searchResults = await searchVideos(query);
        const trackPromises = searchResults.map(result => getVideoDetails(result.videoId));
        const tracks = await Promise.all(trackPromises);
        setResults(tracks);
      } catch (error) {
        console.error('Error searching:', error);
        setError('An error occurred while searching. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResults();
  }, [query]);
  
  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <div className="mb-6">
          <SearchBar />
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {query ? `Search results for "${query}"` : 'Search for music'}
        </h1>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="animate-pulse flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-700 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-900 text-red-200 p-4 rounded-md">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
          <p className="mt-2 text-sm">Please check your connection and try again.</p>
        </div>
      ) : results.length > 0 ? (
        <div className="bg-gray-900/50 rounded-lg overflow-hidden">
          <TrackList tracks={results} />
        </div>
      ) : query ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-xl mb-2">No results found for "{query}"</p>
          <p>Try different keywords or check your spelling</p>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p className="text-xl mb-2">Search for your favorite music</p>
          <p>Find songs, artists, and more</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;

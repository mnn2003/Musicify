import axios from 'axios';
import { SearchResult, Track } from '../types';

const API_KEY = 'AIzaSyDA1n8683_NaCPq8ngS0JjaE_cDueijYqU';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Cache using localStorage
const getFromCache = (key: string) => {
  const cached = localStorage.getItem(key);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  return null;
};

const setToCache = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
};

/**
 * Searches for videos based on a query.
 */
export const searchVideos = async (query: string, maxResults = 20): Promise<SearchResult[]> => {
  const cacheKey = `search:${query}:${maxResults}`;
  const cachedData = getFromCache(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        maxResults,
        q: query,
        type: 'video',
        videoCategoryId: '10', // Music category
        key: API_KEY
      }
    });

    if (!response.data.items?.length) {
      throw new Error('No results found');
    }

    const results = response.data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high?.url || 'https://via.placeholder.com/300x300?text=No+Thumbnail',
      channelTitle: item.snippet.channelTitle,
      videoId: item.id.videoId
    }));

    setToCache(cacheKey, results);
    return results;
  } catch (error) {
    console.error('Error searching videos:', error);
    throw new Error('Failed to fetch videos. Please try again later.');
  }
};

/**
 * Fetches detailed information about a specific video.
 */
export const getVideoDetails = async (videoId: string): Promise<Track> => {
  const cacheKey = `video:${videoId}`;
  const cachedData = getFromCache(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails',
        id: videoId,
        key: API_KEY
      }
    });

    if (!response.data.items?.length) {
      throw new Error('Video not found');
    }

    const video = response.data.items[0];
    const { snippet, contentDetails } = video;
    const duration = parseDuration(contentDetails.duration);

    const track: Track = {
      id: videoId,
      title: snippet.title,
      artist: snippet.channelTitle,
      thumbnail: snippet.thumbnails.high?.url || 'https://via.placeholder.com/300x300?text=No+Thumbnail',
      duration,
      videoId
    };

    setToCache(cacheKey, track);
    return track;
  } catch (error) {
    console.error('Error getting video details:', error);
    throw new Error('Failed to fetch video details. Please try again later.');
  }
};

/**
 * Fetches popular music videos in the "Music" category.
 */
export const getPopularMusicVideos = async (maxResults = 20): Promise<SearchResult[]> => {
  const cacheKey = `popular:${maxResults}`;
  const cachedData = getFromCache(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails',
        chart: 'mostPopular',
        videoCategoryId: '10',
        maxResults,
        regionCode: 'IN',
        key: API_KEY
      }
    });

    const results = response.data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high?.url || 'https://via.placeholder.com/300x300?text=No+Thumbnail',
      channelTitle: item.snippet.channelTitle,
      videoId: item.id,
      duration: parseDuration(item.contentDetails.duration)
    }));

    setToCache(cacheKey, results);
    return results;
  } catch (error) {
    console.error('Error getting popular music videos:', error);
    throw new Error('Failed to fetch popular music videos. Please try again later.');
  }
};

/**
 * Fetches channels (artists) based on a query.
 */
export const searchChannels = async (query: string, maxResults = 5): Promise<any[]> => {
  const cacheKey = `channels:${query}:${maxResults}`;
  const cachedData = getFromCache(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        maxResults: 50, // Fetch more results to filter manually
        q: query,
        type: 'channel',
        key: API_KEY
      }
    });

    // Filter for verified/popular artists
    const filteredResults = response.data.items
      .filter((item: any) => {
        const title = item.snippet.title.toLowerCase();
        return (
          title.includes('official') || // Check for "Official" in the title
          title.includes('music') ||    // Check for "Music" in the title
          title.includes(query.toLowerCase()) // Match the query
        );
      })
      .slice(0, maxResults) // Limit to the desired number of results
      .map((item: any) => ({
        id: item.id.channelId,
        name: item.snippet.title,
        image: item.snippet.thumbnails.high?.url || 'https://via.placeholder.com/300x300?text=No+Image',
        description: item.snippet.description || 'No description available.',
      }));

    setToCache(cacheKey, filteredResults);
    return filteredResults;
  } catch (error) {
    console.error('Error searching channels:', error);
    return [];
  }
};

/**
 * Fetches videos by category using predefined keywords.
 */
export const getVideosByCategory = async (categoryId: string, maxResults = 20): Promise<SearchResult[]> => {
  const categoryKeywords: Record<string, string> = {
    'pop': 'pop music',
    'rock': 'rock music',
    'hiphop': 'hip hop music',
    'electronic': 'electronic music',
    'jazz': 'jazz music',
    'classical': 'classical music',
    'indie': 'indie music',
    'chill': 'chill music',
    'workout': 'workout music',
    'focus': 'focus music'
  };

  const query = categoryKeywords[categoryId] || categoryId;
  return await searchVideos(query, maxResults);
};

/**
 * Helper function to parse ISO 8601 duration to seconds.
 */
const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  return (
    (match?.[1] ? parseInt(match[1].slice(0, -1)) * 3600 : 0) +
    (match?.[2] ? parseInt(match[2].slice(0, -1)) * 60 : 0) +
    (match?.[3] ? parseInt(match[3].slice(0, -1)) : 0)
  );
};

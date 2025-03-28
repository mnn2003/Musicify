export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  videoId?: string;
  audioUrl?: string;
  isLocal?: boolean;
}
 
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  thumbnail?: string;
  createdBy: string;
}

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  isShuffled: boolean;
  repeatMode: 'none' | 'all' | 'one';
  originalQueue: Track[];
}

export interface SearchResult {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  videoId: string;
}

export interface LocalTrack {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  thumbnail?: string;
}

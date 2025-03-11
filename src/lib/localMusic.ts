import { LocalTrack } from '../types';

// This would typically come from scanning your public/music directory
export const localTracks: LocalTrack[] = [
  {
    id: 'local-1',
    title: 'Sample Song 1',
    artist: 'Local Artist',
    audioUrl: '/music/sample1.mp3',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80'
  },
  {
    id: 'local-2',
    title: 'Sample Song 2',
    artist: 'Local Artist',
    audioUrl: '/music/sample2.mp3',
    thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&q=80'
  }
];

export const convertToTrack = (localTrack: LocalTrack) => ({
  id: localTrack.id,
  title: localTrack.title,
  artist: localTrack.artist,
  thumbnail: localTrack.thumbnail || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80',
  duration: 0, // This will be updated when the audio loads
  audioUrl: localTrack.audioUrl,
  isLocal: true
});
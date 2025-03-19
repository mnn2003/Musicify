import { create } from 'zustand';
import { PlayerState, Track } from '../types';

interface PlayerStore extends PlayerState {
  setCurrentTrack: (track: Track) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  shuffleQueue: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  volume: 0.7,
  progress: 0,
  duration: 0,
  isShuffled: false,
  repeatMode: 'none', // 'none' | 'all' | 'one'
  originalQueue: [], // Store original queue order for shuffle/unshuffle

  setCurrentTrack: (track) => {
    set({ currentTrack: track, isPlaying: true, progress: 0 });
  },

  addToQueue: (track) => {
    const { queue, isShuffled } = get();
    set({ 
      queue: [...queue, track],
      originalQueue: isShuffled ? [...get().originalQueue, track] : [...queue, track]
    });
  },

  removeFromQueue: (trackId) => {
    const { queue, originalQueue, isShuffled } = get();
    set({ 
      queue: queue.filter(track => track.id !== trackId),
      originalQueue: isShuffled ? originalQueue.filter(track => track.id !== trackId) : []
    });
  },

  clearQueue: () => {
    set({ queue: [], originalQueue: [] });
  },

  playNext: () => {
    const { queue, currentTrack, repeatMode } = get();
    if (queue.length === 0) return;

    const currentIndex = currentTrack 
      ? queue.findIndex(track => track.id === currentTrack.id)
      : -1;
    
    let nextIndex = currentIndex + 1;

    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else if (repeatMode === 'one') {
        nextIndex = currentIndex;
      } else {
        return;
      }
    }

    set({ 
      currentTrack: queue[nextIndex], 
      isPlaying: true,
      progress: 0
    });
  },

  playPrevious: () => {
    const { queue, currentTrack, progress } = get();
    if (queue.length === 0 || !currentTrack) return;

    // If current track has played for more than 3 seconds, restart it
    if (progress > 3) {
      set({ progress: 0 });
      return;
    }

    const currentIndex = queue.findIndex(track => track.id === currentTrack.id);
    if (currentIndex > 0) {
      set({ 
        currentTrack: queue[currentIndex - 1], 
        isPlaying: true,
        progress: 0
      });
    }
  },

  togglePlay: () => {
    const { isPlaying } = get();
    set({ isPlaying: !isPlaying });
  },

  setVolume: (volume) => {
    set({ volume });
  },

  setProgress: (progress) => {
    set({ progress });
  },

  setDuration: (duration) => {
    set({ duration });
  },

  toggleShuffle: () => {
    const { isShuffled, queue } = get();
    if (!isShuffled) {
      set({ 
        originalQueue: [...queue],
        isShuffled: true
      });
      get().shuffleQueue();
    } else {
      set({ 
        queue: [...get().originalQueue],
        isShuffled: false,
        originalQueue: []
      });
    }
  },

  toggleRepeat: () => {
    const { repeatMode } = get();
    const modes = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    set({ repeatMode: modes[nextIndex] });
  },

  shuffleQueue: () => {
    const { queue, currentTrack } = get();
    if (!currentTrack) return;

    // Remove current track from shuffle
    const remainingTracks = queue.filter(track => track.id !== currentTrack.id);
    
    // Fisher-Yates shuffle algorithm
    for (let i = remainingTracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remainingTracks[i], remainingTracks[j]] = [remainingTracks[j], remainingTracks[i]];
    }

    // Put current track back at its position
    const currentIndex = queue.findIndex(track => track.id === currentTrack.id);
    remainingTracks.splice(currentIndex, 0, currentTrack);

    set({ queue: remainingTracks });
  }
}));

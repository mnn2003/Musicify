import { LocalTrack } from '../types';

// This would typically come from scanning your public/music directory
export const localTracks: LocalTrack[] = [
  {
    id: 'local-17',
    title: 'Dil Ki Bebasi',
    artist: 'Aman Kumar',
    thumbnail: '/covers/image_dc245143-613b-4834-a58b-d7bf52b23492.jpeg',
    audioUrl: 'https://github.com/mnn2003/Musicify/blob/main/public/music/Dard%20Ko%20Chhupa%20Ke.mp3',
  },

  {
    id: 'local-16',
    title: 'Jab Bhi Bulaoge',
    artist: 'Aman Kumar',
    thumbnail: '/covers/image_c133a626-82f3-40b9-ad4c-3d9acda7457b.jpeg',
    audioUrl: '/music/Pukaroge tum.mp3',
  },

  {
    id: 'local-15',
    title: 'Tum Phool Ho',
    artist: 'Aman Kumar',
    thumbnail: '/covers/image_22ad4b1f-250c-4ccb-92a9-802d8840f89b.jpeg',
    audioUrl: '/music/Tum Phool Ho.mp3',
  },

  {
    id: 'local-14',
    title: 'Tu khwaab saja',
    artist: 'Aman Kumar',
    thumbnail: '/covers/image_2d3d8871-68e6-4122-9486-e62d878cbd8b.png',
    audioUrl: '/music/Tu khwaab saja.mp3',
  },
  {
    id: 'local-1',
    title: 'Tera jaana',
    artist: 'Aman Kumar',
    thumbnail: '/covers/image_eeec5627-4835-45b0-8aa2-3298f31720ea.png',
    audioUrl: '/music/Tera jaana.mp3',
  },
  {
    id: 'local-2',
    title: 'Sadiyaan Beet Gaeen ',
    artist: 'Aman Kumar',
    thumbnail: '/covers/image_c4e4328c-1e13-4c34-84ed-3009945771a0.png',
    audioUrl: '/music/Sadiyaan Beet Gaeen.mp3',
  },
  {
    id: 'local-3',
    title: 'Ek Din Tujhe Dhundunga',
    artist: 'Aman Kumar',
    thumbnail: '/covers/image_d7d9daab-3fd4-4762-ba76-e1a8fffb224a.png',
    audioUrl: '/music/Ek Din Tujhe Dhundunga.mp3',
  },
  {
    id: 'local-4',
    title: 'When I will go',
    artist: 'Aman Kumar',
    thumbnail: '/covers/image_dd19e31a-42e8-4b12-a410-3b51b39d368c.png',
    audioUrl: '/music/When I will go.mp3',
  },
  {
    id: 'local-5',
    title: 'Tere Bina zindagi',
    artist: 'Aman Kumar',
    thumbnail: '/covers/image_16e30464-89df-445f-a679-685fb44d172d.png',
    audioUrl: '/music/Tere Bina zindagi.mp3',
  },
  {
    id: 'local-6',
    title: 'Teri yaadon mein',
    artist: 'Aman Kumar',
    thumbnail: '/covers/image_d17da4c3-978e-4b50-be6f-8a1fd0ae94de.png',
    audioUrl: '/music/Teri yaadon mein.mp3',
  },
  {
    id: 'local-7',
    title: 'Tujhe Dhundta Aaunga',
    artist: 'Aman Kumar',
    thumbnail: '/covers/image_17b836b1-4af2-4291-80b7-0602efad25bd.png',
    audioUrl: '/music/Tujhe Dhundta Aaunga.mp3',
  },
  {
    id: 'local-8',
    title: 'Tere Ishq Mein Rang Hai Khila',
    artist: 'Aman Kumar',
    thumbnail: '/covers/image_28c640a0-a00a-4a22-a677-75a342d84edc.png',
    audioUrl: '/music/Tere Ishq Mein Rang Hai Khila.mp3',
  },
  {
    id: 'local-9',
    title: 'Tere Bina zindagi II',
    artist: 'Aman Kumar',
    thumbnail: '/covers/image_245df8d2-4983-4ba8-9df1-8acb89710d8f.png',
    audioUrl: '/music/Tere Bina zindagi II.mp3',
  },
  {
    id: 'local-10',
    title: 'Loosing interest',
    artist: 'Aman Kumar',
    thumbnail: '/covers/image_dc6f8636-eb41-4b59-8d1d-726f480c64ab.png',
    audioUrl: '/music/Loosing interest.mp3',
  },
  {
    id: 'local-11',
    title: 'Na Insaaf Hai',
    artist: 'Aman Kumar',
    thumbnail: '/covers/image_252b7065-cefd-4e8a-8705-e9eec7c11e1c.png',
    audioUrl: '/music/Na Insaaf Hai.mp3',
  },
  {
    id: 'local-12',
    title: 'Let it Burn',
    artist: 'Aman Kumar',
    thumbnail: '/covers/image_17b836b1-4af2-4291-80b7-0602efad25bd.png',
    audioUrl: '/music/Let it Burn.mp3',
  },
  {
    id: 'local-13',
    title: 'Too To Dhoondh Legee',
    artist: 'Aman Kumar',
    thumbnail: '/covers/image_dd19e31a-42e8-4b12-a410-3b51b39d368c.png',
    audioUrl: '/music/Too To Dhoondh Legee.mp3',
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

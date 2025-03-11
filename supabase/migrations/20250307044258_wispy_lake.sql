/*
  # Music App Database Schema

  1. New Tables
    - `liked_songs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `song_data` (jsonb, stores song information)
      - `created_at` (timestamp)
    
    - `playlists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamp)
    
    - `playlist_songs`
      - `id` (uuid, primary key)
      - `playlist_id` (uuid, references playlists)
      - `song_data` (jsonb, stores song information)
      - `position` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Liked Songs Table
CREATE TABLE IF NOT EXISTS liked_songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  song_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE liked_songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their liked songs"
  ON liked_songs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Playlists Table
CREATE TABLE IF NOT EXISTS playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their playlists"
  ON playlists
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Playlist Songs Table
CREATE TABLE IF NOT EXISTS playlist_songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES playlists ON DELETE CASCADE NOT NULL,
  song_data jsonb NOT NULL,
  position integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage songs in their playlists"
  ON playlist_songs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_id
      AND playlists.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS liked_songs_user_id_idx ON liked_songs(user_id);
CREATE INDEX IF NOT EXISTS playlists_user_id_idx ON playlists(user_id);
CREATE INDEX IF NOT EXISTS playlist_songs_playlist_id_idx ON playlist_songs(playlist_id);
/*
  # Update RLS Policies for Music Tables

  1. Changes
    - Update RLS policies to properly handle user_id from auth.uid()
    - Add default user_id value from auth context
    - Ensure proper access control for all operations

  2. Security
    - Strengthen RLS policies
    - Add proper user_id constraints
*/

-- Update liked_songs table to use auth.uid() properly
ALTER TABLE liked_songs 
ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Update playlists table to use auth.uid() properly
ALTER TABLE playlists 
ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their liked songs" ON liked_songs;
DROP POLICY IF EXISTS "Users can manage their playlists" ON playlists;
DROP POLICY IF EXISTS "Users can manage songs in their playlists" ON playlist_songs;

-- Create updated policies
CREATE POLICY "Users can manage their liked songs"
ON liked_songs
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their playlists"
ON playlists
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage songs in their playlists"
ON playlist_songs
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM playlists
    WHERE playlists.id = playlist_songs.playlist_id
    AND playlists.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM playlists
    WHERE playlists.id = playlist_songs.playlist_id
    AND playlists.user_id = auth.uid()
  )
);
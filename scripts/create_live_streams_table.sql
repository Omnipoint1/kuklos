-- Create live_streams table for managing live streaming sessions
CREATE TABLE IF NOT EXISTS live_streams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  room_name TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  is_live BOOLEAN DEFAULT false,
  viewer_count INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_live_streams_user_id ON live_streams(user_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_is_live ON live_streams(is_live);

-- Enable RLS
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all live streams" ON live_streams
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own live streams" ON live_streams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own live streams" ON live_streams
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own live streams" ON live_streams
  FOR DELETE USING (auth.uid() = user_id);

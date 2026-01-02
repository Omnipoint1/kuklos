-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT,
  member_count INTEGER DEFAULT 0,
  is_private BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Create clips table for video content
CREATE TABLE IF NOT EXISTS clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER, -- in seconds
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clip_likes table
CREATE TABLE IF NOT EXISTS clip_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clip_id UUID REFERENCES clips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(clip_id, user_id)
);

-- Create dating_profiles table for Eros feature
CREATE TABLE IF NOT EXISTS dating_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  age INTEGER,
  faith_background TEXT,
  denomination TEXT,
  church_involvement TEXT,
  relationship_goals TEXT,
  favorite_scripture TEXT,
  interests TEXT[],
  looking_for_age_min INTEGER,
  looking_for_age_max INTEGER,
  max_distance INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE clip_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dating_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for groups
CREATE POLICY "groups_select_all" ON groups FOR SELECT USING (true);
CREATE POLICY "groups_insert_own" ON groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "groups_update_own" ON groups FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "groups_delete_own" ON groups FOR DELETE USING (auth.uid() = created_by);

-- RLS policies for group_members
CREATE POLICY "group_members_select_all" ON group_members FOR SELECT USING (true);
CREATE POLICY "group_members_insert_own" ON group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "group_members_delete_own" ON group_members FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for clips
CREATE POLICY "clips_select_all" ON clips FOR SELECT USING (true);
CREATE POLICY "clips_insert_own" ON clips FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "clips_update_own" ON clips FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "clips_delete_own" ON clips FOR DELETE USING (auth.uid() = author_id);

-- RLS policies for clip_likes
CREATE POLICY "clip_likes_select_all" ON clip_likes FOR SELECT USING (true);
CREATE POLICY "clip_likes_insert_own" ON clip_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clip_likes_delete_own" ON clip_likes FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for dating_profiles
CREATE POLICY "dating_profiles_select_all" ON dating_profiles FOR SELECT USING (true);
CREATE POLICY "dating_profiles_insert_own" ON dating_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dating_profiles_update_own" ON dating_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "dating_profiles_delete_own" ON dating_profiles FOR DELETE USING (auth.uid() = user_id);

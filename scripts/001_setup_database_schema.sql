-- Enable RLS on existing tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "users_select_all" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_delete_own" ON users FOR DELETE USING (auth.uid() = id);

-- Create RLS policies for posts table
CREATE POLICY "posts_select_all" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_insert_own" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts_update_own" ON posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "posts_delete_own" ON posts FOR DELETE USING (auth.uid() = author_id);

-- Create RLS policies for comments table
CREATE POLICY "comments_select_all" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_own" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "comments_update_own" ON comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "comments_delete_own" ON comments FOR DELETE USING (auth.uid() = author_id);

-- Create RLS policies for post_likes table
CREATE POLICY "post_likes_select_all" ON post_likes FOR SELECT USING (true);
CREATE POLICY "post_likes_insert_own" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_likes_delete_own" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for messages table
CREATE POLICY "messages_select_own" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "messages_insert_own" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "messages_update_own" ON messages FOR UPDATE USING (auth.uid() = recipient_id);

-- Create RLS policies for notifications table
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert_own" ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for connections table
CREATE POLICY "connections_select_own" ON connections FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "connections_insert_own" ON connections FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "connections_update_own" ON connections FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "connections_delete_own" ON connections FOR DELETE USING (auth.uid() = requester_id);

-- Create RLS policies for experience table
CREATE POLICY "experience_select_own" ON experience FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "experience_insert_own" ON experience FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "experience_update_own" ON experience FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "experience_delete_own" ON experience FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for education table
CREATE POLICY "education_select_own" ON education FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "education_insert_own" ON education FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "education_update_own" ON education FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "education_delete_own" ON education FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for skills table
CREATE POLICY "skills_select_own" ON skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "skills_insert_own" ON skills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "skills_update_own" ON skills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "skills_delete_own" ON skills FOR DELETE USING (auth.uid() = user_id);

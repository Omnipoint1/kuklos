-- Insert sample users (these will be created when users sign up)
-- Insert sample groups
INSERT INTO groups (id, name, description, category, image_url, member_count, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Young Christian Fellowship', 'A vibrant community for young Christians to connect, grow in faith, and support each other.', 'Youth', '/young-christian-fellowship.jpg', 1247, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440002', 'Bible Study Warriors', 'Deep dive into Scripture with passionate believers who love studying God''s Word together.', 'Bible Study', '/bible-study-group.png', 892, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440003', 'Christian Business Network', 'Connecting Christian professionals and entrepreneurs for networking and faith-based business practices.', 'Business', '/christian-business-professionals.jpg', 634, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440004', 'Worship & Music Ministry', 'For musicians, singers, and worship leaders passionate about leading others in praise.', 'Worship', '/christian-worship-music.jpg', 445, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440005', 'Christian Parents Unite', 'Supporting parents in raising children with strong Christian values and biblical principles.', 'Family', '/christian-family-parents.jpg', 789, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440006', 'Mission & Outreach', 'Organizing mission trips, community service, and outreach programs to spread God''s love.', 'Mission', '/christian-mission-outreach.jpg', 523, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440007', 'Christian Singles Community', 'A supportive community for single Christians seeking fellowship and meaningful relationships.', 'Singles', '/christian-singles-community.jpg', 356, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440008', 'Prayer Warriors Network', 'United in prayer, supporting each other through intercession and spiritual warfare.', 'Prayer', '/christian-prayer-warriors.jpg', 1156, '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT (id) DO NOTHING;

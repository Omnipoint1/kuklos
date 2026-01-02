-- Function to increment clip likes count
CREATE OR REPLACE FUNCTION increment_clip_likes(clip_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE clips 
  SET likes_count = likes_count + 1 
  WHERE id = clip_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement clip likes count
CREATE OR REPLACE FUNCTION decrement_clip_likes(clip_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE clips 
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = clip_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment group member count
CREATE OR REPLACE FUNCTION increment_group_member_count(group_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE groups 
  SET member_count = member_count + 1 
  WHERE id = group_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement group member count
CREATE OR REPLACE FUNCTION decrement_group_member_count(group_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE groups 
  SET member_count = GREATEST(member_count - 1, 0)
  WHERE id = group_id;
END;
$$ LANGUAGE plpgsql;

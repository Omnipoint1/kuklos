-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  goal_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  backers_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pledges table
CREATE TABLE IF NOT EXISTS pledges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  backer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  reward_tier TEXT,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaign_updates table
CREATE TABLE IF NOT EXISTS campaign_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaign_rewards table
CREATE TABLE IF NOT EXISTS campaign_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  estimated_delivery DATE,
  backers_count INTEGER DEFAULT 0,
  is_limited BOOLEAN DEFAULT false,
  quantity_limit INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_creator ON campaigns(creator_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category);
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_pledges_campaign ON pledges(campaign_id);
CREATE INDEX IF NOT EXISTS idx_pledges_backer ON pledges(backer_id);
CREATE INDEX IF NOT EXISTS idx_campaign_updates_campaign ON campaign_updates(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_rewards_campaign ON campaign_rewards(campaign_id);

-- Enable Row Level Security
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaigns
CREATE POLICY "Anyone can view active campaigns" ON campaigns
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their campaigns" ON campaigns
  FOR UPDATE USING (auth.uid() = creator_id);

-- RLS Policies for pledges
CREATE POLICY "Users can view their own pledges" ON pledges
  FOR SELECT USING (auth.uid() = backer_id);

CREATE POLICY "Campaign creators can view pledges to their campaigns" ON pledges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = pledges.campaign_id 
      AND campaigns.creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can create pledges" ON pledges
  FOR INSERT WITH CHECK (auth.uid() = backer_id);

-- RLS Policies for campaign_updates
CREATE POLICY "Anyone can view campaign updates" ON campaign_updates
  FOR SELECT USING (true);

CREATE POLICY "Campaign creators can create updates" ON campaign_updates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_updates.campaign_id 
      AND campaigns.creator_id = auth.uid()
    )
  );

-- RLS Policies for campaign_rewards
CREATE POLICY "Anyone can view campaign rewards" ON campaign_rewards
  FOR SELECT USING (true);

CREATE POLICY "Campaign creators can manage rewards" ON campaign_rewards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_rewards.campaign_id 
      AND campaigns.creator_id = auth.uid()
    )
  );

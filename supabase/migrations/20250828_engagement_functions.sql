-- Function to update post likes count and user stats
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment post likes count
    UPDATE public.community_posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
    
    -- Increment user's total likes received
    UPDATE public.profiles 
    SET total_likes_received = total_likes_received + 1
    WHERE user_id = (SELECT user_id FROM public.community_posts WHERE id = NEW.post_id);
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement post likes count
    UPDATE public.community_posts 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.post_id;
    
    -- Decrement user's total likes received
    UPDATE public.profiles 
    SET total_likes_received = GREATEST(total_likes_received - 1, 0)
    WHERE user_id = (SELECT user_id FROM public.community_posts WHERE id = OLD.post_id);
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for post likes
CREATE TRIGGER update_post_likes_count_trigger
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_likes_count();

-- Function to update comments count
CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
    
    UPDATE public.profiles 
    SET total_comments_received = total_comments_received + 1
    WHERE user_id = (SELECT user_id FROM public.community_posts WHERE id = NEW.post_id);
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.post_id;
    
    UPDATE public.profiles 
    SET total_comments_received = GREATEST(total_comments_received - 1, 0)
    WHERE user_id = (SELECT user_id FROM public.community_posts WHERE id = OLD.post_id);
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for comments
CREATE TRIGGER update_post_comments_count_trigger
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comments_count();

-- Function to track engagement and check NFT eligibility
CREATE OR REPLACE FUNCTION public.track_engagement_activity(
  user_id UUID,
  activity_type TEXT,
  points_earned INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'
)
RETURNS TEXT[] AS $$
DECLARE
  user_stats RECORD;
  nft_reward RECORD;
  minted_names TEXT[] := '{}';
BEGIN
  -- Insert activity record
  INSERT INTO public.community_activities (user_id, activity_type, points_earned, metadata)
  VALUES (user_id, activity_type, points_earned, metadata);
  
  -- Update user points
  UPDATE public.profiles 
  SET community_points = community_points + points_earned
  WHERE profiles.user_id = track_engagement_activity.user_id;
  
  -- Update review count if it's a review
  IF activity_type = 'review' THEN
    UPDATE public.profiles 
    SET total_reviews = total_reviews + 1
    WHERE profiles.user_id = track_engagement_activity.user_id;
  END IF;
  
  -- Get updated user statistics
  SELECT 
    total_reviews,
    total_likes_received,
    total_comments_received, 
    community_points,
    reading_streak,
    total_nfts_earned
  INTO user_stats
  FROM public.profiles 
  WHERE profiles.user_id = track_engagement_activity.user_id;

  -- Check each NFT reward for eligibility
  FOR nft_reward IN 
    SELECT * FROM public.nft_rewards WHERE is_active = true
  LOOP
    -- Skip if user already has this NFT
    IF EXISTS (
      SELECT 1 FROM public.user_nfts 
      WHERE user_nfts.user_id = track_engagement_activity.user_id 
      AND nft_reward_id = nft_reward.id
    ) THEN
      CONTINUE;
    END IF;

    -- Check eligibility criteria
    IF (
      (nft_reward.mint_criteria->>'reviews_count' IS NULL OR 
       user_stats.total_reviews >= (nft_reward.mint_criteria->>'reviews_count')::INTEGER) AND
      (nft_reward.mint_criteria->>'likes_received' IS NULL OR 
       user_stats.total_likes_received >= (nft_reward.mint_criteria->>'likes_received')::INTEGER) AND
      (nft_reward.mint_criteria->>'comments_received' IS NULL OR 
       user_stats.total_comments_received >= (nft_reward.mint_criteria->>'comments_received')::INTEGER) AND
      (nft_reward.mint_criteria->>'community_points' IS NULL OR 
       user_stats.community_points >= (nft_reward.mint_criteria->>'community_points')::INTEGER) AND
      (nft_reward.mint_criteria->>'reading_streak' IS NULL OR 
       user_stats.reading_streak >= (nft_reward.mint_criteria->>'reading_streak')::INTEGER)
    ) THEN
      -- Mint the NFT
      INSERT INTO public.user_nfts (user_id, nft_reward_id, token_id)
      VALUES (
        track_engagement_activity.user_id, 
        nft_reward.id, 
        concat(extract(epoch from now()), '-', substring(gen_random_uuid()::text from 1 for 8))
      );
      
      -- Update user's NFT count
      UPDATE public.profiles 
      SET total_nfts_earned = total_nfts_earned + 1
      WHERE profiles.user_id = track_engagement_activity.user_id;
      
      -- Add to minted names
      minted_names := array_append(minted_names, nft_reward.name);
    END IF;
  END LOOP;

  RETURN minted_names;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user engagement stats
CREATE OR REPLACE FUNCTION public.get_user_engagement_stats(user_id UUID)
RETURNS TABLE(
  total_posts INTEGER,
  total_likes_given INTEGER,
  total_comments_given INTEGER,
  communities_joined INTEGER,
  engagement_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE((SELECT COUNT(*)::INTEGER FROM public.community_posts WHERE community_posts.user_id = get_user_engagement_stats.user_id), 0) as total_posts,
    COALESCE((SELECT COUNT(*)::INTEGER FROM public.post_likes WHERE post_likes.user_id = get_user_engagement_stats.user_id), 0) as total_likes_given,
    COALESCE((SELECT COUNT(*)::INTEGER FROM public.post_comments WHERE post_comments.user_id = get_user_engagement_stats.user_id), 0) as total_comments_given,
    COALESCE((SELECT COUNT(*)::INTEGER FROM public.community_memberships WHERE community_memberships.user_id = get_user_engagement_stats.user_id), 0) as communities_joined,
    COALESCE((SELECT community_points FROM public.profiles WHERE profiles.user_id = get_user_engagement_stats.user_id), 0) as engagement_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to join a community
CREATE OR REPLACE FUNCTION public.join_community(
  user_id UUID,
  community_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if already a member
  IF EXISTS (
    SELECT 1 FROM public.community_memberships 
    WHERE community_memberships.user_id = join_community.user_id 
    AND community_memberships.community_id = join_community.community_id
  ) THEN
    RETURN FALSE; -- Already a member
  END IF;
  
  -- Add membership
  INSERT INTO public.community_memberships (user_id, community_id)
  VALUES (join_community.user_id, join_community.community_id);
  
  -- Award points for joining
  UPDATE public.profiles 
  SET community_points = community_points + 25
  WHERE profiles.user_id = join_community.user_id;
  
  -- Track activity
  INSERT INTO public.community_activities (user_id, activity_type, points_earned, metadata)
  VALUES (join_community.user_id, 'join_community', 25, jsonb_build_object('community_id', join_community.community_id));
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing NFT rewards for engagement
UPDATE public.nft_rewards 
SET mint_criteria = '{"reviews_count": 10, "likes_received": 50}'
WHERE name = 'Review Master';

-- Insert new engagement-based NFT rewards
INSERT INTO public.nft_rewards (name, description, rarity, mint_criteria, redeemable_location, value_points) VALUES
('Social Butterfly', 'Get 100 likes on your posts', 'Rare', '{"likes_received": 100}', 'Online Bookstore Credits', 200),
('Discussion Starter', 'Receive 50 comments on your posts', 'Epic', '{"comments_received": 50}', 'Book Club Membership', 400),
('Community Leader', 'Join 3 communities and earn 500 points', 'Epic', '{"community_points": 500}', 'Author Meet & Greet', 600),
('Engagement Master', 'Reach 1000 community points through activity', 'Legendary', '{"community_points": 1000, "likes_received": 200}', 'Signed Book Collection', 1200)
ON CONFLICT (name) DO NOTHING;
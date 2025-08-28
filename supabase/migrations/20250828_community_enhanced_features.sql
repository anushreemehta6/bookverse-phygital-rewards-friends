-- Migration: Enhanced Community Features
-- Create community posts table (Twitter-like posts)
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('general', 'review', 'recommendation')) DEFAULT 'general',
  book_title TEXT,
  book_author TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create post comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create communities table
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color_gradient TEXT,
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community memberships
CREATE TABLE IF NOT EXISTS public.community_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  UNIQUE(community_id, user_id)
);

-- Add engagement tracking columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS total_likes_received INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_comments_received INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_shares_received INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Posts viewable by everyone" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.community_posts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Likes viewable by everyone" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Comments viewable by everyone" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Users can comment" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Communities viewable by everyone" ON public.communities FOR SELECT USING (true);
CREATE POLICY "Memberships viewable by everyone" ON public.community_memberships FOR SELECT USING (true);
CREATE POLICY "Users can join communities" ON public.community_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert sample communities
INSERT INTO public.communities (name, description, icon, color_gradient, member_count) VALUES
('Sci-Fi Universe', 'Explore futuristic worlds and science fiction', '🚀', 'from-blue-500 to-purple-600', 3420),
('Fantasy Realm', 'Magic, dragons, and epic adventures', '🐉', 'from-purple-500 to-pink-600', 4150),
('Mystery & Thriller', 'Unravel mysteries and thrillers', '🔍', 'from-red-500 to-orange-600', 2890),
('Romance Readers', 'Love stories and romantic novels', '💕', 'from-pink-500 to-rose-600', 3800)
ON CONFLICT (name) DO NOTHING;
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  wallet_address TEXT,
  bio TEXT,
  total_books_read INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_nfts_earned INTEGER DEFAULT 0,
  reading_streak INTEGER DEFAULT 0,
  community_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  genre TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create book reviews table
CREATE TABLE public.book_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Create NFT rewards table
CREATE TABLE public.nft_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  rarity TEXT NOT NULL CHECK (rarity IN ('Common', 'Rare', 'Epic', 'Legendary')),
  mint_criteria JSONB NOT NULL,
  redeemable_location TEXT,
  value_points INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user NFTs table (earned NFTs)
CREATE TABLE public.user_nfts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nft_reward_id UUID NOT NULL REFERENCES public.nft_rewards(id) ON DELETE CASCADE,
  token_id TEXT,
  is_redeemed BOOLEAN DEFAULT false,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community activities table
CREATE TABLE public.community_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('review', 'like', 'comment', 'share', 'join_community')),
  points_earned INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for books
CREATE POLICY "Books are viewable by everyone" ON public.books FOR SELECT USING (true);

-- Create RLS policies for book reviews
CREATE POLICY "Reviews are viewable by everyone" ON public.book_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create their own reviews" ON public.book_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.book_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.book_reviews FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for NFT rewards
CREATE POLICY "NFT rewards are viewable by everyone" ON public.nft_rewards FOR SELECT USING (true);

-- Create RLS policies for user NFTs
CREATE POLICY "Users can view their own NFTs" ON public.user_nfts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own NFTs" ON public.user_nfts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for community activities
CREATE POLICY "Users can view their own activities" ON public.community_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own activities" ON public.community_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_book_reviews_updated_at
  BEFORE UPDATE ON public.book_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample NFT reward criteria
INSERT INTO public.nft_rewards (name, description, rarity, mint_criteria, redeemable_location, value_points) VALUES
('Bookworm Badge', 'Read your first 5 books', 'Common', '{"books_read": 5}', 'Virtual Badge', 100),
('Review Master', 'Write 10 quality reviews', 'Rare', '{"reviews_count": 10, "avg_likes": 3}', 'Local Bookstore Discount', 250),
('Genre Explorer', 'Read books from 5 different genres', 'Epic', '{"unique_genres": 5}', 'Premium Book Club Access', 500),
('Community Champion', 'Earn 1000 community points', 'Epic', '{"community_points": 1000}', 'Exclusive Author Meet', 750),
('Reading Streak Legend', 'Maintain 30-day reading streak', 'Legendary', '{"reading_streak": 30}', 'Signed First Edition', 1000);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'display_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
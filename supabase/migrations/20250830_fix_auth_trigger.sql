-- Fix authentication and profile creation
-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle new user signup with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_to_use TEXT;
  display_name_to_use TEXT;
BEGIN
  -- Extract username and display_name from metadata
  username_to_use := NEW.raw_user_meta_data->>'username';
  display_name_to_use := NEW.raw_user_meta_data->>'display_name';
  
  -- If username is not provided, use email prefix
  IF username_to_use IS NULL OR username_to_use = '' THEN
    username_to_use := split_part(NEW.email, '@', 1);
  END IF;
  
  -- If display_name is not provided, use username
  IF display_name_to_use IS NULL OR display_name_to_use = '' THEN
    display_name_to_use := username_to_use;
  END IF;
  
  -- Clean username (lowercase, no spaces)
  username_to_use := lower(trim(username_to_use));
  
  -- Insert profile with conflict handling
  BEGIN
    INSERT INTO public.profiles (
      user_id, 
      username, 
      display_name,
      total_books_read,
      total_reviews,
      total_nfts_earned,
      reading_streak,
      community_points,
      total_likes_received,
      total_comments_received,
      total_shares_received
    )
    VALUES (
      NEW.id,
      username_to_use,
      display_name_to_use,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    );
  EXCEPTION
    WHEN unique_violation THEN
      -- If username already exists, append user id suffix
      INSERT INTO public.profiles (
        user_id, 
        username, 
        display_name,
        total_books_read,
        total_reviews,
        total_nfts_earned,
        reading_streak,
        community_points,
        total_likes_received,
        total_comments_received,
        total_shares_received
      )
      VALUES (
        NEW.id,
        username_to_use || '_' || substring(NEW.id::text, 1, 8),
        display_name_to_use,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      );
  END;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't prevent user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add missing columns to profiles table if they don't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_likes_received INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_comments_received INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_shares_received INTEGER DEFAULT 0;
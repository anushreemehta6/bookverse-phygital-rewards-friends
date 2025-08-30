-- Create reading activities table for streak tracking
CREATE TABLE IF NOT EXISTS public.reading_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('reading', 'review', 'book_finished')),
  book_title TEXT,
  pages_read INTEGER,
  reading_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint to prevent duplicate activities per day per user
ALTER TABLE public.reading_activities ADD CONSTRAINT unique_user_daily_activity 
UNIQUE (user_id, activity_date);

-- Add indexes for performance
CREATE INDEX idx_reading_activities_user_date ON public.reading_activities(user_id, activity_date DESC);
CREATE INDEX idx_reading_activities_date ON public.reading_activities(activity_date DESC);

-- Add new columns to profiles table for streak tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_reading_days INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE public.reading_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own activities" ON public.reading_activities 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" ON public.reading_activities 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities" ON public.reading_activities 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities" ON public.reading_activities 
FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_reading_activities_updated_at
  BEFORE UPDATE ON public.reading_activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get reading streak statistics
CREATE OR REPLACE FUNCTION public.get_reading_streak_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  activity_dates DATE[];
  current_streak INTEGER := 0;
  longest_streak INTEGER := 0;
  temp_streak INTEGER := 0;
  total_days INTEGER := 0;
  last_activity DATE;
  current_date DATE := CURRENT_DATE;
  prev_date DATE;
  day_diff INTEGER;
  result JSON;
BEGIN
  -- Get all unique activity dates for the user
  SELECT ARRAY_AGG(DISTINCT activity_date ORDER BY activity_date DESC) 
  INTO activity_dates
  FROM public.reading_activities 
  WHERE user_id = user_uuid;

  -- If no activities, return zeros
  IF activity_dates IS NULL OR array_length(activity_dates, 1) = 0 THEN
    RETURN json_build_object(
      'current_streak', 0,
      'longest_streak', 0,
      'total_reading_days', 0,
      'last_activity_date', NULL
    );
  END IF;

  total_days := array_length(activity_dates, 1);
  last_activity := activity_dates[1];

  -- Calculate current streak
  FOR i IN 1..array_length(activity_dates, 1) LOOP
    IF activity_dates[i] = current_date THEN
      current_streak := current_streak + 1;
      current_date := current_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
  END LOOP;

  -- Calculate longest streak
  temp_streak := 1;
  prev_date := activity_dates[1];
  
  FOR i IN 2..array_length(activity_dates, 1) LOOP
    day_diff := prev_date - activity_dates[i];
    
    IF day_diff = 1 THEN
      temp_streak := temp_streak + 1;
    ELSE
      longest_streak := GREATEST(longest_streak, temp_streak);
      temp_streak := 1;
    END IF;
    
    prev_date := activity_dates[i];
  END LOOP;
  
  longest_streak := GREATEST(longest_streak, temp_streak);

  RETURN json_build_object(
    'current_streak', current_streak,
    'longest_streak', longest_streak,
    'total_reading_days', total_days,
    'last_activity_date', last_activity
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample data for testing (optional - remove in production)
-- INSERT INTO public.reading_activities (user_id, activity_date, activity_type, book_title, pages_read, reading_minutes) 
-- VALUES 
-- ('user-id-here', CURRENT_DATE, 'reading', 'Sample Book', 50, 60),
-- ('user-id-here', CURRENT_DATE - INTERVAL '1 day', 'reading', 'Another Book', 30, 45);
-- Create function to increment user NFT count
CREATE OR REPLACE FUNCTION public.increment_user_nfts(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles 
  SET total_nfts_earned = total_nfts_earned + 1
  WHERE profiles.user_id = increment_user_nfts.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to add community points
CREATE OR REPLACE FUNCTION public.add_community_points(user_id UUID, points INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles 
  SET community_points = community_points + points
  WHERE profiles.user_id = add_community_points.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update reading statistics
CREATE OR REPLACE FUNCTION public.update_reading_stats(
  user_id UUID,
  books_increment INTEGER DEFAULT 0,
  reviews_increment INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    total_books_read = total_books_read + books_increment,
    total_reviews = total_reviews + reviews_increment,
    reading_streak = COALESCE(streak_days, reading_streak)
  WHERE profiles.user_id = update_reading_stats.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample books for demo
INSERT INTO public.books (title, author, genre, description, cover_image_url) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', 'Classic Fiction', 'A classic American novel about the Jazz Age', '/placeholder.svg'),
('To Kill a Mockingbird', 'Harper Lee', 'Classic Fiction', 'A gripping tale of racial injustice and childhood innocence', '/placeholder.svg'),
('1984', 'George Orwell', 'Dystopian Fiction', 'A dystopian social science fiction novel', '/placeholder.svg'),
('Pride and Prejudice', 'Jane Austen', 'Romance', 'A romantic novel of manners', '/placeholder.svg'),
('The Catcher in the Rye', 'J.D. Salinger', 'Coming of Age', 'A controversial novel about teenage rebellion', '/placeholder.svg'),
('Harry Potter and the Sorcerer\'s Stone', 'J.K. Rowling', 'Fantasy', 'The first book in the magical Harry Potter series', '/placeholder.svg'),
('The Lord of the Rings', 'J.R.R. Tolkien', 'Fantasy', 'An epic fantasy adventure', '/placeholder.svg'),
('Dune', 'Frank Herbert', 'Science Fiction', 'A science fiction epic set on a desert planet', '/placeholder.svg'),
('The Handmaid\'s Tale', 'Margaret Atwood', 'Dystopian Fiction', 'A dystopian novel about reproductive rights', '/placeholder.svg'),
('Sapiens', 'Yuval Noah Harari', 'Non-Fiction', 'A brief history of humankind', '/placeholder.svg');